#!/usr/bin/env node

/**
 * @packageDocumentation
 * Run a checksum-verified actionlint release binary on supported platforms.
 */
// @ts-check

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
    chmod,
    mkdir,
    mkdtemp,
    readFile,
    rename,
    rm,
    writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve, win32 } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

export const ACTIONLINT_VERSION = "1.7.12";

const ACTIONLINT_RELEASE_BASE_URL = `https://github.com/rhysd/actionlint/releases/download/v${ACTIONLINT_VERSION}`;
const DOWNLOAD_ATTEMPTS = 3;
const DOWNLOAD_TIMEOUT_MS = 60_000;

/**
 * These values come from the official GitHub release metadata for actionlint
 * v1.7.12. Keeping the byte size and digest beside the asset name makes a
 * truncated, substituted, or mutable download fail closed before extraction.
 */
const ACTIONLINT_ASSETS = Object.freeze({
    "darwin/arm64": Object.freeze({
        filename: "actionlint_1.7.12_darwin_arm64.tar.gz",
        sha256: "aba9ced2dee8d27fecca3dc7feb1a7f9a52caefa1eb46f3271ea66b6e0e6953f",
        size: 2_164_202,
    }),
    "darwin/x64": Object.freeze({
        filename: "actionlint_1.7.12_darwin_amd64.tar.gz",
        sha256: "5b44c3bc2255115c9b69e30efc0fecdf498fdb63c5d58e17084fd5f16324c644",
        size: 2_355_828,
    }),
    "linux/arm64": Object.freeze({
        filename: "actionlint_1.7.12_linux_arm64.tar.gz",
        sha256: "325e971b6ba9bfa504672e29be93c24981eeb1c07576d730e9f7c8805afff0c6",
        size: 2_111_482,
    }),
    "linux/x64": Object.freeze({
        filename: "actionlint_1.7.12_linux_amd64.tar.gz",
        sha256: "8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8",
        size: 2_353_908,
    }),
    "win32/arm64": Object.freeze({
        filename: "actionlint_1.7.12_windows_arm64.zip",
        sha256: "cadcf7ea4efe3a68728893813643cebe1185e5b1d4be5b96245f65c9a4d5ea41",
        size: 2_200_159,
    }),
    "win32/x64": Object.freeze({
        filename: "actionlint_1.7.12_windows_amd64.zip",
        sha256: "6e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9",
        size: 2_479_065,
    }),
});

/** @typedef {(typeof ACTIONLINT_ASSETS)[keyof typeof ACTIONLINT_ASSETS]} ActionlintAsset */

/**
 * @param {Readonly<{
 *     arch?: string | undefined;
 *     platform?: string | undefined;
 * }>} [input]
 *
 * @returns {ActionlintAsset}
 */
export function getActionlintAsset({
    arch = process.arch,
    platform = process.platform,
} = {}) {
    const key = `${platform}/${arch}`;

    if (!Object.hasOwn(ACTIONLINT_ASSETS, key)) {
        throw new Error(
            `actionlint ${ACTIONLINT_VERSION} is not pinned for ${key}. ` +
                `Supported platforms: ${Object.keys(ACTIONLINT_ASSETS).join(", ")}.`
        );
    }

    return ACTIONLINT_ASSETS[
        /** @type {keyof typeof ACTIONLINT_ASSETS} */ (key)
    ];
}

/** @param {Uint8Array} payload */
export const calculateSha256 = (payload) =>
    createHash("sha256").update(payload).digest("hex");

/**
 * @param {ActionlintAsset} asset
 * @param {Uint8Array} payload
 */
export function verifyAssetPayload(asset, payload) {
    if (payload.byteLength !== asset.size) {
        throw new Error(
            `Downloaded ${asset.filename} has ${String(payload.byteLength)} bytes; expected ${String(asset.size)}.`
        );
    }

    const actualSha256 = calculateSha256(payload);

    if (actualSha256 !== asset.sha256) {
        throw new Error(
            `Downloaded ${asset.filename} has SHA-256 ${actualSha256}; expected ${asset.sha256}.`
        );
    }
}

/** @param {number} milliseconds */
const delay = (milliseconds) =>
    new Promise((resolvePromise) => {
        setTimeout(resolvePromise, milliseconds);
    });

/**
 * @param {ActionlintAsset} asset
 * @param {string} archivePath
 */
async function downloadArchive(asset, archivePath) {
    const url = `${ACTIONLINT_RELEASE_BASE_URL}/${asset.filename}`;
    /** @type {unknown} */
    let lastError;

    for (let attempt = 1; attempt <= DOWNLOAD_ATTEMPTS; attempt += 1) {
        try {
            const response = await fetch(url, {
                headers: {
                    Accept: "application/octet-stream",
                    "User-Agent": "stylelint-plugin-font-release-tooling",
                },
                redirect: "follow",
                signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS),
            });

            if (!response.ok) {
                throw new Error(
                    `Download failed with HTTP ${String(response.status)} ${response.statusText}.`
                );
            }

            if (new URL(response.url).protocol !== "https:") {
                throw new Error(
                    `Refusing non-HTTPS actionlint response URL: ${response.url}`
                );
            }

            const payload = new Uint8Array(await response.arrayBuffer());

            verifyAssetPayload(asset, payload);

            const temporaryArchivePath = `${archivePath}.${String(process.pid)}.${String(Date.now())}.tmp`;

            try {
                await writeFile(temporaryArchivePath, payload, { flag: "wx" });
                await rm(archivePath, { force: true });
                await rename(temporaryArchivePath, archivePath);
            } finally {
                await rm(temporaryArchivePath, { force: true });
            }

            return;
        } catch (error) {
            lastError = error;

            if (attempt < DOWNLOAD_ATTEMPTS) {
                await delay(attempt * 1_000);
            }
        }
    }

    throw new Error(
        `Could not download verified actionlint ${ACTIONLINT_VERSION} after ${String(DOWNLOAD_ATTEMPTS)} attempts.`,
        { cause: lastError }
    );
}

/**
 * @param {ActionlintAsset} asset
 * @param {string} archivePath
 */
async function ensureVerifiedArchive(asset, archivePath) {
    try {
        const cachedPayload = await readFile(archivePath);

        verifyAssetPayload(asset, cachedPayload);
    } catch {
        await rm(archivePath, { force: true });
        await downloadArchive(asset, archivePath);
    }
}

/**
 * @param {string} command
 * @param {readonly string[]} arguments_
 */
function runCheckedCommand(command, arguments_) {
    const result = spawnSync(command, arguments_, {
        encoding: "utf8",
        shell: false,
        windowsHide: true,
    });

    if (result.error !== undefined) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(
            `${command} ${arguments_.join(" ")} failed with exit code ${String(result.status)}: ${(result.stderr || result.stdout).trim()}`
        );
    }

    return `${result.stdout}${result.stderr}`;
}

/**
 * Git for Windows prepends its own GNU tar to PATH when a workflow uses Bash.
 * That binary interprets a drive-letter path as a remote archive (`C:...`).
 * Select Windows' built-in bsdtar explicitly so absolute paths stay local.
 *
 * @param {Readonly<{
 *     environment?: NodeJS.ProcessEnv | undefined;
 *     platform?: string | undefined;
 * }>} [input]
 */
export function getTarCommand({
    environment = process.env,
    platform = process.platform,
} = {}) {
    if (platform !== "win32") {
        return "tar";
    }

    const windowsRoot = environment["SystemRoot"] ?? environment["WINDIR"];

    if (windowsRoot === undefined || windowsRoot === "") {
        throw new Error(
            "SystemRoot or WINDIR is required to locate Windows bsdtar."
        );
    }

    return win32.join(windowsRoot, "System32", "tar.exe");
}

/** @param {string} binaryPath */
export function verifyActionlintVersion(binaryPath) {
    const output = runCheckedCommand(binaryPath, ["-version"]);
    const versionPattern = new RegExp(
        String.raw`(?:^|\s)${ACTIONLINT_VERSION.replaceAll(".", String.raw`\.`)}(?:\s|$)`,
        "u"
    );

    if (!versionPattern.test(output)) {
        throw new Error(
            `Expected actionlint ${ACTIONLINT_VERSION}, but ${binaryPath} reported: ${output.trim()}`
        );
    }
}

/**
 * @param {Readonly<{
 *     arch?: string | undefined;
 *     cacheDirectoryPath?: string | undefined;
 *     environment?: NodeJS.ProcessEnv | undefined;
 *     platform?: string | undefined;
 * }>} [input]
 */
export async function prepareActionlint({
    arch = process.arch,
    cacheDirectoryPath = join(
        tmpdir(),
        "stylelint-plugin-font-actionlint-cache"
    ),
    environment = process.env,
    platform = process.platform,
} = {}) {
    const configuredBinaryPath = environment["ACTIONLINT_BIN"];

    if (configuredBinaryPath !== undefined && configuredBinaryPath !== "") {
        const binaryPath = resolve(configuredBinaryPath);

        verifyActionlintVersion(binaryPath);
        return Object.freeze({ binaryPath, cleanup: async () => {} });
    }

    const asset = getActionlintAsset({ arch, platform });
    await mkdir(cacheDirectoryPath, { recursive: true });

    const archivePath = join(cacheDirectoryPath, asset.filename);

    await ensureVerifiedArchive(asset, archivePath);

    const extractionDirectoryPath = await mkdtemp(
        join(cacheDirectoryPath, `extracted-${platform}-${arch}-`)
    );
    const binaryName = platform === "win32" ? "actionlint.exe" : "actionlint";
    const binaryPath = join(extractionDirectoryPath, binaryName);

    try {
        runCheckedCommand(getTarCommand({ environment, platform }), [
            "-xf",
            archivePath,
            "-C",
            extractionDirectoryPath,
            binaryName,
        ]);

        if (platform !== "win32") {
            await chmod(binaryPath, 0o755);
        }

        verifyActionlintVersion(binaryPath);
    } catch (error) {
        await rm(extractionDirectoryPath, { force: true, recursive: true });
        throw new Error(
            `Could not prepare ${basename(asset.filename)}. Ensure a compatible tar executable is available.`,
            { cause: error }
        );
    }

    return Object.freeze({
        binaryPath,
        cleanup: () =>
            rm(extractionDirectoryPath, { force: true, recursive: true }),
    });
}

/** @param {readonly string[]} [arguments_] */
export async function runActionlint(arguments_ = process.argv.slice(2)) {
    const prepared = await prepareActionlint();

    try {
        return await new Promise((resolvePromise, rejectPromise) => {
            const child = spawn(prepared.binaryPath, arguments_, {
                shell: false,
                stdio: "inherit",
                windowsHide: true,
            });

            child.once("error", rejectPromise);
            child.once("exit", (code, signal) => {
                if (signal !== null) {
                    rejectPromise(
                        new Error(
                            `actionlint terminated from signal ${signal}.`
                        )
                    );
                    return;
                }

                resolvePromise(code ?? 1);
            });
        });
    } finally {
        await prepared.cleanup();
    }
}

/**
 * @param {Readonly<{
 *     argvEntry?: string | undefined;
 *     currentImportUrl?: string | undefined;
 * }>} [input]
 */
export const isDirectExecution = ({
    argvEntry = process.argv[1] ?? "",
    currentImportUrl = import.meta.url,
} = {}) => pathToFileURL(resolve(argvEntry)).href === currentImportUrl;

if (isDirectExecution()) {
    try {
        process.exitCode = await runActionlint();
    } catch (error) {
        console.error("actionlint failed:", error);
        process.exitCode = 1;
    }
}

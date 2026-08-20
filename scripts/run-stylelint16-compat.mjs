#!/usr/bin/env node

/**
 * @packageDocumentation
 * Pack the plugin and verify it in an isolated Stylelint 16 consumer project.
 */
// @ts-check

import { copyFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

import { parseNpmPackFilename } from "./read-npm-pack-filename.mjs";

const scriptsDirectoryPath = dirname(fileURLToPath(import.meta.url));
const repositoryRootPath = resolve(scriptsDirectoryPath, "..");
const stylelintCompatSmokeScriptPath = join(
    scriptsDirectoryPath,
    "stylelint-compat-smoke.mjs"
);

/**
 * @typedef {Readonly<{
 *     args: readonly string[];
 *     command: string;
 *     cwd: string;
 *     shell: boolean;
 * }>} CommandSpec
 */

/** @param {string} value */
const isWindowsAbsolutePath = (value) => /^[A-Za-z]:[\\/]/u.test(value);

/** @param {string} filePath */
const toFileHref = (filePath) => {
    if (isWindowsAbsolutePath(filePath)) {
        return new URL(`file:///${filePath.replaceAll("\\", "/")}`).href;
    }

    return pathToFileURL(resolve(filePath)).href;
};

/**
 * @param {Readonly<{
 *     argvEntry?: string | undefined;
 *     currentImportUrl: string;
 * }>} input
 */
export const isDirectExecution = ({ argvEntry, currentImportUrl }) =>
    typeof argvEntry === "string" && toFileHref(argvEntry) === currentImportUrl;

/** @param {string} [platform] */
export const getNpmCommand = (platform = process.platform) =>
    platform === "win32" ? "npm.cmd" : "npm";

/** @param {NodeJS.ProcessEnv} [environment] */
export const getWindowsCommandShell = (environment = process.env) =>
    environment["ComSpec"] ?? environment["COMSPEC"] ?? "cmd.exe";

/**
 * @param {string} tarballPath
 *
 * @returns {Readonly<Record<string, unknown>>}
 */
export const createConsumerManifest = (tarballPath) => ({
    dependencies: {
        "stylelint-plugin-font": pathToFileURL(resolve(tarballPath)).href,
        stylelint: "^16.0.0",
    },
    name: "stylelint-plugin-font-stylelint16-consumer",
    private: true,
    type: "module",
});

/**
 * @param {Readonly<{
 *     consumerDirectoryPath: string;
 *     consumerSmokeScriptPath: string;
 *     nodeCommand?: string | undefined;
 *     npmCommand?: string | undefined;
 *     platform?: string | undefined;
 *     repositoryRootPath?: string | undefined;
 * }>} input
 *
 * @returns {readonly CommandSpec[]}
 */
export const createCompatibilityCheckCommands = ({
    consumerDirectoryPath,
    consumerSmokeScriptPath,
    nodeCommand = process.execPath,
    npmCommand = getNpmCommand(),
    platform = process.platform,
    repositoryRootPath: targetRepositoryRootPath = repositoryRootPath,
}) => {
    const shell = platform === "win32";

    return [
        {
            args: ["run", "build"],
            command: npmCommand,
            cwd: targetRepositoryRootPath,
            shell,
        },
        {
            args: [
                "install",
                "--no-audit",
                "--no-fund",
            ],
            command: npmCommand,
            cwd: consumerDirectoryPath,
            shell,
        },
        {
            args: [consumerSmokeScriptPath, "--expect-stylelint-major=16"],
            command: nodeCommand,
            cwd: consumerDirectoryPath,
            shell: false,
        },
    ];
};

/**
 * Execute one child process synchronously and fail on a non-zero exit.
 *
 * @param {CommandSpec} input
 * @param {Readonly<{
 *     captureStdout?: boolean | undefined;
 *     windowsCommandShell?: string | undefined;
 * }>} [options]
 *
 * @returns {string}
 */
export function runCommand(
    { args, command, cwd, shell },
    {
        captureStdout = false,
        windowsCommandShell = getWindowsCommandShell(),
    } = {}
) {
    const childProcessEnvironment = Object.fromEntries(
        Object.entries(process.env).filter(
            ([name]) => name.toLowerCase() !== "npm_config_allow_scripts"
        )
    );
    const standardIo = captureStdout
        ? [
              "inherit",
              "pipe",
              "inherit",
          ]
        : "inherit";
    const result =
        process.platform === "win32" && shell
            ? spawnSync(
                  windowsCommandShell,
                  [
                      "/d",
                      "/s",
                      "/c",
                      command,
                      ...args,
                  ],
                  {
                      cwd,
                      encoding: "utf8",
                      env: childProcessEnvironment,
                      shell: false,
                      stdio: standardIo,
                      windowsHide: true,
                  }
              )
            : spawnSync(command, args, {
                  cwd,
                  encoding: "utf8",
                  env: childProcessEnvironment,
                  shell: false,
                  stdio: standardIo,
                  windowsHide: true,
              });

    if (result.error !== undefined) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(
            `Command failed (${String(result.status)}): ${command} ${args.join(" ")}`
        );
    }

    return typeof result.stdout === "string" ? result.stdout : "";
}

/**
 * @param {Readonly<{
 *     copyFileFn?: typeof copyFile | undefined;
 *     mkdtempFn?: typeof mkdtemp | undefined;
 *     nodeCommand?: string | undefined;
 *     npmCommand?: string | undefined;
 *     platform?: string | undefined;
 *     repositoryRootPath?: string | undefined;
 *     rmFn?: typeof rm | undefined;
 *     runCommandFn?: typeof runCommand | undefined;
 *     smokeScriptPath?: string | undefined;
 *     tempRootPath?: string | undefined;
 *     windowsCommandShell?: string | undefined;
 *     writeFileFn?: typeof writeFile | undefined;
 * }>} [input]
 */
export async function runStylelint16Compat({
    copyFileFn = copyFile,
    mkdtempFn = mkdtemp,
    nodeCommand = process.execPath,
    npmCommand = getNpmCommand(),
    platform = process.platform,
    repositoryRootPath: targetRepositoryRootPath = repositoryRootPath,
    rmFn = rm,
    runCommandFn = runCommand,
    smokeScriptPath = stylelintCompatSmokeScriptPath,
    tempRootPath = tmpdir(),
    windowsCommandShell = getWindowsCommandShell(),
    writeFileFn = writeFile,
} = {}) {
    const consumerDirectoryPath = await mkdtempFn(
        join(tempRootPath, "stylelint-plugin-font-stylelint16-consumer-")
    );
    const consumerSmokeScriptPath = join(
        consumerDirectoryPath,
        "stylelint-compat-smoke.mjs"
    );

    try {
        const commands = createCompatibilityCheckCommands({
            consumerDirectoryPath,
            consumerSmokeScriptPath,
            nodeCommand,
            npmCommand,
            platform,
            repositoryRootPath: targetRepositoryRootPath,
        });
        const [buildCommand, ...consumerCommands] = commands;

        if (buildCommand === undefined) {
            throw new Error(
                "The Stylelint compatibility build command is missing."
            );
        }

        runCommandFn(buildCommand, { windowsCommandShell });

        const packMetadata = runCommandFn(
            {
                args: [
                    "pack",
                    "--json",
                    "--pack-destination",
                    consumerDirectoryPath,
                ],
                command: npmCommand,
                cwd: targetRepositoryRootPath,
                shell: platform === "win32",
            },
            { captureStdout: true, windowsCommandShell }
        );
        const tarballFilename = parseNpmPackFilename(packMetadata);
        const tarballPath = join(consumerDirectoryPath, tarballFilename);

        await Promise.all([
            copyFileFn(smokeScriptPath, consumerSmokeScriptPath),
            writeFileFn(
                join(consumerDirectoryPath, "package.json"),
                `${JSON.stringify(createConsumerManifest(tarballPath), null, 2)}\n`,
                "utf8"
            ),
        ]);

        for (const command of consumerCommands) {
            runCommandFn(command, { windowsCommandShell });
        }
    } finally {
        await rmFn(consumerDirectoryPath, { force: true, recursive: true });
    }
}

export async function runCli() {
    await runStylelint16Compat();
}

if (
    isDirectExecution({
        argvEntry: process.argv[1],
        currentImportUrl: import.meta.url,
    })
) {
    try {
        await runCli();
    } catch (error) {
        console.error("Stylelint 16 compatibility check failed:", error);
        process.exitCode = 1;
    }
}

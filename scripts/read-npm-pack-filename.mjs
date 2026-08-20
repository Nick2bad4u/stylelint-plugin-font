#!/usr/bin/env node

/**
 * @packageDocumentation
 * Normalize the npm 11 array and npm 12 object forms of `npm pack --json`.
 */
// @ts-check

import { readFile } from "node:fs/promises";
import process from "node:process";
import { pathToFileURL } from "node:url";

/** @param {unknown} value */
const isRecord = (value) =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * @param {unknown} metadata
 *
 * @returns {readonly unknown[]}
 */
const normalizePackEntries = (metadata) => {
    if (Array.isArray(metadata)) {
        return metadata;
    }

    if (!isRecord(metadata)) {
        throw new TypeError("npm pack metadata must be an array or object.");
    }

    if (Object.hasOwn(metadata, "filename")) {
        return [metadata];
    }

    return Object.values(metadata);
};

/**
 * @param {unknown} metadata
 *
 * @returns {string}
 */
export function readNpmPackFilename(metadata) {
    const entries = normalizePackEntries(metadata);

    if (entries.length !== 1) {
        throw new Error(
            `Expected exactly one npm pack result, received ${entries.length}.`
        );
    }

    const [entry] = entries;

    if (!isRecord(entry)) {
        throw new TypeError("The npm pack result must be an object.");
    }

    const filename = entry["filename"];

    if (typeof filename !== "string" || filename.length === 0) {
        throw new TypeError(
            "The npm pack result must contain a non-empty filename."
        );
    }

    if (
        filename === "." ||
        filename === ".." ||
        filename.includes("/") ||
        filename.includes("\\") ||
        filename.includes("\0")
    ) {
        throw new Error(
            `Refusing unsafe npm pack filename: ${JSON.stringify(filename)}.`
        );
    }

    return filename;
}

/**
 * @param {string} metadataText
 *
 * @returns {string}
 */
export function parseNpmPackFilename(metadataText) {
    if (metadataText.trim().length === 0) {
        throw new Error("npm pack metadata is empty.");
    }

    return readNpmPackFilename(JSON.parse(metadataText));
}

/** @param {readonly string[]} [argv] */
export async function runCli(argv = process.argv.slice(2)) {
    const [metadataPath, ...extraArguments] = argv;

    if (metadataPath === undefined || extraArguments.length > 0) {
        throw new Error(
            "Usage: node scripts/read-npm-pack-filename.mjs <npm-pack-json-path>"
        );
    }

    const metadataText = await readFile(metadataPath, "utf8");
    process.stdout.write(parseNpmPackFilename(metadataText));
}

if (
    process.argv[1] !== undefined &&
    import.meta.url === pathToFileURL(process.argv[1]).href
) {
    try {
        await runCli();
    } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
    }
}

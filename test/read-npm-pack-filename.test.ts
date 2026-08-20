import { describe, expect, it } from "vitest";

import {
    parseNpmPackFilename,
    readNpmPackFilename,
} from "../scripts/read-npm-pack-filename.mjs";

describe("npm pack filename normalization", () => {
    it("reads the npm 11 array form", () => {
        expect.assertions(1);
        expect(readNpmPackFilename([{ filename: "package-1.0.0.tgz" }])).toBe(
            "package-1.0.0.tgz"
        );
    });

    it("reads the npm 12 package-keyed object form", () => {
        expect.assertions(1);
        expect(
            readNpmPackFilename({
                package: { filename: "package-1.0.0.tgz" },
            })
        ).toBe("package-1.0.0.tgz");
    });

    it("reads a direct metadata object", () => {
        expect.assertions(1);
        expect(readNpmPackFilename({ filename: "package-1.0.0.tgz" })).toBe(
            "package-1.0.0.tgz"
        );
    });

    it.each([
        [[], "received 0"],
        [
            {
                first: { filename: "first.tgz" },
                second: { filename: "second.tgz" },
            },
            "received 2",
        ],
    ])("rejects a non-singleton result %#", (metadata, message) => {
        expect.assertions(1);
        expect(() => {
            readNpmPackFilename(metadata);
        }).toThrow(message);
    });

    it.each([
        "../package.tgz",
        "nested/package.tgz",
        String.raw`nested\package.tgz`,
    ])("rejects the unsafe filename %s", (filename) => {
        expect.assertions(1);
        expect(() => {
            readNpmPackFilename({ filename });
        }).toThrow("Refusing unsafe npm pack filename");
    });

    it("rejects empty output", () => {
        expect.assertions(1);
        expect(() => {
            parseNpmPackFilename("  \n");
        }).toThrow("npm pack metadata is empty");
    });
});

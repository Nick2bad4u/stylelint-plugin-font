import { describe, expect, it, vi } from "vitest";

import { transformManifest } from "../.npm-extension.mjs";

describe("npm manifest extension", () => {
    it("widens only Madge 8.0.0's stale TypeScript peer", () => {
        expect.assertions(2);

        const log = vi.fn<(message: string) => void>();
        const manifest = {
            name: "madge",
            peerDependencies: { typescript: "^5.4.4" },
            version: "8.0.0",
        };

        expect(transformManifest(manifest, { log })).toStrictEqual({
            name: "madge",
            peerDependencies: { typescript: "^5.4.4 || ^6.0.3" },
            version: "8.0.0",
        });
        expect(log).toHaveBeenCalledExactlyOnceWith(
            "Extended madge@8.0.0's optional TypeScript peer through TypeScript 6."
        );
    });

    it("leaves unrelated manifests unchanged", () => {
        expect.assertions(2);

        const log = vi.fn<(message: string) => void>();
        const manifest = {
            name: "another-package",
            peerDependencies: { typescript: "^5.4.4" },
            version: "8.0.0",
        };

        expect(transformManifest(manifest, { log })).toBe(manifest);
        expect(log).not.toHaveBeenCalled();
    });

    it("fails closed when Madge's expected metadata changes", () => {
        expect.assertions(2);

        const log = vi.fn<(message: string) => void>();
        const manifest = {
            name: "madge",
            peerDependencies: { typescript: "^6.0.0" },
            version: "8.0.0",
        };

        expect(() => {
            transformManifest(manifest, { log });
        }).toThrow("Madge 8.0.0 peer metadata changed");
        expect(log).not.toHaveBeenCalled();
    });
});

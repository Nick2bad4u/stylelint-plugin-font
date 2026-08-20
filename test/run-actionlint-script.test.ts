import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
    ACTIONLINT_VERSION,
    calculateSha256,
    getActionlintAsset,
    isDirectExecution,
    verifyAssetPayload,
} from "../scripts/run-actionlint.mjs";

describe("run-actionlint script", () => {
    it("selects immutable release assets for supported runner platforms", () => {
        expect.assertions(7);

        expect(ACTIONLINT_VERSION).toBe("1.7.12");
        expect(
            getActionlintAsset({ arch: "x64", platform: "linux" })
        ).toStrictEqual({
            filename: "actionlint_1.7.12_linux_amd64.tar.gz",
            sha256: "8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8",
            size: 2_353_908,
        });
        expect(
            getActionlintAsset({ arch: "arm64", platform: "darwin" })
        ).toStrictEqual({
            filename: "actionlint_1.7.12_darwin_arm64.tar.gz",
            sha256: "aba9ced2dee8d27fecca3dc7feb1a7f9a52caefa1eb46f3271ea66b6e0e6953f",
            size: 2_164_202,
        });
        expect(
            getActionlintAsset({ arch: "x64", platform: "win32" })
        ).toStrictEqual({
            filename: "actionlint_1.7.12_windows_amd64.zip",
            sha256: "6e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9",
            size: 2_479_065,
        });
        expect(() => {
            getActionlintAsset({ arch: "s390x", platform: "linux" });
        }).toThrow(/not pinned for linux\/s390x/v);
        expect(() => {
            getActionlintAsset({ arch: "x64", platform: "aix" });
        }).toThrow(/not pinned for aix\/x64/v);
        expect(() => getActionlintAsset({ platform: "linux" })).not.toThrow();
    });

    it("rejects payloads whose size or digest differs from release metadata", () => {
        expect.assertions(4);

        const encoder = new TextEncoder();
        const payload = encoder.encode("verified payload");
        const asset = {
            filename: "actionlint-test.tar.gz",
            sha256: calculateSha256(payload),
            size: payload.byteLength,
        };

        expect(() => {
            verifyAssetPayload(asset, payload);
        }).not.toThrow();
        expect(calculateSha256(payload)).toBe(
            "3aac0a1146ffe55bac7c05f61401fb1e7e4e6a94110b91585c646fe8cf745f28"
        );
        expect(() => {
            verifyAssetPayload({ ...asset, size: asset.size + 1 }, payload);
        }).toThrow(/bytes; expected/v);
        expect(() => {
            verifyAssetPayload({ ...asset, sha256: "0".repeat(64) }, payload);
        }).toThrow(/SHA-256/v);
    });

    it("distinguishes imports from direct CLI execution", () => {
        expect.assertions(2);

        const scriptUrlObject = new URL(
            "../scripts/run-actionlint.mjs",
            import.meta.url
        );
        const scriptUrl = scriptUrlObject.href;
        const scriptPath = fileURLToPath(scriptUrl);

        expect(
            isDirectExecution({
                argvEntry: scriptPath,
                currentImportUrl: scriptUrl,
            })
        ).toBe(true);
        expect(
            isDirectExecution({
                argvEntry: "",
                currentImportUrl: scriptUrl,
            })
        ).toBe(false);
    });
});

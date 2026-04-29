import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { lintWithConfig } from "./_internal/stylelint-test-helpers";

describe("font/no-missing-font-file", () => {
    it("accepts existing local font files resolved from the stylesheet path", async () => {
        expect.hasAssertions();

        const tempRoot = await mkdtemp(
            path.join(tmpdir(), "stylelint-plugin-font-")
        );

        try {
            const cssDir = path.join(tempRoot, "styles");
            const fontsDir = path.join(tempRoot, "fonts");
            const cssPath = path.join(cssDir, "app.css");
            const fontPath = path.join(fontsDir, "inter.woff2");

            await mkdir(cssDir, { recursive: true });
            await mkdir(fontsDir, { recursive: true });
            await writeFile(fontPath, "fixture-font-file", "utf8");

            const result = await lintWithConfig({
                code: '@font-face{font-family:"Inter";src:url("../fonts/inter.woff2") format("woff2");}',
                codeFilename: cssPath,
                config: {
                    rules: {
                        "font/no-missing-font-file": true,
                    },
                },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(0);
        } finally {
            await rm(tempRoot, { force: true, recursive: true });
        }
    });

    it("reports missing local font files", async () => {
        expect.hasAssertions();

        const tempRoot = await mkdtemp(
            path.join(tmpdir(), "stylelint-plugin-font-")
        );

        try {
            const cssDir = path.join(tempRoot, "styles");
            const cssPath = path.join(cssDir, "app.css");

            await mkdir(cssDir, { recursive: true });

            const result = await lintWithConfig({
                code: '@font-face{font-family:"Inter";src:url("../fonts/missing.woff2") format("woff2");}',
                codeFilename: cssPath,
                config: {
                    rules: {
                        "font/no-missing-font-file": true,
                    },
                },
            });

            expect(result.parseErrors).toHaveLength(0);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0]?.text).toContain(
                "Missing local font file"
            );
            expect(result.warnings[0]?.text).toContain(
                "../fonts/missing.woff2"
            );
        } finally {
            await rm(tempRoot, { force: true, recursive: true });
        }
    });
});

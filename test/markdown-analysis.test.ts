import * as fc from "fast-check";
import { describe, expect, it } from "vitest";

import { stripMarkdownCode } from "../scripts/_internal/strip-markdown-code.mjs";
import { extractMarkdownLinkMatches } from "../scripts/check-doc-links.mjs";
import { hasDefaultPackageDocumentationLabel } from "../scripts/remark-lint-rule-doc-headings.mjs";
import { resolveMinimumEngineVersion } from "../scripts/sync-node-version-files.mjs";

describe("markdown analysis helpers", () => {
    it("ignores fenced and inline code while preserving prose", () => {
        expect.assertions(4);

        const stripped = stripMarkdownCode(
            [
                "[kept](./kept.md)",
                "```md",
                "[hidden](./hidden.md)",
                "```",
                "~~~text",
                "![hidden](./hidden.png)",
                "~~~",
                "`[inline](./inline.md)`",
            ].join("\n")
        );

        expect(stripped).toContain("[kept](./kept.md)");
        expect(stripped).not.toContain("./hidden.md");
        expect(stripped).not.toContain("./hidden.png");
        expect(stripped).not.toContain("./inline.md");
    });

    it("extracts links and images with escaped labels and nested parentheses", () => {
        expect.assertions(1);

        expect(
            extractMarkdownLinkMatches(
                String.raw`[label \] text](./folder_(name).md "Title") ![alt](image.png)`
            )
        ).toStrictEqual([
            {
                destination: './folder_(name).md "Title"',
                fullMatch: String.raw`[label \] text](./folder_(name).md "Title")`,
                isImage: false,
                label: String.raw`label \] text`,
            },
            {
                destination: "image.png",
                fullMatch: "![alt](image.png)",
                isImage: true,
                label: "alt",
            },
        ]);
    });

    it("handles arbitrary Markdown input without throwing", () => {
        expect.assertions(1);

        expect(() => {
            fc.assert(
                fc.property(fc.string(), (content) => {
                    extractMarkdownLinkMatches(content);
                })
            );
        }).not.toThrow();
    });

    it("rejects long malformed link input without repeated rescans", () => {
        expect.assertions(1);

        expect(extractMarkdownLinkMatches("[".repeat(100_000))).toStrictEqual(
            []
        );
    });

    it.each([
        [{ node: ">=22" }, "22.0.0"],
        [{ node: ">=22.22" }, "22.22.0"],
        [{ node: ">=22.22.2 <27" }, "22.22.2"],
        [{ node: ">= 24.15.0" }, "24.15.0"],
        [{ node: "^22.0.0" }, null],
        [{ node: ">=22.0.0 || >=24.0.0" }, null],
        [{ node: ">=22.x" }, null],
        [{ node: ">=" }, null],
    ])("parses a supported minimum Node range %#", (engines, expected) => {
        expect.assertions(1);
        expect(resolveMinimumEngineVersion(engines)).toBe(expected);
    });

    it("recognizes only nonempty package documentation label lines", () => {
        expect.assertions(3);

        expect(
            hasDefaultPackageDocumentationLabel(
                "stylelint-plugin-font package documentation:\n"
            )
        ).toBe(true);
        expect(
            hasDefaultPackageDocumentationLabel(" package documentation:\n")
        ).toBe(false);
        expect(
            hasDefaultPackageDocumentationLabel(
                "stylelint-plugin-font package documentation: trailing"
            )
        ).toBe(false);
    });
});

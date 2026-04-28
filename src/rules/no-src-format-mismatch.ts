import stylelint, { type RuleBase } from "stylelint";
import { arrayFirst, isDefined, stringSplit } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    collectFontFaceBlocks,
    parseFontSrcEntries,
} from "../_internal/font-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = createRuleName("no-src-format-mismatch");

const messages: {
    rejected: (ext: string, declaredFmt: string, expectedFmt: string) => string;
} = ruleMessages(ruleName, {
    rejected: (ext: string, declaredFmt: string, expectedFmt: string): string =>
        `URL extension "${ext}" contradicts \`format("${declaredFmt}")\` in \`@font-face src\` — expected \`format("${expectedFmt}")\`. Mismatched format hints cause browsers to fetch the wrong format, wasting bandwidth and potentially breaking font loading. Align the extension and the format() value.`,
});

const docs = {
    description:
        "Disallow `@font-face src` entries where the URL file extension contradicts the explicit `format()` hint.",
    recommended: true,
    url: createRuleDocsUrl("no-src-format-mismatch"),
} as const;

/**
 * Known file-extension-to-CSS-format-keyword mappings.
 *
 * Only extensions with a single canonical format keyword are included. `.svg`
 * is intentionally omitted because `svg` and `svg-fonts` are both valid format
 * hints for `.svg` files, making a strict match unreliable.
 */
const EXTENSION_TO_FORMAT: ReadonlyMap<string, string> = new Map([
    [".eot", "embedded-opentype"],
    [".otf", "opentype"],
    [".ttf", "truetype"],
    [".woff2", "woff2"],
    [".woff", "woff"],
]);

/**
 * Extract the lowercase file extension from a URL, stripping any query-string
 * or fragment before the lookup.
 */
function extractExtension(url: string): string | undefined {
    const withoutQuery = arrayFirst(stringSplit(url, "?")) ?? "";
    const withoutFragment = arrayFirst(stringSplit(withoutQuery, "#")) ?? "";
    const lastDot = withoutFragment.lastIndexOf(".");

    if (lastDot === -1 || lastDot === withoutFragment.length - 1) {
        return undefined;
    }

    return withoutFragment.slice(lastDot).toLowerCase();
}

const ruleFunction: RuleBase<boolean, undefined> =
    (primary) => (root, result) => {
        const isValid = validateOptions(result, ruleName, {
            actual: primary,
            possible: [true],
        });

        if (!isValid) {
            return;
        }

        for (const block of collectFontFaceBlocks(root)) {
            const srcDecl = block.srcDecl;

            if (!isDefined(srcDecl)) {
                continue;
            }

            for (const entry of parseFontSrcEntries(srcDecl.value)) {
                const url = entry.normalizedUrl;
                const declaredFmt = entry.normalizedFormat;

                // Only check URL-based entries that have an explicit format hint.
                if (
                    !isDefined(url) ||
                    !isDefined(declaredFmt) ||
                    entry.isLocal
                ) {
                    continue;
                }

                const ext = extractExtension(url);

                if (!isDefined(ext)) {
                    continue;
                }

                const expectedFmt = EXTENSION_TO_FORMAT.get(ext);

                // If the extension is unrecognised or the formats match, skip.
                if (!isDefined(expectedFmt) || expectedFmt === declaredFmt) {
                    continue;
                }

                report({
                    message: messages.rejected(ext, declaredFmt, expectedFmt),
                    node: srcDecl,
                    result,
                    ruleName,
                    word: entry.raw,
                });
            }
        }
    };

/**
 * Disallow `@font-face src` entries where the URL extension contradicts the
 * format() hint.
 */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

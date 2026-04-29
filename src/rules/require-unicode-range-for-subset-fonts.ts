import stylelint, { type RuleBase } from "stylelint";
import { isDefined, setHas, stringSplit } from "ts-extras";

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
const ruleName = createRuleName("require-unicode-range-for-subset-fonts");
const messages: { rejected: (token: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (token: string): string =>
            `Subset-like font source token "${token}" detected in \`@font-face src\` but this block is missing \`unicode-range\`. Add an explicit range so the subset file only loads for matching glyphs.`,
    }
);
const docs = {
    description:
        "Require `unicode-range` when `@font-face src` URLs appear to target script/language subsets (for example `latin`, `cyrillic`, `japanese`).",
    recommended: false,
    url: createRuleDocsUrl("require-unicode-range-for-subset-fonts"),
} as const;

const subsetTokens = new Set([
    "arabic",
    "armenian",
    "bengali",
    "cjk",
    "cyrillic",
    "cyrillicext",
    "devanagari",
    "georgian",
    "greek",
    "greekext",
    "gurmukhi",
    "han",
    "hangul",
    "hebrew",
    "hiragana",
    "japanese",
    "kannada",
    "katakana",
    "khmer",
    "korean",
    "lao",
    "latin",
    "latinext",
    "malayalam",
    "odia",
    "oriya",
    "sinhala",
    "tamil",
    "telugu",
    "thai",
    "vietnamese",
]);

function getSubsetTokenFromUrl(url: string): string | undefined {
    const urlWithoutQuery = stripQueryAndFragment(url).toLowerCase();
    const normalized = urlWithoutQuery.replaceAll(/[^a-z]+/gu, " ").trim();
    const tokens = stringSplit(normalized, " ");

    for (const token of tokens) {
        if (setHas(subsetTokens, token)) {
            return token;
        }
    }

    return undefined;
}

function stripQueryAndFragment(url: string): string {
    const queryIndex = url.indexOf("?");
    const hashIndex = url.indexOf("#");

    if (queryIndex === -1 && hashIndex === -1) {
        return url;
    }

    if (queryIndex === -1) {
        return url.slice(0, hashIndex);
    }

    if (hashIndex === -1) {
        return url.slice(0, queryIndex);
    }

    return url.slice(0, Math.min(queryIndex, hashIndex));
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
            if (
                isDefined(block.unicodeRangeDecl) ||
                !isDefined(block.srcDecl)
            ) {
                continue;
            }

            const subsetToken = parseFontSrcEntries(block.srcDecl.value)
                .map((entry) => entry.normalizedUrl)
                .filter(isDefined)
                .map((url) => getSubsetTokenFromUrl(url))
                .find(isDefined);

            if (!isDefined(subsetToken)) {
                continue;
            }

            report({
                message: messages.rejected(subsetToken),
                node: block.atRule,
                result,
                ruleName,
            });
        }
    };

/** Require `unicode-range` for subset-like `@font-face` source URLs. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

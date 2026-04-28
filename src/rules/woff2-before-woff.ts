import stylelint, { type RuleBase } from "stylelint";
import { arrayJoin, isDefined } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    collectFontFaceBlocks,
    inferFormatHint,
    parseFontSrcEntries,
} from "../_internal/font-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = createRuleName("woff2-before-woff");
const messages: { rejected: () => string } = ruleMessages(ruleName, {
    rejected: (): string =>
        "`woff` appears before `woff2` in `src`. List `woff2` first so capable browsers pick the most efficient resource.",
});
const docs = {
    description:
        "Require `woff2` entries to appear before `woff` entries in `@font-face src`.",
    recommended: true,
    url: createRuleDocsUrl("woff2-before-woff"),
} as const;

function reorderWoff2BeforeWoff(value: string): string {
    const entries = parseFontSrcEntries(value);
    const woff2Entries = entries.filter(
        (entry) => inferFormatHint(entry) === "woff2"
    );
    const nonWoff2Entries = entries.filter(
        (entry) => inferFormatHint(entry) !== "woff2"
    );

    return arrayJoin(
        [...woff2Entries, ...nonWoff2Entries].map((entry) => entry.raw),
        ", "
    );
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

            const formats = parseFontSrcEntries(srcDecl.value).map((entry) =>
                inferFormatHint(entry)
            );
            const firstWoffIndex = formats.indexOf("woff");
            const firstWoff2Index = formats.indexOf("woff2");

            if (
                firstWoffIndex === -1 ||
                firstWoff2Index === -1 ||
                firstWoff2Index < firstWoffIndex
            ) {
                continue;
            }

            report({
                fix() {
                    srcDecl.value = reorderWoff2BeforeWoff(srcDecl.value);
                },
                message: messages.rejected(),
                node: srcDecl,
                result,
                ruleName,
            });
        }
    };

/** Require `woff2` entries before `woff` entries in `@font-face src`. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        meta: { fixable: true },
        rule: ruleFunction,
        ruleName,
    });

export default rule;

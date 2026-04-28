import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

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
const ruleName = createRuleName("prefer-woff2");
const messages: { rejected: () => string } = ruleMessages(ruleName, {
    rejected: (): string =>
        "No `woff2` source found in this `@font-face` `src` list. Include `woff2` for best compression and broad modern support.",
});
const docs = {
    description:
        "Prefer including a `woff2` source in every `@font-face` src list.",
    recommended: true,
    url: createRuleDocsUrl("prefer-woff2"),
} as const;

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

            const hasWoff2 = parseFontSrcEntries(srcDecl.value).some(
                (entry) => {
                    if (!entry.isUrl) {
                        return false;
                    }

                    return inferFormatHint(entry) === "woff2";
                }
            );

            if (hasWoff2) {
                continue;
            }

            report({
                message: messages.rejected(),
                node: srcDecl,
                result,
                ruleName,
            });
        }
    };

/** Prefer `woff2` format entries in `@font-face src` declarations over older
formats. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

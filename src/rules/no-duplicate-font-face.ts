import stylelint, { type RuleBase } from "stylelint";
import { setHas } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    buildFaceVariantKey,
    collectFontFaceBlocks,
} from "../_internal/font-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = createRuleName("no-duplicate-font-face");
const messages: { rejected: (family: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (family: string): string =>
            `Duplicate @font-face variant detected for family "${family}" with the same style/weight tuple. Keep one authoritative face per tuple.`,
    }
);
const docs = {
    description:
        "Disallow duplicate `@font-face` blocks that share the same `font-family` + `font-style` + `font-weight` variant.",
    recommended: true,
    url: createRuleDocsUrl("no-duplicate-font-face"),
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

        const seen = new Set<string>();

        for (const block of collectFontFaceBlocks(root)) {
            const key = buildFaceVariantKey(block);

            if (key.length === 0) {
                continue;
            }

            if (setHas(seen, key)) {
                report({
                    message: messages.rejected(
                        block.familyName ?? "(unknown family)"
                    ),
                    node: block.atRule,
                    result,
                    ruleName,
                });
                continue;
            }

            seen.add(key);
        }
    };

/**
 * Disallow duplicate `@font-face` declarations with the same family, weight,
 * and style.
 */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

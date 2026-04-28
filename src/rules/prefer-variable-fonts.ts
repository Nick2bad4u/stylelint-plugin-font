import stylelint, { type RuleBase } from "stylelint";
import { arrayFirst, isDefined } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    collectFontFaceBlocks,
    type FontFaceBlock,
    inferFormatHint,
    parseFontSrcEntries,
} from "../_internal/font-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const variableWeightPattern = /^\s*\d+\s+\d+\s*$/u;
const ruleName = createRuleName("prefer-variable-fonts");
const messages: { rejected: (family: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (family: string): string =>
            `Family "${family}" defines many static weight-specific faces. Consider a variable-font source to reduce duplicate payload and simplify maintenance.`,
    }
);
const docs = {
    description:
        "Prefer variable-font workflows when the same family defines many static `@font-face` weight variants.",
    recommended: true,
    url: createRuleDocsUrl("prefer-variable-fonts"),
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

        const byFamily = new Map<string, FontFaceBlock[]>();

        for (const block of collectFontFaceBlocks(root)) {
            if (!isDefined(block.familyNameLower)) {
                continue;
            }

            const list = byFamily.get(block.familyNameLower) ?? [];
            list.push(block);
            byFamily.set(block.familyNameLower, list);
        }

        for (const familyBlocks of byFamily.values()) {
            if (familyBlocks.length < 3) {
                continue;
            }

            const hasVariableWeightRange = familyBlocks.some((block) =>
                variableWeightPattern.test(block.weightDecl?.value ?? "")
            );

            if (hasVariableWeightRange) {
                continue;
            }

            const hasLikelyVariableSource = familyBlocks.some((block) =>
                parseFontSrcEntries(block.srcDecl?.value ?? "").some(
                    (entry) =>
                        inferFormatHint(entry) === "woff2" &&
                        (entry.normalizedUrl?.includes("variable") ?? false)
                )
            );

            if (hasLikelyVariableSource) {
                continue;
            }

            const firstBlock = arrayFirst(familyBlocks);

            if (!isDefined(firstBlock)) {
                continue;
            }

            report({
                message: messages.rejected(
                    firstBlock.familyName ?? "(unknown family)"
                ),
                node: firstBlock.atRule,
                result,
                ruleName,
            });
        }
    };

/**
 * Prefer variable font declarations over multiple static `@font-face` blocks
 * for the same family.
 */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

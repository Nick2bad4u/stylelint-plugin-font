import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    collectFontFaceBlocks,
    type FontFaceBlock,
} from "../_internal/font-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = createRuleName("require-unicode-range-for-large-family");
const messages: { rejected: (family: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (family: string): string =>
            `Font family "${family}" has 4+ @font-face variants but this face is missing \`unicode-range\`. Add a range to avoid unnecessary font downloads.`,
    }
);
const docs = {
    description:
        "Require `unicode-range` for families that define four or more `@font-face` blocks in the same file.",
    recommended: true,
    url: createRuleDocsUrl("require-unicode-range-for-large-family"),
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

        const blocks = collectFontFaceBlocks(root);
        const byFamily = new Map<string, FontFaceBlock[]>();

        for (const block of blocks) {
            if (!isDefined(block.familyNameLower)) {
                continue;
            }

            const existing = byFamily.get(block.familyNameLower) ?? [];
            existing.push(block);
            byFamily.set(block.familyNameLower, existing);
        }

        for (const familyBlocks of byFamily.values()) {
            if (familyBlocks.length < 4) {
                continue;
            }

            for (const block of familyBlocks) {
                if (isDefined(block.unicodeRangeDecl)) {
                    continue;
                }

                report({
                    message: messages.rejected(
                        block.familyName ?? "(unknown family)"
                    ),
                    node: block.atRule,
                    result,
                    ruleName,
                });
            }
        }
    };

/**
 * Require `unicode-range` in `@font-face` for families with many declared
 * faces.
 */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

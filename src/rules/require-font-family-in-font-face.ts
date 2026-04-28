import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import { collectFontFaceBlocks } from "../_internal/font-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = createRuleName("require-font-family-in-font-face");

const messages: { rejected: () => string } = ruleMessages(ruleName, {
    rejected: (): string =>
        "`@font-face` block is missing a `font-family` descriptor. Without `font-family`, the block cannot be referenced by any `font-family` property and has no effect.",
});

const docs = {
    description:
        "Require a `font-family` descriptor in every `@font-face` declaration block.",
    recommended: true,
    url: createRuleDocsUrl("require-font-family-in-font-face"),
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
            if (isDefined(block.familyDecl)) {
                continue;
            }

            report({
                message: messages.rejected(),
                node: block.atRule,
                result,
                ruleName,
            });
        }
    };

/** Require a `font-family` descriptor in every `@font-face` declaration block. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

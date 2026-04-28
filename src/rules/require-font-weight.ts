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
const ruleName = createRuleName("require-font-weight");
const messages: { rejected: () => string } = ruleMessages(ruleName, {
    rejected: (): string =>
        "Missing `font-weight` in `@font-face`. Declare an explicit weight (`400`, `700`, or a valid range) so browsers map faces predictably.",
});
const docs = {
    description: "Require explicit `font-weight` in every `@font-face` block.",
    recommended: true,
    url: createRuleDocsUrl("require-font-weight"),
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
            if (isDefined(block.weightDecl)) {
                continue;
            }

            report({
                fix() {
                    block.atRule.append({
                        prop: "font-weight",
                        value: "400",
                    });
                },
                message: messages.rejected(),
                node: block.atRule,
                result,
                ruleName,
            });
        }
    };

/** Require explicit `font-weight` in every `@font-face` block. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        meta: { fixable: true },
        rule: ruleFunction,
        ruleName,
    });

export default rule;

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
const ruleName = createRuleName("require-font-style");
const messages: { rejected: () => string } = ruleMessages(ruleName, {
    rejected: (): string =>
        "Missing `font-style` in `@font-face`. Declare an explicit style (for example `normal` or `italic`) to avoid ambiguous face selection.",
});
const docs = {
    description: "Require explicit `font-style` in every `@font-face` block.",
    recommended: true,
    url: createRuleDocsUrl("require-font-style"),
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
            if (isDefined(block.styleDecl)) {
                continue;
            }

            report({
                fix() {
                    block.atRule.append({
                        prop: "font-style",
                        value: "normal",
                    });
                },
                message: messages.rejected(),
                node: block.atRule,
                result,
                ruleName,
            });
        }
    };

/** Require explicit `font-style` in every `@font-face` block. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        meta: { fixable: true },
        rule: ruleFunction,
        ruleName,
    });

export default rule;

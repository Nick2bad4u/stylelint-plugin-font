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
const ruleName = createRuleName("require-font-display");
const messages: { rejected: () => string } = ruleMessages(ruleName, {
    rejected: (): string =>
        "Missing `font-display` in `@font-face`. Add `font-display: swap` to avoid FOIT and improve perceived text rendering.",
});
const docs = {
    description:
        "Require `font-display` in every `@font-face` declaration block.",
    recommended: true,
    url: createRuleDocsUrl("require-font-display"),
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
            if (isDefined(block.displayDecl)) {
                continue;
            }

            report({
                fix() {
                    block.atRule.append({
                        prop: "font-display",
                        value: "swap",
                    });
                },
                message: messages.rejected(),
                node: block.atRule,
                result,
                ruleName,
            });
        }
    };

/** Require `font-display` in every `@font-face` declaration block. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        meta: { fixable: true },
        rule: ruleFunction,
        ruleName,
    });

export default rule;

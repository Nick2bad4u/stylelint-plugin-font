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
const ruleName = createRuleName("consistent-font-display");
const messages: {
    rejected: (expected: string, actual: string) => string;
} = ruleMessages(ruleName, {
    rejected: (expected: string, actual: string): string =>
        `Inconsistent \`font-display\` value: expected "${expected}" but found "${actual}". Keep one display strategy per stylesheet to reduce loading inconsistency.`,
});
const docs = {
    description:
        "Require `@font-face` declarations in the same file to use a consistent `font-display` value.",
    recommended: true,
    url: createRuleDocsUrl("consistent-font-display"),
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

        // eslint-disable-next-line @typescript-eslint/init-declarations -- lazily assigned via ??= in loop; unicorn/no-useless-undefined prevents = undefined
        let baselineDisplay: string | undefined;

        for (const block of collectFontFaceBlocks(root)) {
            const display = block.displayDecl?.value.trim().toLowerCase();

            if (!isDefined(display) || display.length === 0) {
                continue;
            }

            baselineDisplay ??= display;

            if (display === baselineDisplay) {
                continue;
            }

            report({
                message: messages.rejected(baselineDisplay, display),
                node: block.atRule,
                result,
                ruleName,
            });
        }
    };

/** Require consistent `font-display` value across all `@font-face` declarations. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

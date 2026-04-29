import stylelint, { type RuleBase } from "stylelint";
import { isDefined, setHas } from "ts-extras";

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
const ruleName = createRuleName("no-invalid-font-display");
const messages: { rejected: (value: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (value: string): string =>
            `Invalid \`font-display\` descriptor value "${value}". Valid values are: "auto", "block", "swap", "fallback", and "optional".`,
    }
);
const docs = {
    description:
        "Disallow invalid `font-display` descriptor values in `@font-face` blocks.",
    recommended: true,
    url: createRuleDocsUrl("no-invalid-font-display"),
} as const;

const validFontDisplayValues = new Set([
    "auto",
    "block",
    "fallback",
    "optional",
    "swap",
]);

function isValidFontDisplay(value: string): boolean {
    const normalized = value.trim().toLowerCase();

    return setHas(validFontDisplayValues, normalized);
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
            const displayDecl = block.displayDecl;

            if (
                !isDefined(displayDecl) ||
                isValidFontDisplay(displayDecl.value)
            ) {
                continue;
            }

            report({
                message: messages.rejected(displayDecl.value),
                node: displayDecl,
                result,
                ruleName,
                word: displayDecl.value,
            });
        }
    };

/** Disallow invalid `font-display` descriptor values in `@font-face` blocks. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

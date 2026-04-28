import stylelint, { type RuleBase } from "stylelint";
import { arrayAt, isDefined, stringSplit } from "ts-extras";

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
const ruleName = createRuleName("no-invalid-font-weight");

const messages: { rejected: (value: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (value: string): string =>
            `Invalid \`font-weight\` descriptor value "${value}". Valid values are: integers 1–1000, the keyword "normal" (equivalent to 400), or a range "MIN MAX" for variable fonts.`,
    }
);

const docs = {
    description:
        "Disallow invalid `font-weight` descriptor values in `@font-face` blocks.",
    recommended: true,
    url: createRuleDocsUrl("no-invalid-font-weight"),
} as const;

/**
 * Validate a `font-weight` descriptor value. Valid forms:
 *
 * - "normal" (keyword)
 * - "100" to "1000" (integer)
 * - "100 900" (range for variable fonts)
 */
function isValidFontWeight(value: string): boolean {
    const trimmed = value.trim();

    if (trimmed.toLowerCase() === "normal") {
        return true;
    }

    // Single number: 1-1000
    if (/^\d+$/.test(trimmed)) {
        const num = Number.parseInt(trimmed, 10);

        return num >= 1 && num <= 1000;
    }

    // Range: "100 900" format
    if (/^\d+\s+\d+$/u.test(trimmed)) {
        const parts = stringSplit(trimmed, /\s+/u);
        const min = Number.parseInt(arrayAt(parts, 0) ?? "0", 10);
        const max = Number.parseInt(arrayAt(parts, 1) ?? "0", 10);

        return min >= 1 && max <= 1000 && min <= max;
    }

    return false;
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
            const weightDecl = block.weightDecl;

            if (!isDefined(weightDecl) || isValidFontWeight(weightDecl.value)) {
                continue;
            }

            report({
                message: messages.rejected(weightDecl.value),
                node: weightDecl,
                result,
                ruleName,
                word: weightDecl.value,
            });
        }
    };

/** Disallow invalid `font-weight` descriptor values in `@font-face` blocks. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

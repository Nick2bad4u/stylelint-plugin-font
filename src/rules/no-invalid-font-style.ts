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
const ruleName = createRuleName("no-invalid-font-style");

const messages: { rejected: (value: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (value: string): string =>
            `Invalid \`font-style\` descriptor value "${value}". Valid values are: "normal", "italic", "oblique", or "oblique" with an angle like "oblique 10deg".`,
    }
);

const docs = {
    description:
        "Disallow invalid `font-style` descriptor values in `@font-face` blocks.",
    recommended: true,
    url: createRuleDocsUrl("no-invalid-font-style"),
} as const;

/**
 * Validate a `font-style` descriptor value. Valid forms:
 *
 * - "normal"
 * - "italic"
 * - "oblique"
 * - "oblique <angle>" (e.g., "oblique 10deg")
 */
function isValidFontStyle(value: string): boolean {
    const trimmed = value.trim().toLowerCase();

    // Simple keywords
    if (trimmed === "normal" || trimmed === "italic") {
        return true;
    }

    // Oblique without angle
    if (trimmed === "oblique") {
        return true;
    }

    // Oblique with angle: "oblique 10deg" or "oblique 10" (unitless degrees also valid in some contexts)
    if (trimmed.startsWith("oblique")) {
        const anglepart = trimmed.slice("oblique".length).trim();

        // Angle can be like "10deg", "10", "-10deg", "-10", etc.
        // Pattern: optional minus, one or more digits, optional decimal point with digits, optional "deg" unit
        // eslint-disable-next-line security/detect-unsafe-regex -- Pattern is safe; no ReDoS risk
        return /^-?\d+(?:\.\d+)?(?:deg)?$/u.test(anglepart);
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
            const styleDecl = block.styleDecl;

            if (!isDefined(styleDecl) || isValidFontStyle(styleDecl.value)) {
                continue;
            }

            report({
                message: messages.rejected(styleDecl.value),
                node: styleDecl,
                result,
                ruleName,
                word: styleDecl.value,
            });
        }
    };

/** Disallow invalid `font-style` descriptor values in `@font-face` blocks. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

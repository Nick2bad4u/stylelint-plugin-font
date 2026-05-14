import stylelint, { type RuleBase } from "stylelint";
import { arrayFirst, isDefined, stringSplit } from "ts-extras";

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
            `Invalid \`font-style\` descriptor value "${value}". Valid values are: "normal", "italic", "oblique", "oblique <angle>" (e.g. "oblique 10deg"), or "oblique <min> <max>" for variable fonts (e.g. "oblique -90deg 90deg").`,
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
 * - "oblique <angle> <angle>" (variable-font range, e.g., "oblique -90deg 90deg")
 *
 * Per CSS Fonts Level 4, `oblique` in `@font-face` accepts an optional angle or
 * an angle range (min max) to describe the available slant range for variable
 * fonts.
 */
function isValidAngle(token: string): boolean {
    // Angle: optional minus, digits with optional decimal, optional "deg" unit
    // eslint-disable-next-line security/detect-unsafe-regex -- Pattern is safe; no ReDoS risk
    return /^-?\d+(?:\.\d+)?(?:deg)?$/v.test(token);
}

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

    // Oblique with one or two angles (e.g. "oblique 10deg" or "oblique -90deg 90deg")
    if (trimmed.startsWith("oblique")) {
        const anglepart = trimmed.slice("oblique".length).trim();
        // Split on whitespace — one or two angle tokens
        const normalizedAnglePart = anglepart.replaceAll(/\s+/gv, " ").trim();
        const tokens = stringSplit(normalizedAnglePart, " ");

        if (tokens.length === 1) {
            return isValidAngle(arrayFirst(tokens) ?? "");
        }

        if (tokens.length === 2) {
            const [minAngle, maxAngle] = tokens;

            return isValidAngle(minAngle ?? "") && isValidAngle(maxAngle ?? "");
        }

        return false;
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

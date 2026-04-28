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
const ruleName = createRuleName("no-generic-family-in-font-face");

/**
 * Generic CSS family keywords that are forbidden as the `font-family`
 * descriptor value inside an `@font-face` block.
 *
 * The CSS Fonts specification requires this descriptor to specify a custom
 * author-defined family name, not a CSS-defined generic keyword. Using a
 * generic keyword silently shadows the built-in generic family, making the name
 * unresolvable in practice and breaking inheritance.
 *
 * Reference: https://www.w3.org/TR/css-fonts-4/#font-family-desc
 */
const GENERIC_FAMILY_KEYWORDS = new Set([
    "cursive",
    "emoji",
    "fangsong",
    "fantasy",
    "math",
    "monospace",
    "sans-serif",
    "serif",
    "system-ui",
    "ui-monospace",
    "ui-rounded",
    "ui-sans-serif",
    "ui-serif",
]);

const messages: { rejected: (value: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (value: string): string =>
            `"${value}" is a CSS generic family keyword and must not be used as the \`font-family\` descriptor value inside \`@font-face\`. Provide a custom family name instead.`,
    }
);

const docs = {
    description:
        "Disallow CSS generic family keywords as `font-family` descriptor values inside `@font-face` blocks.",
    recommended: true,
    url: createRuleDocsUrl("no-generic-family-in-font-face"),
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
            const familyDecl = block.familyDecl;

            if (!isDefined(familyDecl)) {
                continue;
            }

            const rawValue = familyDecl.value.trim().toLowerCase();

            // Strip surrounding quotes for the generic-keyword check.
            const unquoted =
                (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
                (rawValue.startsWith("'") && rawValue.endsWith("'"))
                    ? rawValue.slice(1, -1).trim()
                    : rawValue;

            if (!setHas(GENERIC_FAMILY_KEYWORDS, unquoted)) {
                continue;
            }

            report({
                message: messages.rejected(familyDecl.value.trim()),
                node: familyDecl,
                result,
                ruleName,
                word: familyDecl.value.trim(),
            });
        }
    };

/** Disallow CSS generic family keywords as `font-family` in `@font-face`. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

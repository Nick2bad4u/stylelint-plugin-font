import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    collectFontFaceBlocks,
    isQuoted,
    stripSurroundingQuotes,
} from "../_internal/font-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = createRuleName("consistent-font-family-casing");
const messages: {
    rejected: (expected: string, actual: string) => string;
} = ruleMessages(ruleName, {
    rejected: (expected: string, actual: string): string =>
        `Inconsistent font-family casing: expected "${expected}" but found "${actual}". Use one canonical family spelling for all @font-face declarations.`,
});
const docs = {
    description:
        "Require consistent `font-family` casing across `@font-face` declarations.",
    recommended: true,
    url: createRuleDocsUrl("consistent-font-family-casing"),
} as const;

function normalizeTokenWithCanonicalCase(
    original: string,
    canonical: string
): string {
    if (isQuoted(original)) {
        const quote = original.trim().at(0) ?? '"';

        return `${quote}${canonical}${quote}`;
    }

    if (canonical.includes(" ")) {
        return `"${canonical}"`;
    }

    return canonical;
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

        const canonicalByLower = new Map<string, string>();

        for (const block of collectFontFaceBlocks(root)) {
            const familyDecl = block.familyDecl;

            if (!isDefined(familyDecl) || !isDefined(block.familyName)) {
                continue;
            }

            const normalizedLower = block.familyName.toLowerCase();
            const canonical = canonicalByLower.get(normalizedLower);

            if (!isDefined(canonical)) {
                canonicalByLower.set(normalizedLower, block.familyName);
                continue;
            }

            if (canonical === block.familyName) {
                continue;
            }

            report({
                fix() {
                    familyDecl.value = normalizeTokenWithCanonicalCase(
                        familyDecl.value,
                        canonical
                    );
                },
                message: messages.rejected(
                    canonical,
                    stripSurroundingQuotes(familyDecl.value)
                ),
                node: familyDecl,
                result,
                ruleName,
            });
        }
    };

/** Require consistent `font-family` casing across all `@font-face` declarations. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        meta: { fixable: true },
        rule: ruleFunction,
        ruleName,
    });

export default rule;

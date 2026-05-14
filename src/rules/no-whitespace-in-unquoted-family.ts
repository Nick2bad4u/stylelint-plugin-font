import stylelint, { type RuleBase } from "stylelint";
import { arrayAt, arrayJoin } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    isQuoted,
    parseFamilyList,
    splitCommaList,
    stripSurroundingQuotes,
} from "../_internal/font-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = createRuleName("no-whitespace-in-unquoted-family");
const messages: { rejected: (family: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (family: string): string =>
            `Font family "${family}" contains whitespace but is unquoted. Quote multi-word family names to keep parsing unambiguous.`,
    }
);
const docs = {
    description: "Disallow unquoted whitespace-containing `font-family` names.",
    recommended: true,
    url: createRuleDocsUrl("no-whitespace-in-unquoted-family"),
} as const;

function quoteUnquotedWhitespaceTokens(value: string): string {
    return arrayJoin(
        splitCommaList(value).map((segment) => {
            const raw = segment.text.trim();

            if (isQuoted(raw) || !/\s/v.test(raw)) {
                return raw;
            }

            return `"${stripSurroundingQuotes(raw)}"`;
        }),
        ", "
    );
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

        root.walkDecls("font-family", (decl) => {
            const hasViolation = splitCommaList(decl.value).some((segment) => {
                const token = segment.text.trim();

                return !isQuoted(token) && /\s/v.test(token);
            });

            if (!hasViolation) {
                return;
            }

            const firstFamily =
                arrayAt(parseFamilyList(decl.value), 0) ?? "(unknown family)";

            report({
                fix() {
                    decl.value = quoteUnquotedWhitespaceTokens(decl.value);
                },
                message: messages.rejected(firstFamily),
                node: decl,
                result,
                ruleName,
            });
        });
    };

/** Disallow unquoted whitespace-containing `font-family` names. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        meta: { fixable: true },
        rule: ruleFunction,
        ruleName,
    });

export default rule;

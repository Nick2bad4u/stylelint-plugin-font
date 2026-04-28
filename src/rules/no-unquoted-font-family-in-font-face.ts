import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import { collectFontFaceBlocks, isQuoted } from "../_internal/font-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = createRuleName("no-unquoted-font-family-in-font-face");

const messages: { rejected: (value: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (value: string): string =>
            `Unquoted \`font-family\` descriptor value "${value}" in \`@font-face\`. Quote the family name to prevent ambiguity, accidental generic-keyword shadowing, and parser inconsistencies.`,
    }
);

const docs = {
    description:
        "Require the `font-family` descriptor value inside `@font-face` to be quoted.",
    recommended: true,
    url: createRuleDocsUrl("no-unquoted-font-family-in-font-face"),
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

            const rawValue = familyDecl.value.trim();

            if (isQuoted(rawValue)) {
                continue;
            }

            report({
                fix() {
                    familyDecl.value = `"${rawValue}"`;
                },
                message: messages.rejected(rawValue),
                node: familyDecl,
                result,
                ruleName,
                word: rawValue,
            });
        }
    };

/** Require the `font-family` descriptor value inside `@font-face` to be quoted. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        meta: { fixable: true },
        rule: ruleFunction,
        ruleName,
    });

export default rule;

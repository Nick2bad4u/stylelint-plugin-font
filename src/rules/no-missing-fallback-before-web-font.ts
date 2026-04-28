import stylelint, { type RuleBase } from "stylelint";
import { arrayAt, isDefined } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    isInsideFontFace,
    isSystemFallbackFamily,
    parseFamilyList,
} from "../_internal/font-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = createRuleName("no-missing-fallback-before-web-font");
const messages: { rejected: (family: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (family: string): string =>
            `Web-font-first stack detected ("${family}") without a concrete fallback family. Add at least one fallback after the primary web font.`,
    }
);
const docs = {
    description:
        "Disallow web-font-first `font-family` stacks that omit a fallback family.",
    recommended: true,
    url: createRuleDocsUrl("no-missing-fallback-before-web-font"),
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

        root.walkDecls("font-family", (decl) => {
            if (isInsideFontFace(decl)) {
                return;
            }

            const families = parseFamilyList(decl.value);
            const firstFamily = arrayAt(families, 0);

            if (
                !isDefined(firstFamily) ||
                isSystemFallbackFamily(firstFamily)
            ) {
                return;
            }

            const hasFallback = families
                .slice(1)
                .some((family) => isSystemFallbackFamily(family));

            if (hasFallback) {
                return;
            }

            report({
                message: messages.rejected(firstFamily),
                node: decl,
                result,
                ruleName,
            });
        });
    };

/** Require a local or system font before each web-font URL in `font-family`
stacks. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

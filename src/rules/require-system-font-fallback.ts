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
const ruleName = createRuleName("require-system-font-fallback");
const messages: { rejected: () => string } = ruleMessages(ruleName, {
    rejected: (): string =>
        "`font-family` stack is missing a system-font fallback at the end. Append `system-ui` as a final fallback to reduce rendering surprises.",
});
const docs = {
    description:
        "Require regular selector `font-family` stacks to end with a system fallback.",
    recommended: true,
    url: createRuleDocsUrl("require-system-font-fallback"),
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
            const finalFamily = arrayAt(families, -1);

            if (isDefined(finalFamily) && isSystemFallbackFamily(finalFamily)) {
                return;
            }

            report({
                fix() {
                    decl.value = `${decl.value.trim()}, system-ui`;
                },
                message: messages.rejected(),
                node: decl,
                result,
                ruleName,
            });
        });
    };

/** Require `font-family` stacks in regular rules to end with a system-font
fallback. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        meta: { fixable: true },
        rule: ruleFunction,
        ruleName,
    });

export default rule;

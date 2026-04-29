import stylelint, { type RuleBase } from "stylelint";
import { isDefined, setHas } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    collectFontFaceBlocks,
    isInsideFontFace,
    parseFamilyList,
} from "../_internal/font-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = createRuleName("no-unused-font-face");

const messages: { rejected: (family: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (family: string): string =>
            `\`@font-face\` block defines \`font-family: "${family}"\` but it is never referenced by a \`font-family\` declaration in this stylesheet. Remove the unused \`@font-face\` block or add a matching \`font-family\` reference.`,
    }
);

const docs = {
    description:
        "Disallow `@font-face` blocks whose `font-family` name is never referenced in any `font-family` declaration.",
    recommended: false,
    url: createRuleDocsUrl("no-unused-font-face"),
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

        // Collect all font-family names referenced outside @font-face blocks.
        // Skip declarations that use CSS custom properties (var(...)) because
        // we cannot statically resolve the runtime value.
        const referencedFamilies = new Set<string>();

        root.walkDecls("font-family", (decl) => {
            if (isInsideFontFace(decl)) {
                return;
            }

            if (decl.value.includes("var(")) {
                return;
            }

            for (const family of parseFamilyList(decl.value)) {
                referencedFamilies.add(family.toLowerCase());
            }
        });

        // Report each @font-face whose declared family is never referenced.
        for (const block of collectFontFaceBlocks(root)) {
            if (
                !isDefined(block.familyDecl) ||
                !isDefined(block.familyNameLower)
            ) {
                continue;
            }

            if (!setHas(referencedFamilies, block.familyNameLower)) {
                report({
                    message: messages.rejected(
                        block.familyName ?? block.familyNameLower
                    ),
                    node: block.atRule,
                    result,
                    ruleName,
                });
            }
        }
    };

/**
 * Disallow `@font-face` blocks that are never referenced in `font-family`
 * declarations.
 */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

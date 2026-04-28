import stylelint, { type RuleBase } from "stylelint";

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
const ruleName = createRuleName("no-empty-font-face");

const messages: { rejected: () => string } = ruleMessages(ruleName, {
    rejected: (): string =>
        "Empty `@font-face` block detected. A `@font-face` block with no declarations is completely inert and has no effect. Add descriptors or remove the block.",
});

const docs = {
    description:
        "Disallow empty `@font-face` declaration blocks that contain no descriptors.",
    recommended: true,
    url: createRuleDocsUrl("no-empty-font-face"),
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
            const nodes = block.atRule.nodes ?? [];
            const hasDeclaration = nodes.some((node) => node.type === "decl");

            if (!hasDeclaration) {
                report({
                    message: messages.rejected(),
                    node: block.atRule,
                    result,
                    ruleName,
                });
            }
        }
    };

/** Disallow empty `@font-face` blocks that contain no descriptors. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

import type { ChildNode, Declaration } from "postcss";

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
const ruleName = createRuleName("no-duplicate-descriptors-in-font-face");

const messages: { rejected: (prop: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (prop: string): string =>
            `Duplicate \`${prop}\` descriptor in \`@font-face\`. Only the last declaration takes effect; the earlier one is silently ignored. Remove the duplicate to clarify intent.`,
    }
);

const docs = {
    description:
        "Disallow duplicate descriptor declarations within a single `@font-face` block.",
    recommended: true,
    url: createRuleDocsUrl("no-duplicate-descriptors-in-font-face"),
} as const;

/** Type guard: narrow a PostCSS ChildNode to a mutable Declaration. */
function isDecl(node: Readonly<ChildNode>): node is Declaration {
    return node.type === "decl";
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
            const { nodes } = block.atRule;

            if (!isDefined(nodes)) {
                continue;
            }

            const seenProps = new Map<string, Declaration>();

            for (const node of nodes) {
                if (!isDecl(node)) {
                    continue;
                }

                const prop = node.prop.trim().toLowerCase();
                const previous = seenProps.get(prop);

                if (isDefined(previous)) {
                    report({
                        message: messages.rejected(node.prop),
                        node,
                        result,
                        ruleName,
                        word: node.prop,
                    });
                } else {
                    seenProps.set(prop, node);
                }
            }
        }
    };

/**
 * Disallow duplicate descriptor declarations within a single `@font-face`
 * block.
 */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

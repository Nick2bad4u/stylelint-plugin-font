import type { AtRule } from "postcss";

import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = createRuleName("no-font-face-in-selectors");

const messages: { rejected: () => string } = ruleMessages(ruleName, {
    rejected: (): string =>
        "`@font-face` rule is nested inside a regular selector. Font-face declarations should only appear at the root level or inside at-rules like `@media`, `@supports`, `@layer`, or `@container` for optimal performance and clarity.",
});

const docs = {
    description:
        "Disallow `@font-face` rules nested inside regular CSS selectors.",
    recommended: true,
    url: createRuleDocsUrl("no-font-face-in-selectors"),
} as const;

/** Check if the parent of a node is a regular selector (not an at-rule). */
function hasRegularSelectorParent(node: Readonly<AtRule>): boolean {
    let parent: unknown = node.parent;

    while (isDefined(parent) && typeof parent === "object") {
        // Cast to access properties safely
        const typedParent = parent as { parent?: unknown; type: string };
        const parentType = typedParent.type;

        // If we encounter a regular rule (selector), that's a violation
        if (parentType === "rule") {
            return true;
        }

        // At-rules (like @media, @supports, @layer) and document are OK—keep walking
        if (parentType === "atrule" || parentType === "document") {
            parent = typedParent.parent;
            continue;
        }

        // Root level found—no regular selector parent
        if (parentType === "root") {
            return false;
        }

        // Unknown type—stop walking
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

        root.walkAtRules("font-face", (atRule) => {
            if (hasRegularSelectorParent(atRule)) {
                report({
                    message: messages.rejected(),
                    node: atRule,
                    result,
                    ruleName,
                });
            }
        });
    };

/** Disallow `@font-face` rules nested inside regular CSS selectors. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

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
const ruleName = createRuleName("require-src-in-font-face");

const messages: { rejected: (family: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (family: string): string =>
            `\`@font-face\` block for family "${family}" is missing a \`src\` descriptor. Without \`src\`, the browser cannot locate or download the font and the block has no effect.`,
    }
);

const docs = {
    description:
        "Require a `src` descriptor in every `@font-face` declaration block.",
    recommended: true,
    url: createRuleDocsUrl("require-src-in-font-face"),
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
            if (isDefined(block.srcDecl)) {
                continue;
            }

            // Fall back to a placeholder identifier when font-family is absent.
            const familyLabel = block.familyName ?? "(unknown)";

            report({
                message: messages.rejected(familyLabel),
                node: block.atRule,
                result,
                ruleName,
            });
        }
    };

/** Require a `src` descriptor in every `@font-face` declaration block. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

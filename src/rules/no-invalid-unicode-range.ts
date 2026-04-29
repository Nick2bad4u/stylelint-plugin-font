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
import { parseUnicodeRangeSet } from "../_internal/unicode-range.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = createRuleName("no-invalid-unicode-range");
const messages: { rejected: (value: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (value: string): string =>
            `Invalid \`unicode-range\` descriptor value "${value}". Use valid Unicode ranges like \`U+0000-00FF\`, \`U+4??\`, or comma-separated combinations.`,
    }
);
const docs = {
    description:
        "Disallow invalid `unicode-range` descriptor values in `@font-face` blocks.",
    recommended: true,
    url: createRuleDocsUrl("no-invalid-unicode-range"),
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
            const unicodeRangeDecl = block.unicodeRangeDecl;

            if (!isDefined(unicodeRangeDecl)) {
                continue;
            }

            if (isDefined(parseUnicodeRangeSet(unicodeRangeDecl.value))) {
                continue;
            }

            report({
                message: messages.rejected(unicodeRangeDecl.value),
                node: unicodeRangeDecl,
                result,
                ruleName,
                word: unicodeRangeDecl.value,
            });
        }
    };

/** Disallow invalid `unicode-range` descriptor values in `@font-face` blocks. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

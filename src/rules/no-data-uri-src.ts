import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    collectFontFaceBlocks,
    parseFontSrcEntries,
} from "../_internal/font-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = createRuleName("no-data-uri-src");
const messages: { rejected: () => string } = ruleMessages(ruleName, {
    rejected: (): string =>
        "Data-URI font source detected in `@font-face src`. Avoid inlining fonts as base64; it inflates CSS size and slows first parse.",
});
const docs = {
    description: "Disallow `data:` URL font sources in `@font-face src`.",
    recommended: true,
    url: createRuleDocsUrl("no-data-uri-src"),
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
            const srcDecl = block.srcDecl;

            if (!isDefined(srcDecl)) {
                continue;
            }

            const hasDataUri = parseFontSrcEntries(srcDecl.value).some(
                (entry) => entry.isDataUri
            );

            if (!hasDataUri) {
                continue;
            }

            report({
                message: messages.rejected(),
                node: srcDecl,
                result,
                ruleName,
            });
        }
    };

/** Disallow data URI fonts in `@font-face src` declarations. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

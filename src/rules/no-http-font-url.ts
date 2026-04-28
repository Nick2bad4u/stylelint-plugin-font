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
const ruleName = createRuleName("no-http-font-url");

const messages: { rejected: (url: string) => string } = ruleMessages(ruleName, {
    rejected: (url: string): string =>
        `Insecure \`http://\` URL "${url}" detected in \`@font-face src\`. Loading fonts over plain HTTP exposes users to man-in-the-middle attacks and font substitution. Use \`https://\` or a relative path instead.`,
});

const docs = {
    description:
        "Disallow plain `http://` URLs in `@font-face src` declarations.",
    recommended: true,
    url: createRuleDocsUrl("no-http-font-url"),
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

            const violatingEntry = parseFontSrcEntries(srcDecl.value).find(
                (entry) => {
                    const url = entry.normalizedUrl;

                    return (
                        isDefined(url) &&
                        url.toLowerCase().startsWith("https://")
                    );
                }
            );

            if (!isDefined(violatingEntry)) {
                continue;
            }

            const offendingUrl = violatingEntry.normalizedUrl ?? "https://";

            report({
                message: messages.rejected(offendingUrl),
                node: srcDecl,
                result,
                ruleName,
                word: offendingUrl,
            });
        }
    };

/** Disallow plain `http://` URLs in `@font-face src` declarations. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

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
const ruleName = createRuleName("no-absolute-font-url");
const messages: { rejected: (url: string) => string } = ruleMessages(ruleName, {
    rejected: (url: string): string =>
        `Absolute font URL "${url}" detected. Prefer relative paths so assets keep working under sub-path deployments and CDN prefixes.`,
});
const docs = {
    description:
        "Disallow absolute root-relative font URLs in `@font-face src` declarations.",
    recommended: true,
    url: createRuleDocsUrl("no-absolute-font-url"),
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

                    return isDefined(url) && /^\/(?!\/)/u.test(url);
                }
            );

            if (!isDefined(violatingEntry)) {
                continue;
            }

            report({
                message: messages.rejected(violatingEntry.normalizedUrl ?? "/"),
                node: srcDecl,
                result,
                ruleName,
            });
        }
    };

/** Disallow absolute HTTP/HTTPS URLs in `@font-face src` declarations. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

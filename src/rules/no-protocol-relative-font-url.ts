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
const ruleName = createRuleName("no-protocol-relative-font-url");

const messages: { rejected: (url: string) => string } = ruleMessages(ruleName, {
    rejected: (url: string): string =>
        `Protocol-relative URL "${url}" detected in \`@font-face src\`. Protocol-relative URLs inherit the page protocol and silently fall back to HTTP on non-HTTPS pages. Use an explicit \`https://\` URL or a relative path instead.`,
});

const docs = {
    description:
        "Disallow protocol-relative URLs (`//`) in `@font-face src` declarations.",
    recommended: true,
    url: createRuleDocsUrl("no-protocol-relative-font-url"),
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

                    return isDefined(url) && url.startsWith("//");
                }
            );

            if (!isDefined(violatingEntry)) {
                continue;
            }

            report({
                message: messages.rejected(
                    violatingEntry.normalizedUrl ?? "//"
                ),
                node: srcDecl,
                result,
                ruleName,
                word: violatingEntry.normalizedUrl ?? "//",
            });
        }
    };

/** Disallow protocol-relative `//` URLs in `@font-face src` declarations. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

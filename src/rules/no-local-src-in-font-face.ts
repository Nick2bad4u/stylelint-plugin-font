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
const ruleName = createRuleName("no-local-src-in-font-face");

const messages: { rejected: (token: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (token: string): string =>
            `\`local()\` source "${token}" in \`@font-face src\` detected. Local font lookups are unpredictable — the user's installed font may differ in version, hinting, or metrics from the expected web font, causing visual inconsistencies or layout shifts. Use only remote URL sources for predictable rendering.`,
    }
);

const docs = {
    description:
        "Disallow `local()` references in `@font-face src` declarations.",
    recommended: false,
    url: createRuleDocsUrl("no-local-src-in-font-face"),
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

            for (const entry of parseFontSrcEntries(srcDecl.value)) {
                if (!entry.isLocal) {
                    continue;
                }

                report({
                    message: messages.rejected(entry.raw),
                    node: srcDecl,
                    result,
                    ruleName,
                    word: entry.raw,
                });
            }
        }
    };

/** Disallow `local()` references in `@font-face src` declarations. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

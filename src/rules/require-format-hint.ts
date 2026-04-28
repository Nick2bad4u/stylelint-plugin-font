import stylelint, { type RuleBase } from "stylelint";
import { arrayJoin, isDefined } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    collectFontFaceBlocks,
    inferFormatHint,
    parseFontSrcEntries,
} from "../_internal/font-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = createRuleName("require-format-hint");
const messages: { rejected: () => string } = ruleMessages(ruleName, {
    rejected: (): string =>
        "`src: url(...)` entry is missing `format(...)`. Add an explicit format hint so browsers can skip unnecessary font probing.",
});
const docs = {
    description:
        "Require `format(...)` hints for `url(...)` sources in `@font-face src` values.",
    recommended: true,
    url: createRuleDocsUrl("require-format-hint"),
} as const;

function addInferredFormatHints(value: string): string {
    const entries = parseFontSrcEntries(value);

    return arrayJoin(
        entries.map((entry) => {
            if (!entry.isUrl || entry.hasFormatHint) {
                return entry.raw;
            }

            const inferredFormat = inferFormatHint(entry);

            if (!isDefined(inferredFormat)) {
                return entry.raw;
            }

            return `${entry.raw} format("${inferredFormat}")`;
        }),
        ", "
    );
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
            const srcDecl = block.srcDecl;

            if (!isDefined(srcDecl)) {
                continue;
            }

            const entries = parseFontSrcEntries(srcDecl.value);
            const hasViolation = entries.some(
                (entry) => entry.isUrl && !entry.hasFormatHint
            );

            if (!hasViolation) {
                continue;
            }

            report({
                fix() {
                    srcDecl.value = addInferredFormatHints(srcDecl.value);
                },
                message: messages.rejected(),
                node: srcDecl,
                result,
                ruleName,
            });
        }
    };

/** Require explicit `format(...)` hints for all `url(...)` entries in
`@font-face src`. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        meta: { fixable: true },
        rule: ruleFunction,
        ruleName,
    });

export default rule;

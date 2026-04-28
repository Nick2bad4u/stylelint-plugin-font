import stylelint, { type RuleBase } from "stylelint";
import { arrayJoin, isDefined } from "ts-extras";

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
const ruleName = createRuleName("local-src-before-url");
const messages: { rejected: () => string } = ruleMessages(ruleName, {
    rejected: (): string =>
        "`src` lists `url()` before `local()`. Move all `local(...)` entries ahead of network URLs so installed fonts are preferred.",
});
const docs = {
    description:
        "Require `local(...)` entries to appear before `url(...)` entries in `@font-face src`.",
    recommended: true,
    url: createRuleDocsUrl("local-src-before-url"),
} as const;

function reorderLocalEntriesFirst(value: string): string {
    const entries = parseFontSrcEntries(value);
    const locals = entries
        .filter((entry) => entry.isLocal)
        .map((entry) => entry.raw);
    const rest = entries
        .filter((entry) => !entry.isLocal)
        .map((entry) => entry.raw);

    return arrayJoin([...locals, ...rest], ", ");
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
            const firstUrlIndex = entries.findIndex((entry) => entry.isUrl);
            const firstLocalIndex = entries.findIndex((entry) => entry.isLocal);

            if (
                firstUrlIndex === -1 ||
                firstLocalIndex === -1 ||
                firstLocalIndex < firstUrlIndex
            ) {
                continue;
            }

            report({
                fix() {
                    srcDecl.value = reorderLocalEntriesFirst(srcDecl.value);
                },
                message: messages.rejected(),
                node: srcDecl,
                result,
                ruleName,
            });
        }
    };

/** Require `local(...)` entries before `url(...)` entries in `@font-face src`. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        meta: { fixable: true },
        rule: ruleFunction,
        ruleName,
    });

export default rule;

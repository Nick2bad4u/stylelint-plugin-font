import stylelint, { type RuleBase } from "stylelint";
import { isDefined, setHas } from "ts-extras";

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
const ruleName = createRuleName("no-duplicate-src-format");

const messages: {
    rejected: (format: string, family: string) => string;
} = ruleMessages(ruleName, {
    rejected: (format: string, family: string): string =>
        `Duplicate \`format("${format}")\` hint in \`@font-face src\` for family "${family}". Browsers stop at the first matching format entry; subsequent entries with the same format are never downloaded.`,
});

const docs = {
    description:
        "Disallow duplicate explicit `format()` hints within a single `@font-face src` declaration.",
    recommended: true,
    url: createRuleDocsUrl("no-duplicate-src-format"),
} as const;

/**
 * Scan a src entry list and return the first format string that appears more
 * than once, or `undefined` when all format hints are distinct.
 */
function findFirstDuplicateFormat(
    entries: readonly { readonly normalizedFormat: string | undefined }[]
): string | undefined {
    const seenFormats = new Set<string>();

    for (const entry of entries) {
        const { normalizedFormat: format } = entry;

        if (!isDefined(format)) {
            continue;
        }

        if (setHas(seenFormats, format)) {
            return format;
        }

        seenFormats.add(format);
    }

    return undefined;
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

            const firstDuplicate = findFirstDuplicateFormat(entries);

            if (!isDefined(firstDuplicate)) {
                continue;
            }

            const familyLabel = block.familyName ?? "(unknown)";

            report({
                message: messages.rejected(firstDuplicate, familyLabel),
                node: srcDecl,
                result,
                ruleName,
                word: `format("${firstDuplicate}")`,
            });
        }
    };

/** Disallow duplicate `format()` hints in a single `@font-face src` list. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

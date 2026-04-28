import stylelint, { type RuleBase } from "stylelint";
import { arrayJoin, isDefined, setHas } from "ts-extras";

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
const legacyFormats = new Set([
    "embedded-opentype",
    "eot",
    "svg",
    "truetype",
]);
const ruleName = createRuleName("no-legacy-formats");
const messages: { rejected: (format: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (format: string): string =>
            `Legacy font format "${format}" detected in @font-face src. Remove legacy entries (eot/svg/truetype) for modern-targeted projects.`,
    }
);
const docs = {
    description:
        "Disallow legacy `@font-face` formats (`eot`, `svg`, `truetype`) in modern projects.",
    recommended: true,
    url: createRuleDocsUrl("no-legacy-formats"),
} as const;

function removeLegacyEntries(value: string): string {
    return arrayJoin(
        parseFontSrcEntries(value)
            .filter((entry) => {
                const format = inferFormatHint(entry);

                return !isDefined(format) || !setHas(legacyFormats, format);
            })
            .map((entry) => entry.raw),
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
            const firstLegacy = entries
                .map((entry) => inferFormatHint(entry))
                .find(
                    (format) =>
                        isDefined(format) && setHas(legacyFormats, format)
                );

            if (!isDefined(firstLegacy)) {
                continue;
            }

            report({
                fix() {
                    srcDecl.value = removeLegacyEntries(srcDecl.value);
                },
                message: messages.rejected(firstLegacy),
                node: srcDecl,
                result,
                ruleName,
            });
        }
    };

/** Disallow legacy `@font-face` formats (`eot`, `svg`, `truetype`) in modern
projects. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        meta: { fixable: true },
        rule: ruleFunction,
        ruleName,
    });

export default rule;

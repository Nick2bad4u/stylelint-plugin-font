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
const ruleName = createRuleName("no-duplicate-font-family-src");

const messages: {
    rejected: (url: string, family: string) => string;
} = ruleMessages(ruleName, {
    rejected: (url: string, family: string): string =>
        `Duplicate src URL "${url}" found in multiple \`@font-face\` blocks for family "${family}". Each variant should reference a unique source file.`,
});

const docs = {
    description:
        "Disallow duplicate `src` URLs across `@font-face` blocks that share the same `font-family` name.",
    recommended: true,
    url: createRuleDocsUrl("no-duplicate-font-family-src"),
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

        const blocks = collectFontFaceBlocks(root);

        // Map: normalised family name → set of already-seen normalised URLs.
        // The map is built in source order so the second (and later) occurrence
        // of a URL is what gets reported, matching user expectations.
        const urlsByFamily = new Map<string, Set<string>>();

        for (const block of blocks) {
            if (
                !isDefined(block.familyNameLower) ||
                !isDefined(block.srcDecl)
            ) {
                continue;
            }

            const family = block.familyNameLower;

            if (!urlsByFamily.has(family)) {
                urlsByFamily.set(family, new Set<string>());
            }

            const seenUrls = urlsByFamily.get(family);

            if (!isDefined(seenUrls)) {
                // Should never happen — we ensured the key exists above.
                continue;
            }

            for (const entry of parseFontSrcEntries(block.srcDecl.value)) {
                if (!entry.isUrl || !isDefined(entry.normalizedUrl)) {
                    continue;
                }

                const normalizedUrl = entry.normalizedUrl;

                if (setHas(seenUrls, normalizedUrl)) {
                    report({
                        message: messages.rejected(
                            entry.url ?? normalizedUrl,
                            block.familyName ?? family
                        ),
                        node: block.srcDecl,
                        result,
                        ruleName,
                        word: normalizedUrl,
                    });
                } else {
                    seenUrls.add(normalizedUrl);
                }
            }
        }
    };

/** Disallow duplicate `src` URLs across `@font-face` blocks for the same family. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

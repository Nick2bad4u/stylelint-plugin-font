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

function getOrCreateSeenUrls(
    urlsByFamily: Map<string, Set<string>>,
    family: string
): Set<string> {
    const existing = urlsByFamily.get(family);

    if (isDefined(existing)) {
        return existing;
    }

    const created = new Set<string>();
    urlsByFamily.set(family, created);

    return created;
}

function reportDuplicateUrlsForBlock(
    input: Readonly<{
        family: string;
        familyDisplayName: string;
        result: Parameters<ReturnType<RuleBase<boolean, undefined>>>[1];
        seenUrls: Set<string>;
        srcDecl: NonNullable<
            ReturnType<typeof collectFontFaceBlocks>[number]["srcDecl"]
        >;
    }>
): void {
    const { family, familyDisplayName, result, seenUrls, srcDecl } = input;

    for (const entry of parseFontSrcEntries(srcDecl.value)) {
        if (!entry.isUrl || !isDefined(entry.normalizedUrl)) {
            continue;
        }

        const normalizedUrl = entry.normalizedUrl;

        if (!setHas(seenUrls, normalizedUrl)) {
            seenUrls.add(normalizedUrl);
            continue;
        }

        report({
            message: messages.rejected(
                entry.url ?? normalizedUrl,
                familyDisplayName
            ),
            node: srcDecl,
            result,
            ruleName,
            word: family.length > 0 ? normalizedUrl : entry.raw,
        });
    }
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

            reportDuplicateUrlsForBlock({
                family,
                familyDisplayName: block.familyName ?? family,
                result,
                seenUrls: getOrCreateSeenUrls(urlsByFamily, family),
                srcDecl: block.srcDecl,
            });
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

import type { AtRule } from "postcss";

import stylelint, { type RuleBase } from "stylelint";
import { isDefined, setHas } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    buildFaceVariantKey,
    collectFontFaceBlocks,
} from "../_internal/font-analysis.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";
import {
    hasOverlappingIntervals,
    parseUnicodeRangeSet,
    type UnicodeRangeSet,
} from "../_internal/unicode-range.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = createRuleName("no-overlapping-unicode-range");
const messages: {
    rejected: (family: string, previous: string, current: string) => string;
} = ruleMessages(ruleName, {
    rejected: (family: string, previous: string, current: string): string =>
        `Overlapping unicode-range subsets detected for family "${family}" in the same style/weight tuple (${previous} overlaps ${current}). Split subsets into non-overlapping ranges to avoid duplicate downloads.`,
});
const docs = {
    description:
        "Disallow overlapping `unicode-range` subsets across `@font-face` blocks that share the same family/style/weight tuple.",
    recommended: true,
    url: createRuleDocsUrl("no-overlapping-unicode-range"),
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

        const byVariant = new Map<
            string,
            {
                familyName: string;
                node: AtRule;
                rangeSet: UnicodeRangeSet;
            }[]
        >();

        for (const block of collectFontFaceBlocks(root)) {
            const unicodeRangeDecl = block.unicodeRangeDecl;

            if (!isDefined(unicodeRangeDecl)) {
                continue;
            }

            const parsedRangeSet = parseUnicodeRangeSet(unicodeRangeDecl.value);

            if (!isDefined(parsedRangeSet)) {
                continue;
            }

            const variantKey = buildFaceVariantKey(block);

            if (variantKey.length === 0) {
                continue;
            }

            const list = byVariant.get(variantKey) ?? [];
            list.push({
                familyName: block.familyName ?? "(unknown family)",
                node: block.atRule,
                rangeSet: parsedRangeSet,
            });
            byVariant.set(variantKey, list);
        }

        for (const sameVariantFaces of byVariant.values()) {
            reportOverlapsForVariant(sameVariantFaces, (current, previous) => {
                report({
                    message: messages.rejected(
                        current.familyName,
                        previous.rangeSet.displayValue,
                        current.rangeSet.displayValue
                    ),
                    node: current.node,
                    result,
                    ruleName,
                });
            });
        }
    };

/**
 * Disallow overlapping `unicode-range` subsets for the same family/style/weight
 * tuple.
 */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

type FaceEntry = Readonly<{
    familyName: string;
    node: AtRule;
    rangeSet: UnicodeRangeSet;
}>;

function hasOverlappingInterval(
    leftIntervals: Readonly<UnicodeRangeSet>["intervals"],
    rightIntervals: Readonly<UnicodeRangeSet>["intervals"]
): boolean {
    return hasOverlappingIntervals(leftIntervals, rightIntervals);
}

function reportOverlapsForVariant(
    sameVariantFaces: readonly FaceEntry[],
    reportOverlap: (current: FaceEntry, previous: FaceEntry) => void
): void {
    if (sameVariantFaces.length < 2) {
        return;
    }

    const reportedKeys = new Set<string>();

    for (
        let currentIndex = 0;
        currentIndex < sameVariantFaces.length;
        currentIndex += 1
    ) {
        const current = sameVariantFaces[currentIndex];

        if (!isDefined(current)) {
            continue;
        }

        for (
            let previousIndex = 0;
            previousIndex < currentIndex;
            previousIndex += 1
        ) {
            const previous = sameVariantFaces[previousIndex];

            if (!isDefined(previous)) {
                continue;
            }

            if (
                !hasOverlappingInterval(
                    previous.rangeSet.intervals,
                    current.rangeSet.intervals
                )
            ) {
                continue;
            }

            const pairKey = `${previousIndex}:${currentIndex}`;

            if (setHas(reportedKeys, pairKey)) {
                continue;
            }

            reportedKeys.add(pairKey);

            reportOverlap(current, previous);
        }
    }
}

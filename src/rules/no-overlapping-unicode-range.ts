import type { AtRule } from "postcss";

import stylelint, { type RuleBase } from "stylelint";
import { isDefined, isEmpty, isFinite, setHas, stringSplit } from "ts-extras";

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

type UnicodeInterval = Readonly<{
    end: number;
    start: number;
}>;

type UnicodeRangeSet = Readonly<{
    displayValue: string;
    intervals: readonly UnicodeInterval[];
}>;

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
            if (sameVariantFaces.length < 2) {
                continue;
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
                }
            }
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

function hasOverlappingInterval(
    leftIntervals: readonly UnicodeInterval[],
    rightIntervals: readonly UnicodeInterval[]
): boolean {
    for (const left of leftIntervals) {
        for (const right of rightIntervals) {
            if (left.start <= right.end && right.start <= left.end) {
                return true;
            }
        }
    }

    return false;
}

function isValidUnicodePart(token: string): boolean {
    if (token.length === 0 || token.length > 6) {
        return false;
    }

    for (const character of token) {
        const isHex =
            (character >= "0" && character <= "9") ||
            (character >= "A" && character <= "F");

        if (!isHex && character !== "?") {
            return false;
        }
    }

    return true;
}

function parseUnicodeRangeSet(value: string): undefined | UnicodeRangeSet {
    const intervals: UnicodeInterval[] = [];

    for (const token of stringSplit(value, ",")) {
        const parsedInterval = parseUnicodeRangeToken(token.trim());

        if (!isDefined(parsedInterval)) {
            return undefined;
        }

        intervals.push(parsedInterval);
    }

    if (isEmpty(intervals)) {
        return undefined;
    }

    return {
        displayValue: value.trim(),
        intervals,
    };
}

function parseUnicodeRangeToken(token: string): undefined | UnicodeInterval {
    const normalized = token.trim().toUpperCase();

    if (!normalized.startsWith("U+")) {
        return undefined;
    }

    const body = normalized.slice(2);
    const separatorIndex = body.indexOf("-");
    const hasRange = separatorIndex !== -1;
    const startToken = hasRange ? body.slice(0, separatorIndex) : body;
    const endToken = hasRange ? body.slice(separatorIndex + 1) : undefined;

    if (!isValidUnicodePart(startToken)) {
        return undefined;
    }

    if (startToken.includes("?")) {
        if (isDefined(endToken)) {
            return undefined;
        }

        return wildcardToInterval(startToken);
    }

    const start = Number.parseInt(startToken, 16);

    if (!isFinite(start)) {
        return undefined;
    }

    if (!isDefined(endToken)) {
        return {
            end: start,
            start,
        };
    }

    if (endToken.includes("?")) {
        return undefined;
    }

    if (!isValidUnicodePart(endToken)) {
        return undefined;
    }

    const end = Number.parseInt(endToken, 16);

    if (!isFinite(end)) {
        return undefined;
    }

    return {
        end: Math.max(start, end),
        start: Math.min(start, end),
    };
}

function wildcardToInterval(token: string): UnicodeInterval {
    const start = Number.parseInt(token.replaceAll("?", "0"), 16);
    const end = Number.parseInt(token.replaceAll("?", "F"), 16);

    return {
        end,
        start,
    };
}

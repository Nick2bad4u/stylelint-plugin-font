import { isDefined, isEmpty, isFinite, stringSplit } from "ts-extras";

/** One parsed unicode-range interval in numeric form (inclusive). */
export type UnicodeInterval = Readonly<{
    end: number;
    start: number;
}>;

/** Parsed unicode-range descriptor preserving original text for reporting. */
export type UnicodeRangeSet = Readonly<{
    displayValue: string;
    intervals: readonly UnicodeInterval[];
}>;

/** Return true when any interval from the left set overlaps with the right set. */
export function hasOverlappingIntervals(
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

/** Parse one `unicode-range` descriptor value into numeric intervals. */
export function parseUnicodeRangeSet(
    value: string
): undefined | UnicodeRangeSet {
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

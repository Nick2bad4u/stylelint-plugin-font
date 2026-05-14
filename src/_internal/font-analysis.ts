import type { AtRule, Declaration, Root, Rule } from "postcss";

import { isDefined, setHas } from "ts-extras";

/** Parsed comma-separated token with source index boundaries. */
export type CommaSegment = Readonly<{
    end: number;
    start: number;
    text: string;
}>;

/** Parsed `@font-face` metadata used by multiple rules. */
export type FontFaceBlock = Readonly<{
    atRule: AtRule;
    displayDecl: Declaration | undefined;
    familyDecl: Declaration | undefined;
    familyName: string | undefined;
    familyNameLower: string | undefined;
    srcDecl: Declaration | undefined;
    styleDecl: Declaration | undefined;
    unicodeRangeDecl: Declaration | undefined;
    weightDecl: Declaration | undefined;
}>;

/** Parsed src list item from one `@font-face` src declaration. */
export type FontSrcEntry = Readonly<{
    hasFormatHint: boolean;
    isDataUri: boolean;
    isLocal: boolean;
    isUrl: boolean;
    normalizedFormat: string | undefined;
    normalizedUrl: string | undefined;
    raw: string;
    url: string | undefined;
}>;

/** Mutable parser state for comma-list splitting. */
interface CommaSplitState {
    depth: number;
    inDoubleQuote: boolean;
    inSingleQuote: boolean;
}

/** Known generic or system fallback family names. */
const fallbackFamilyNames = new Set([
    "-apple-system",
    "blinkmacsystemfont",
    "cursive",
    "emoji",
    "fangsong",
    "fantasy",
    "math",
    "monospace",
    "sans-serif",
    "segoe ui",
    "serif",
    "system-ui",
    "ui-monospace",
    "ui-rounded",
    "ui-sans-serif",
    "ui-serif",
]);

// ─── Leaf helpers (no internal dependencies) ────────────────────────────────

/** Stable key used to identify one face variant for duplicate checks. */
export function buildFaceVariantKey(block: Readonly<FontFaceBlock>): string {
    const family = block.familyNameLower ?? "";
    const weight = block.weightDecl?.value.trim().toLowerCase() ?? "400";
    const style = block.styleDecl?.value.trim().toLowerCase() ?? "normal";

    return `${family}@@${weight}@@${style}`;
}

/** Collect `@font-face` blocks with commonly queried declarations. */
export function collectFontFaceBlocks(
    root: Readonly<Root>
): readonly FontFaceBlock[] {
    const blocks: FontFaceBlock[] = [];

    root.walkAtRules("font-face", (atRule) => {
        const familyDecl = getDecl(atRule, "font-family");
        const familyName = familyDecl
            ? normalizeFamilyToken(familyDecl.value)
            : undefined;

        blocks.push({
            atRule,
            displayDecl: getDecl(atRule, "font-display"),
            familyDecl,
            familyName,
            familyNameLower: familyName?.toLowerCase(),
            srcDecl: getDecl(atRule, "src"),
            styleDecl: getDecl(atRule, "font-style"),
            unicodeRangeDecl: getDecl(atRule, "unicode-range"),
            weightDecl: getDecl(atRule, "font-weight"),
        });
    });

    return blocks;
}

/** Get first declaration by property inside one at-rule. */
export function getDecl(
    atRule: Readonly<AtRule>,
    prop: string
): Declaration | undefined {
    for (const node of atRule.nodes ?? []) {
        if (node.type === "decl" && node.prop === prop) {
            return node;
        }
    }

    return undefined;
}

/** Return normalized format hint or infer it from a URL extension. */
export function inferFormatHint(
    entry: Readonly<FontSrcEntry>
): string | undefined {
    if (isDefined(entry.normalizedFormat)) {
        return entry.normalizedFormat;
    }

    const url = entry.normalizedUrl;

    if (!isDefined(url)) {
        return undefined;
    }

    if (url.endsWith(".woff2")) {
        return "woff2";
    }

    if (url.endsWith(".woff")) {
        return "woff";
    }

    if (url.endsWith(".ttf")) {
        return "truetype";
    }

    if (url.endsWith(".otf")) {
        return "opentype";
    }

    if (url.endsWith(".svg")) {
        return "svg";
    }

    if (url.endsWith(".eot")) {
        return "embedded-opentype";
    }

    return undefined;
}

// ─── Private parsing helpers ─────────────────────────────────────────────────

/** Return true when a declaration belongs to an `@font-face` block. */
export function isInsideFontFace(decl: Readonly<Declaration>): boolean {
    const parent = decl.parent;

    return (
        parent?.type === "atrule" && parent.name.toLowerCase() === "font-face"
    );
}

/** Return true when token is explicitly quoted. */
export function isQuoted(value: string): boolean {
    const trimmed = value.trim();
    const first = trimmed.at(0);
    const last = trimmed.at(-1);

    return (
        ((first === '"' && last === '"') || (first === "'" && last === "'")) &&
        trimmed.length >= 2
    );
}

/** Return true when a family token is generic/system fallback-like. */
export function isSystemFallbackFamily(token: string): boolean {
    return setHas(fallbackFamilyNames, token.trim().toLowerCase());
}

/** Normalize one `font-family` token for matching/comparison. */
export function normalizeFamilyToken(token: string): string {
    return stripSurroundingQuotes(token).trim();
}

/** Parse one font-family declaration value into comma-separated names. */
export function parseFamilyList(value: string): readonly string[] {
    return splitCommaList(value)
        .map((segment) => normalizeFamilyToken(segment.text))
        .filter((token) => token.length > 0);
}

// ─── Public parsing utilities ─────────────────────────────────────────────────

/** Parse one `@font-face` src declaration value into structured entries. */
export function parseFontSrcEntries(value: string): readonly FontSrcEntry[] {
    return splitCommaList(value).map((segment) => {
        const rawSegment = segment.text;
        const normalized = rawSegment.toLowerCase();
        const url = getUrlValue(rawSegment);
        const normalizedFormat = getFormatHint(rawSegment);
        const normalizedUrl = url?.toLowerCase();

        return {
            hasFormatHint: isDefined(normalizedFormat),
            isDataUri: /^data:/iv.test(normalizedUrl ?? ""),
            isLocal: /\blocal\s*\(/iv.test(normalized),
            isUrl: /\burl\s*\(/iv.test(normalized),
            normalizedFormat,
            normalizedUrl: normalizedUrl?.toLowerCase(),
            raw: rawSegment,
            url,
        };
    });
}

/** Split one CSS comma-list while preserving nested parentheses and quotes. */
export function splitCommaList(value: string): readonly CommaSegment[] {
    const segments: CommaSegment[] = [];
    let start = 0;
    const state: CommaSplitState = {
        depth: 0,
        inDoubleQuote: false,
        inSingleQuote: false,
    };

    for (let index = 0; index < value.length; index += 1) {
        const character = value[index] ?? "";

        updateQuoteState(state, {
            character,
            previous: index > 0 ? (value[index - 1] ?? "") : "",
        });

        if (state.inSingleQuote || state.inDoubleQuote) {
            continue;
        }

        if (handleStructuralCharacter(state, character)) {
            continue;
        }

        if (character === "," && state.depth === 0) {
            const raw = value.slice(start, index).trim();

            if (raw.length > 0) {
                segments.push({
                    end: index,
                    start,
                    text: raw,
                });
            }

            start = index + 1;
        }
    }

    const trailing = value.slice(start).trim();

    if (trailing.length > 0) {
        segments.push({
            end: value.length,
            start,
            text: trailing,
        });
    }

    return segments;
}

/** Remove one layer of single/double quotes from a CSS string token. */
export function stripSurroundingQuotes(value: string): string {
    const trimmed = value.trim();

    if (trimmed.length < 2) {
        return trimmed;
    }

    const first = trimmed.at(0);
    const last = trimmed.at(-1);

    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
        return trimmed.slice(1, -1).trim();
    }

    return trimmed;
}

/** Iterate declaration nodes from regular style rules only. */
export function walkNormalRuleDecls(
    root: Readonly<Root>,
    prop: string,
    visitor: (decl: Readonly<Declaration>, rule: Readonly<Rule>) => void
): void {
    root.walkDecls(prop, (decl) => {
        const parent = decl.parent;

        if (parent?.type !== "rule") {
            return;
        }

        visitor(decl, parent);
    });
}

/** Extract normalized format hint token from one src segment. */
function getFormatHint(segment: string): string | undefined {
    const captured = getFunctionArgument(segment, "format");

    return captured?.toLowerCase();
}

/** Extract one function argument value from a CSS value segment. */
function getFunctionArgument(
    segment: string,
    functionName: "format" | "url"
): string | undefined {
    const marker = `${functionName}(`;
    const normalized = segment.toLowerCase();
    const markerIndex = normalized.indexOf(marker);

    if (markerIndex === -1) {
        return undefined;
    }

    const startIndex = markerIndex + marker.length;
    const closingIndex = segment.indexOf(")", startIndex);

    if (closingIndex === -1) {
        return undefined;
    }

    const rawArgument = segment.slice(startIndex, closingIndex).trim();

    return stripSurroundingQuotes(rawArgument);
}

/** Extract normalized URL from one src segment when present. */
function getUrlValue(segment: string): string | undefined {
    return getFunctionArgument(segment, "url");
}

/** Apply parser depth updates for structural characters. */
function handleStructuralCharacter(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- CommaSplitState is intentionally mutable
    state: CommaSplitState,
    character: string
): boolean {
    if (character === "(") {
        state.depth += 1;
        return true;
    }

    if (character === ")") {
        state.depth = Math.max(0, state.depth - 1);
        return true;
    }

    return false;
}

/** Update single/double quote tracking state for list parsing. */
function updateQuoteState(
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- CommaSplitState is intentionally mutable
    state: CommaSplitState,
    input: Readonly<{ character: string; previous: string }>
): void {
    const { character, previous } = input;

    if (previous === "\\") {
        return;
    }

    if (character === "'" && !state.inDoubleQuote) {
        state.inSingleQuote = !state.inSingleQuote;
        return;
    }

    if (character === '"' && !state.inSingleQuote) {
        state.inDoubleQuote = !state.inDoubleQuote;
    }
}

import { remark } from "remark";

/** @typedef {import("mdast").Nodes} MarkdownNode */
/** @typedef {import("mdast").Parent} MarkdownParent */

/**
 * @typedef {{
 *     readonly fenceCharacter: "`" | "~";
 *     readonly minimumFenceLength: number;
 * }} FencedCodeBlockState
 */

/**
 * @param {string} line
 *
 * @returns {Readonly<{
 *           fenceCharacter: "`" | "~";
 *           fenceLength: number;
 *           rest: string;
 *       }>
 *     | undefined}
 */
function parseFenceLine(line) {
    let indentationLength = 0;

    while (line[indentationLength] === " ") {
        indentationLength += 1;
    }

    if (indentationLength > 3) {
        return undefined;
    }

    const candidateFenceCharacter = line[indentationLength];
    if (candidateFenceCharacter !== "`" && candidateFenceCharacter !== "~") {
        return undefined;
    }

    let fenceLength = 0;
    while (line[indentationLength + fenceLength] === candidateFenceCharacter) {
        fenceLength += 1;
    }

    if (fenceLength < 3) {
        return undefined;
    }

    return {
        fenceCharacter: candidateFenceCharacter,
        fenceLength,
        rest: line.slice(indentationLength + fenceLength),
    };
}

/**
 * @param {string} line
 *
 * @returns {FencedCodeBlockState | undefined}
 */
function parseOpeningFence(line) {
    const parsedFence = parseFenceLine(line);

    if (parsedFence === undefined) {
        return undefined;
    }

    if (parsedFence.fenceCharacter === "`" && parsedFence.rest.includes("`")) {
        return undefined;
    }

    return {
        fenceCharacter: parsedFence.fenceCharacter,
        minimumFenceLength: parsedFence.fenceLength,
    };
}

/**
 * @param {string} line
 * @param {FencedCodeBlockState} fencedCodeBlockState
 *
 * @returns {boolean}
 */
function isClosingFence(line, fencedCodeBlockState) {
    const parsedFence = parseFenceLine(line);
    if (parsedFence === undefined) {
        return false;
    }

    return (
        parsedFence.fenceCharacter === fencedCodeBlockState.fenceCharacter &&
        parsedFence.fenceLength >= fencedCodeBlockState.minimumFenceLength &&
        [...parsedFence.rest].every(
            (character) => character === " " || character === "\t"
        )
    );
}

/**
 * Split Markdown at LF, CRLF, or CR boundaries while retaining each line
 * ending. Preserving the endings keeps non-code source content unchanged.
 *
 * @param {string} content
 *
 * @returns {readonly string[]}
 */
export function splitMarkdownLines(content) {
    /** @type {string[]} */
    const lines = [];
    let lineStart = 0;
    let offset = 0;

    while (offset < content.length) {
        const character = content[offset];
        if (character !== "\r" && character !== "\n") {
            offset += 1;
            continue;
        }

        const lineEnd =
            character === "\r" && content[offset + 1] === "\n"
                ? offset + 2
                : offset + 1;
        lines.push(content.slice(lineStart, lineEnd));
        lineStart = lineEnd;
        offset = lineEnd;
    }

    if (lineStart < content.length) {
        lines.push(content.slice(lineStart));
    }

    return lines;
}

/**
 * @param {string} content
 *
 * @returns {string}
 */
function stripFencedCodeBlocks(content) {
    const lines = splitMarkdownLines(content);

    /** @type {FencedCodeBlockState | undefined} */
    let fencedCodeBlockState;
    let sanitizedContent = "";

    for (const line of lines) {
        const lineWithoutTrailingLineBreak = line.replace(
            /(?:\r\n|\r|\n)$/u,
            ""
        );

        if (fencedCodeBlockState !== undefined) {
            if (
                isClosingFence(
                    lineWithoutTrailingLineBreak,
                    fencedCodeBlockState
                )
            ) {
                fencedCodeBlockState = undefined;
            }

            continue;
        }

        const openingFence = parseOpeningFence(lineWithoutTrailingLineBreak);

        if (openingFence !== undefined) {
            fencedCodeBlockState = openingFence;
            continue;
        }

        sanitizedContent += line;
    }

    return sanitizedContent;
}

/**
 * Remove fenced code blocks and inline code spans so markdown-like text inside
 * examples does not get treated as real prose content.
 *
 * @param {string} content
 *
 * @returns {string}
 */
export function stripMarkdownCode(content) {
    const contentWithoutFencedCodeBlocks = stripFencedCodeBlocks(content);

    let sanitizedContent = "";

    for (
        let characterIndex = 0;
        characterIndex < contentWithoutFencedCodeBlocks.length;
    ) {
        if (contentWithoutFencedCodeBlocks[characterIndex] !== "`") {
            sanitizedContent += contentWithoutFencedCodeBlocks[characterIndex];
            characterIndex += 1;
            continue;
        }

        let tickCount = 1;

        while (
            contentWithoutFencedCodeBlocks[characterIndex + tickCount] === "`"
        ) {
            tickCount += 1;
        }

        const tickSequence = "`".repeat(tickCount);
        const closingTickOffset = contentWithoutFencedCodeBlocks.indexOf(
            tickSequence,
            characterIndex + tickCount
        );

        if (closingTickOffset === -1) {
            sanitizedContent += tickSequence;
            characterIndex += tickCount;
            continue;
        }

        sanitizedContent += " ".repeat(
            closingTickOffset + tickCount - characterIndex
        );
        characterIndex = closingTickOffset + tickCount;
    }

    return sanitizedContent;
}

/**
 * @typedef {Readonly<{
 *     destination: string;
 *     fullMatch: string;
 *     isImage: boolean;
 *     label: string;
 * }>} MarkdownInlineLink
 */

/** @type {ReturnType<typeof remark>} */
const markdownParser = remark();

/**
 * @param {MarkdownNode} node
 *
 * @returns {node is MarkdownParent}
 */
function hasMarkdownChildren(node) {
    return "children" in node && Array.isArray(node.children);
}

/**
 * @param {MarkdownNode} node
 *
 * @returns {string}
 */
function getMarkdownNodeText(node) {
    if ("value" in node && typeof node.value === "string") {
        return node.value;
    }

    if (node.type === "image") {
        return node.alt ?? "";
    }

    return hasMarkdownChildren(node)
        ? node.children.map((child) => getMarkdownNodeText(child)).join("")
        : "";
}

/**
 * @param {MarkdownNode} node
 * @param {string} content
 * @param {MarkdownInlineLink[]} links
 */
function collectMarkdownInlineLinks(node, content, links) {
    if (node.type === "link" || node.type === "image") {
        const startOffset = node.position?.start.offset;
        const endOffset = node.position?.end.offset;

        if (startOffset !== undefined && endOffset !== undefined) {
            links.push({
                destination: node.url,
                fullMatch: content.slice(startOffset, endOffset),
                isImage: node.type === "image",
                label:
                    node.type === "image"
                        ? (node.alt ?? "")
                        : getMarkdownNodeText(node),
            });
        }

        return;
    }

    if (hasMarkdownChildren(node)) {
        for (const child of node.children) {
            collectMarkdownInlineLinks(child, content, links);
        }
    }
}

/**
 * Extract Markdown inline links and images through the repository's Markdown
 * parser so code, escaping, titles, and malformed constructs follow the same
 * grammar as the documentation toolchain.
 *
 * @param {string} content
 *
 * @returns {readonly MarkdownInlineLink[]}
 */
export function extractMarkdownInlineLinks(content) {
    /** @type {MarkdownInlineLink[]} */
    const links = [];
    collectMarkdownInlineLinks(markdownParser.parse(content), content, links);

    return links;
}

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
 * @param {string} content
 *
 * @returns {string}
 */
function stripFencedCodeBlocks(content) {
    const lines = content.split(/(?<=\n)/u);

    /** @type {FencedCodeBlockState | undefined} */
    let fencedCodeBlockState;
    let sanitizedContent = "";

    for (const line of lines) {
        const lineWithoutTrailingLineBreak = line.replace(/\r?\n$/u, "");

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

/**
 * @typedef {Readonly<{
 *     link?: MarkdownInlineLink;
 *     nextOffset: number;
 * }>} MarkdownInlineLinkParseResult
 */

/**
 * @param {string} content
 * @param {number} labelStart
 *
 * @returns {number}
 */
function findMarkdownLinkLabelEnd(content, labelStart) {
    let isEscaped = false;

    for (let offset = labelStart; offset < content.length; offset += 1) {
        const character = content[offset];
        if (isEscaped) {
            isEscaped = false;
        } else if (character === "\\") {
            isEscaped = true;
        } else if (character === "]") {
            return offset;
        }
    }

    return -1;
}

/**
 * @param {string} content
 * @param {number} destinationStart
 *
 * @returns {number}
 */
function findMarkdownLinkDestinationEnd(content, destinationStart) {
    let parenthesisDepth = 1;
    let isEscaped = false;

    for (let offset = destinationStart; offset < content.length; offset += 1) {
        const character = content[offset];
        if (isEscaped) {
            isEscaped = false;
        } else if (character === "\\") {
            isEscaped = true;
        } else if (character === "(") {
            parenthesisDepth += 1;
        } else if (character === ")") {
            parenthesisDepth -= 1;
            if (parenthesisDepth === 0) {
                return offset;
            }
        }
    }

    return -1;
}

/**
 * @param {string} content
 * @param {number} matchStart
 * @param {boolean} isImage
 *
 * @returns {MarkdownInlineLinkParseResult | undefined}
 */
function parseMarkdownInlineLinkAt(content, matchStart, isImage) {
    const labelStart = matchStart + (isImage ? 2 : 1);
    const labelEnd = findMarkdownLinkLabelEnd(content, labelStart);
    if (labelEnd === -1) {
        return undefined;
    }

    if (content[labelEnd + 1] !== "(") {
        return { nextOffset: labelEnd + 1 };
    }

    const destinationStart = labelEnd + 2;
    const destinationEnd = findMarkdownLinkDestinationEnd(
        content,
        destinationStart
    );
    if (destinationEnd === -1) {
        return undefined;
    }

    const nextOffset = destinationEnd + 1;
    if (destinationEnd === destinationStart) {
        return { nextOffset };
    }

    return {
        link: {
            destination: content.slice(destinationStart, destinationEnd),
            fullMatch: content.slice(matchStart, nextOffset),
            isImage,
            label: content.slice(labelStart, labelEnd),
        },
        nextOffset,
    };
}

/**
 * Extract Markdown inline links and images in one bounded linear scan. Fenced
 * and inline code are removed first so example syntax is ignored.
 *
 * @param {string} content
 *
 * @returns {readonly MarkdownInlineLink[]}
 */
export function extractMarkdownInlineLinks(content) {
    const proseContent = stripMarkdownCode(content);
    /** @type {MarkdownInlineLink[]} */
    const links = [];
    let offset = 0;

    while (offset < proseContent.length) {
        const isImage =
            proseContent[offset] === "!" && proseContent[offset + 1] === "[";
        if (!isImage && proseContent[offset] !== "[") {
            offset += 1;
            continue;
        }

        const parseResult = parseMarkdownInlineLinkAt(
            proseContent,
            offset,
            isImage
        );
        if (parseResult === undefined) {
            break;
        }

        if (parseResult.link !== undefined) {
            links.push(parseResult.link);
        }

        offset = parseResult.nextOffset;
    }

    return links;
}

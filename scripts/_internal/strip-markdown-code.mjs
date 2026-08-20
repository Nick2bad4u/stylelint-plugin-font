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

    for (let offset = 0; offset < proseContent.length; offset += 1) {
        const isImage =
            proseContent[offset] === "!" && proseContent[offset + 1] === "[";
        if (!isImage && proseContent[offset] !== "[") {
            continue;
        }

        const matchStart = offset;
        const labelStart = offset + (isImage ? 2 : 1);
        let labelEnd = -1;
        let isEscaped = false;

        for (
            let characterOffset = labelStart;
            characterOffset < proseContent.length;
            characterOffset += 1
        ) {
            const character = proseContent[characterOffset];
            if (isEscaped) {
                isEscaped = false;
                continue;
            }

            if (character === "\\") {
                isEscaped = true;
                continue;
            }

            if (character === "]") {
                labelEnd = characterOffset;
                break;
            }
        }

        if (labelEnd === -1) {
            break;
        }

        if (proseContent[labelEnd + 1] !== "(") {
            offset = labelEnd;
            continue;
        }

        const destinationStart = labelEnd + 2;
        let destinationEnd = -1;
        let parenthesisDepth = 1;
        isEscaped = false;

        for (
            let characterOffset = destinationStart;
            characterOffset < proseContent.length;
            characterOffset += 1
        ) {
            const character = proseContent[characterOffset];
            if (isEscaped) {
                isEscaped = false;
                continue;
            }

            if (character === "\\") {
                isEscaped = true;
                continue;
            }

            if (character === "(") {
                parenthesisDepth += 1;
            } else if (character === ")") {
                parenthesisDepth -= 1;
                if (parenthesisDepth === 0) {
                    destinationEnd = characterOffset;
                    break;
                }
            }
        }

        if (destinationEnd === -1) {
            break;
        }

        if (destinationEnd === destinationStart) {
            offset = destinationEnd;
            continue;
        }

        links.push({
            destination: proseContent.slice(destinationStart, destinationEnd),
            fullMatch: proseContent.slice(matchStart, destinationEnd + 1),
            isImage,
            label: proseContent.slice(labelStart, labelEnd),
        });
        offset = destinationEnd;
    }

    return links;
}

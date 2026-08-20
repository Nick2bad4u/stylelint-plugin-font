export type MarkdownInlineLink = Readonly<{
    destination: string;
    fullMatch: string;
    isImage: boolean;
    label: string;
}>;

export function stripMarkdownCode(content: string): string;

export function splitMarkdownLines(content: string): readonly string[];

export function extractMarkdownInlineLinks(
    content: string
): readonly MarkdownInlineLink[];

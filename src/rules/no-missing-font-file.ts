import type { Root } from "postcss";

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import stylelint, { type RuleBase } from "stylelint";
import { isDefined } from "ts-extras";

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
const ruleName = createRuleName("no-missing-font-file");
const messages: { rejected: (url: string, resolvedPath: string) => string } =
    ruleMessages(ruleName, {
        rejected: (url: string, resolvedPath: string): string =>
            `Missing local font file for src URL "${url}". Expected file at "${resolvedPath}". Fix the path or place the font asset at that location.`,
    });
const docs = {
    description:
        "Disallow local `@font-face src:url(...)` paths that do not resolve to an existing font file on disk.",
    recommended: false,
    url: createRuleDocsUrl("no-missing-font-file"),
} as const;

function decodeUrlPath(pathLikeUrl: string): string {
    try {
        return decodeURI(pathLikeUrl);
    } catch {
        return pathLikeUrl;
    }
}

function getFirstDelimiterIndex(queryIndex: number, hashIndex: number): number {
    if (queryIndex === -1 && hashIndex === -1) {
        return -1;
    }

    if (queryIndex === -1) {
        return hashIndex;
    }

    if (hashIndex === -1) {
        return queryIndex;
    }

    return Math.min(queryIndex, hashIndex);
}

function getLocalResolvedPath(
    sourceFilePath: string,
    entry: Readonly<ReturnType<typeof parseFontSrcEntries>[number]>
): string | undefined {
    if (!entry.isUrl || entry.isLocal || !isDefined(entry.url)) {
        return undefined;
    }

    if (!isLocalPathUrl(entry.url)) {
        return undefined;
    }

    return toResolvedPath(sourceFilePath, entry.url);
}

function getSourceFilePath(root: Readonly<Root>): string | undefined {
    const sourcePath = root.source?.input.file;

    if (!isDefined(sourcePath) || sourcePath.trim().length === 0) {
        return undefined;
    }

    if (!sourcePath.startsWith("file://")) {
        return sourcePath;
    }

    try {
        return fileURLToPath(sourcePath);
    } catch {
        return undefined;
    }
}

function hasExistingFile(
    cache: Map<string, boolean>,
    resolvedPath: string
): boolean {
    const cached = cache.get(resolvedPath);

    if (isDefined(cached)) {
        return cached;
    }

    const hasFile = existsSync(resolvedPath);
    cache.set(resolvedPath, hasFile);

    return hasFile;
}

function isLocalPathUrl(url: string): boolean {
    const normalized = url.trim();

    if (normalized.length === 0) {
        return false;
    }

    if (normalized.startsWith("#") || normalized.startsWith("var(")) {
        return false;
    }

    if (/^[a-z][\d+\-.a-z]*:/iu.test(normalized)) {
        return false;
    }

    if (
        normalized.startsWith("//") ||
        normalized.startsWith("/") ||
        normalized.startsWith("\\")
    ) {
        return false;
    }

    return true;
}

function stripQueryAndFragment(url: string): string {
    const queryIndex = url.indexOf("?");
    const hashIndex = url.indexOf("#");
    const cutIndex = getFirstDelimiterIndex(queryIndex, hashIndex);

    if (cutIndex === -1) {
        return url;
    }

    return url.slice(0, cutIndex);
}

function toResolvedPath(
    sourceFilePath: string,
    url: string
): string | undefined {
    const urlPath = stripQueryAndFragment(url).trim();

    if (urlPath.length === 0) {
        return undefined;
    }

    const decodedPath = decodeUrlPath(urlPath);

    if (path.isAbsolute(decodedPath)) {
        return path.normalize(decodedPath);
    }

    return path.resolve(path.dirname(sourceFilePath), decodedPath);
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

        const sourceFilePath = getSourceFilePath(root);

        if (!isDefined(sourceFilePath)) {
            return;
        }

        const existenceCache = new Map<string, boolean>();

        for (const block of collectFontFaceBlocks(root)) {
            const srcDecl = block.srcDecl;

            if (!isDefined(srcDecl)) {
                continue;
            }

            for (const entry of parseFontSrcEntries(srcDecl.value)) {
                const resolvedPath = getLocalResolvedPath(
                    sourceFilePath,
                    entry
                );

                if (!isDefined(resolvedPath)) {
                    continue;
                }

                if (hasExistingFile(existenceCache, resolvedPath)) {
                    continue;
                }

                const originalUrl =
                    entry.url ?? entry.normalizedUrl ?? entry.raw;

                report({
                    message: messages.rejected(originalUrl, resolvedPath),
                    node: srcDecl,
                    result,
                    ruleName,
                    word: entry.raw,
                });
            }
        }
    };

/** Disallow local font URLs that reference files missing from disk. */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

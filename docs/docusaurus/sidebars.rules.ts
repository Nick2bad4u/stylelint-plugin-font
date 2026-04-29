import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/**
 * Rule and config docs sidebar for the font-focused Stylelint plugin docs
 * section.
 */
const sidebars: SidebarsConfig = {
    rules: [
        {
            className: "sb-doc-overview",
            id: "overview",
            label: "🏁 Overview",
            type: "doc",
        },
        {
            className: "sb-doc-getting-started",
            id: "getting-started",
            label: "🚀 Getting Started",
            type: "doc",
        },
        {
            className: "sb-cat-configs",
            collapsed: false,
            customProps: {
                badge: "configs",
            },
            items: [
                {
                    className: "sb-config-font-recommended",
                    id: "configs/font-recommended",
                    label: "🟡 font-recommended",
                    type: "doc",
                },
                {
                    className: "sb-config-font-all",
                    id: "configs/font-all",
                    label: "🟣 font-all",
                    type: "doc",
                },
            ],
            label: "Configs",
            link: {
                id: "configs/index",
                type: "doc",
            },
            type: "category",
        },
        {
            className: "sb-cat-guides",
            collapsed: false,
            customProps: {
                badge: "guides",
            },
            items: [
                {
                    id: "guides/current-status",
                    label: "🧭 Current Status",
                    type: "doc",
                },
            ],
            label: "Guides",
            link: {
                description:
                    "Status and maintenance notes for the font-focused rule catalog.",
                title: "Guides",
                type: "generated-index",
            },
            type: "category",
        },
        {
            className: "sb-cat-rules",
            collapsed: false,
            customProps: {
                badge: "rules",
            },
            items: [
                {
                    id: "require-font-display",
                    label: "require-font-display",
                    type: "doc",
                },
                {
                    id: "require-font-style",
                    label: "require-font-style",
                    type: "doc",
                },
                {
                    id: "require-font-weight",
                    label: "require-font-weight",
                    type: "doc",
                },
                {
                    id: "require-unicode-range-for-large-family",
                    label: "require-unicode-range-for-large-family",
                    type: "doc",
                },
                {
                    id: "require-format-hint",
                    label: "require-format-hint",
                    type: "doc",
                },
                {
                    id: "local-src-before-url",
                    label: "local-src-before-url",
                    type: "doc",
                },
                {
                    id: "prefer-woff2",
                    label: "prefer-woff2",
                    type: "doc",
                },
                {
                    id: "no-legacy-formats",
                    label: "no-legacy-formats",
                    type: "doc",
                },
                {
                    id: "woff2-before-woff",
                    label: "woff2-before-woff",
                    type: "doc",
                },
                {
                    id: "no-data-uri-src",
                    label: "no-data-uri-src",
                    type: "doc",
                },
                {
                    id: "no-duplicate-font-face",
                    label: "no-duplicate-font-face",
                    type: "doc",
                },
                {
                    id: "consistent-font-display",
                    label: "consistent-font-display",
                    type: "doc",
                },
                {
                    id: "consistent-font-family-casing",
                    label: "consistent-font-family-casing",
                    type: "doc",
                },
                {
                    id: "no-whitespace-in-unquoted-family",
                    label: "no-whitespace-in-unquoted-family",
                    type: "doc",
                },
                {
                    id: "require-system-font-fallback",
                    label: "require-system-font-fallback",
                    type: "doc",
                },
                {
                    id: "no-missing-fallback-before-web-font",
                    label: "no-missing-fallback-before-web-font",
                    type: "doc",
                },
                {
                    id: "prefer-variable-fonts",
                    label: "prefer-variable-fonts",
                    type: "doc",
                },
                {
                    id: "no-absolute-font-url",
                    label: "no-absolute-font-url",
                    type: "doc",
                },
                {
                    id: "no-overlapping-unicode-range",
                    label: "no-overlapping-unicode-range",
                    type: "doc",
                },
                {
                    id: "no-generic-family-in-font-face",
                    label: "no-generic-family-in-font-face",
                    type: "doc",
                },
                {
                    id: "no-protocol-relative-font-url",
                    label: "no-protocol-relative-font-url",
                    type: "doc",
                },
                {
                    id: "require-src-in-font-face",
                    label: "require-src-in-font-face",
                    type: "doc",
                },
                {
                    id: "no-empty-font-face",
                    label: "no-empty-font-face",
                    type: "doc",
                },
                {
                    id: "no-duplicate-src-format",
                    label: "no-duplicate-src-format",
                    type: "doc",
                },
                {
                    id: "no-font-face-in-media-query",
                    label: "no-font-face-in-media-query",
                    type: "doc",
                },
                {
                    id: "require-font-family-in-font-face",
                    label: "require-font-family-in-font-face",
                    type: "doc",
                },
                {
                    id: "no-unquoted-font-family-in-font-face",
                    label: "no-unquoted-font-family-in-font-face",
                    type: "doc",
                },
                {
                    id: "no-http-font-url",
                    label: "no-http-font-url",
                    type: "doc",
                },
                {
                    id: "no-duplicate-descriptors-in-font-face",
                    label: "no-duplicate-descriptors-in-font-face",
                    type: "doc",
                },
                {
                    id: "no-local-src-in-font-face",
                    label: "no-local-src-in-font-face",
                    type: "doc",
                },
                {
                    id: "no-src-format-mismatch",
                    label: "no-src-format-mismatch",
                    type: "doc",
                },
                {
                    id: "no-invalid-font-weight",
                    label: "no-invalid-font-weight",
                    type: "doc",
                },
                {
                    id: "no-invalid-font-style",
                    label: "no-invalid-font-style",
                    type: "doc",
                },
                {
                    id: "no-font-face-in-selectors",
                    label: "no-font-face-in-selectors",
                    type: "doc",
                },
            ],
            label: "Rules",
            link: {
                description:
                    "Reference documentation for the public font-loading and fallback rule catalog in this package.",
                title: "Rules",
                type: "generated-index",
            },
            type: "category",
        },
    ],
} satisfies SidebarsConfig;

export default sidebars;

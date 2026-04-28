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
                    label: "R001 require-font-display",
                    type: "doc",
                },
                {
                    id: "require-font-style",
                    label: "R002 require-font-style",
                    type: "doc",
                },
                {
                    id: "require-font-weight",
                    label: "R003 require-font-weight",
                    type: "doc",
                },
                {
                    id: "require-unicode-range-for-large-family",
                    label: "R004 require-unicode-range-for-large-family",
                    type: "doc",
                },
                {
                    id: "require-format-hint",
                    label: "R005 require-format-hint",
                    type: "doc",
                },
                {
                    id: "local-src-before-url",
                    label: "R006 local-src-before-url",
                    type: "doc",
                },
                {
                    id: "prefer-woff2",
                    label: "R007 prefer-woff2",
                    type: "doc",
                },
                {
                    id: "no-legacy-formats",
                    label: "R008 no-legacy-formats",
                    type: "doc",
                },
                {
                    id: "woff2-before-woff",
                    label: "R009 woff2-before-woff",
                    type: "doc",
                },
                {
                    id: "no-data-uri-src",
                    label: "R010 no-data-uri-src",
                    type: "doc",
                },
                {
                    id: "no-duplicate-font-face",
                    label: "R011 no-duplicate-font-face",
                    type: "doc",
                },
                {
                    id: "consistent-font-display",
                    label: "R012 consistent-font-display",
                    type: "doc",
                },
                {
                    id: "consistent-font-family-casing",
                    label: "R013 consistent-font-family-casing",
                    type: "doc",
                },
                {
                    id: "no-whitespace-in-unquoted-family",
                    label: "R014 no-whitespace-in-unquoted-family",
                    type: "doc",
                },
                {
                    id: "require-system-font-fallback",
                    label: "R015 require-system-font-fallback",
                    type: "doc",
                },
                {
                    id: "no-missing-fallback-before-web-font",
                    label: "R016 no-missing-fallback-before-web-font",
                    type: "doc",
                },
                {
                    id: "prefer-variable-fonts",
                    label: "R017 prefer-variable-fonts",
                    type: "doc",
                },
                {
                    id: "no-absolute-font-url",
                    label: "R018 no-absolute-font-url",
                    type: "doc",
                },
                {
                    id: "no-overlapping-unicode-range",
                    label: "R019 no-overlapping-unicode-range",
                    type: "doc",
                },
                {
                    id: "no-generic-family-in-font-face",
                    label: "R020 no-generic-family-in-font-face",
                    type: "doc",
                },
                {
                    id: "no-protocol-relative-font-url",
                    label: "R021 no-protocol-relative-font-url",
                    type: "doc",
                },
                {
                    id: "require-src-in-font-face",
                    label: "R022 require-src-in-font-face",
                    type: "doc",
                },
                {
                    id: "no-empty-font-face",
                    label: "R023 no-empty-font-face",
                    type: "doc",
                },
                {
                    id: "no-duplicate-src-format",
                    label: "R024 no-duplicate-src-format",
                    type: "doc",
                },
                {
                    id: "no-font-face-in-media-query",
                    label: "R025 no-font-face-in-media-query",
                    type: "doc",
                },
                {
                    id: "require-font-family-in-font-face",
                    label: "R026 require-font-family-in-font-face",
                    type: "doc",
                },
                {
                    id: "no-unquoted-font-family-in-font-face",
                    label: "R027 no-unquoted-font-family-in-font-face",
                    type: "doc",
                },
                {
                    id: "no-http-font-url",
                    label: "R028 no-http-font-url",
                    type: "doc",
                },
                {
                    id: "no-duplicate-descriptors-in-font-face",
                    label: "R029 no-duplicate-descriptors-in-font-face",
                    type: "doc",
                },
                {
                    id: "no-local-src-in-font-face",
                    label: "R030 no-local-src-in-font-face",
                    type: "doc",
                },
                {
                    id: "no-src-format-mismatch",
                    label: "R031 no-src-format-mismatch",
                    type: "doc",
                },
                {
                    id: "no-invalid-font-weight",
                    label: "R032 no-invalid-font-weight",
                    type: "doc",
                },
                {
                    id: "no-invalid-font-style",
                    label: "R033 no-invalid-font-style",
                    type: "doc",
                },
                {
                    id: "no-font-face-in-selectors",
                    label: "R034 no-font-face-in-selectors",
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

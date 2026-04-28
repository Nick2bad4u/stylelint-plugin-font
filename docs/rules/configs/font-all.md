---
title: font-all
description: Enables the full stylelint-plugin-font rule catalog.
---

# font-all

`font-all` enables every public `font/*` rule exported by this package.

Use it when you want the strictest repository-wide font-quality policy.

## Rules in this config

**Fix legend:** 🔧 = autofixable · — = report only

| Rule | Fix | Description |
| --- | :-: | --- |
| [`consistent-font-display`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/consistent-font-display) | — | Require `@font-face` declarations in the same file to use a consistent `font-display` value. |
| [`consistent-font-family-casing`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/consistent-font-family-casing) | 🔧 | Require consistent `font-family` casing across `@font-face` declarations. |
| [`local-src-before-url`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/local-src-before-url) | 🔧 | Require `local(...)` entries to appear before `url(...)` entries in `@font-face src`. |
| [`no-absolute-font-url`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-absolute-font-url) | — | Disallow absolute root-relative font URLs in `@font-face src` declarations. |
| [`no-data-uri-src`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-data-uri-src) | — | Disallow `data:` URL font sources in `@font-face src`. |
| [`no-duplicate-descriptors-in-font-face`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-duplicate-descriptors-in-font-face) | — | Disallow duplicate descriptor declarations within a single `@font-face` block. |
| [`no-duplicate-font-face`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-duplicate-font-face) | — | Disallow duplicate `@font-face` blocks that share the same `font-family` + `font-style` + `font-weight` variant. |
| [`no-duplicate-src-format`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-duplicate-src-format) | — | Disallow duplicate explicit `format()` hints within a single `@font-face src` declaration. |
| [`no-empty-font-face`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-empty-font-face) | — | Disallow empty `@font-face` declaration blocks that contain no descriptors. |
| [`no-font-face-in-media-query`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-font-face-in-media-query) | — | Disallow `@font-face` blocks nested inside `@media`, `@supports`, or `@container` at-rules. |
| [`no-generic-family-in-font-face`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-generic-family-in-font-face) | — | Disallow CSS generic family keywords as `font-family` descriptor values inside `@font-face` blocks. |
| [`no-http-font-url`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-http-font-url) | — | Disallow plain `http://` URLs in `@font-face src` declarations. |
| [`no-legacy-formats`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-legacy-formats) | 🔧 | Disallow legacy `@font-face` formats (`eot`, `svg`, `truetype`) in modern projects. |
| [`no-local-src-in-font-face`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-local-src-in-font-face) | — | Disallow `local()` references in `@font-face src` declarations. |
| [`no-missing-fallback-before-web-font`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-missing-fallback-before-web-font) | — | Disallow web-font-first `font-family` stacks that omit a fallback family. |
| [`no-overlapping-unicode-range`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-overlapping-unicode-range) | — | Disallow overlapping `unicode-range` subsets across `@font-face` blocks that share the same family/style/weight tuple. |
| [`no-protocol-relative-font-url`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-protocol-relative-font-url) | — | Disallow protocol-relative URLs (`//`) in `@font-face src` declarations. |
| [`no-src-format-mismatch`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-src-format-mismatch) | — | Disallow `@font-face src` entries where the URL file extension contradicts the explicit `format()` hint. |
| [`no-unquoted-font-family-in-font-face`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-unquoted-font-family-in-font-face) | 🔧 | Require the `font-family` descriptor value inside `@font-face` to be quoted. |
| [`no-whitespace-in-unquoted-family`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-whitespace-in-unquoted-family) | 🔧 | Disallow unquoted whitespace-containing `font-family` names. |
| [`prefer-variable-fonts`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/prefer-variable-fonts) | — | Prefer variable-font workflows when the same family defines many static `@font-face` weight variants. |
| [`prefer-woff2`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/prefer-woff2) | — | Prefer including a `woff2` source in every `@font-face` src list. |
| [`require-font-display`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/require-font-display) | 🔧 | Require `font-display` in every `@font-face` declaration block. |
| [`require-font-family-in-font-face`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/require-font-family-in-font-face) | — | Require a `font-family` descriptor in every `@font-face` declaration block. |
| [`require-font-style`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/require-font-style) | 🔧 | Require explicit `font-style` in every `@font-face` block. |
| [`require-font-weight`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/require-font-weight) | 🔧 | Require explicit `font-weight` in every `@font-face` block. |
| [`require-format-hint`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/require-format-hint) | 🔧 | Require `format(...)` hints for `url(...)` sources in `@font-face src` values. |
| [`require-src-in-font-face`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/require-src-in-font-face) | — | Require a `src` descriptor in every `@font-face` declaration block. |
| [`require-system-font-fallback`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/require-system-font-fallback) | 🔧 | Require regular selector `font-family` stacks to end with a system fallback. |
| [`require-unicode-range-for-large-family`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/require-unicode-range-for-large-family) | — | Require `unicode-range` for families that define four or more `@font-face` blocks in the same file. |
| [`woff2-before-woff`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/woff2-before-woff) | 🔧 | Require `woff2` entries to appear before `woff` entries in `@font-face src`. |

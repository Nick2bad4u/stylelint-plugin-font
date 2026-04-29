---
title: font-recommended
description: Recommended baseline font-loading and fallback safety rules.
---

# font-recommended

`font-recommended` enables the curated default policy for modern CSS/SCSS font loading.

It includes declaration correctness, `src` ordering/format guidance, duplicate detection, and fallback-performance checks.

## Rules in this config

**Fix legend:** 🔧 = autofixable · — = report only

| Rule | Fix | Description |
| --- | :-: | --- |
| [`consistent-font-display`](../consistent-font-display.md) | — | Require `@font-face` declarations in the same file to use a consistent `font-display` value. |
| [`consistent-font-family-casing`](../consistent-font-family-casing.md) | 🔧 | Require consistent `font-family` casing across `@font-face` declarations. |
| [`local-src-before-url`](../local-src-before-url.md) | 🔧 | Require `local(...)` entries to appear before `url(...)` entries in `@font-face src`. |
| [`no-absolute-font-url`](../no-absolute-font-url.md) | — | Disallow absolute root-relative font URLs in `@font-face src` declarations. |
| [`no-data-uri-src`](../no-data-uri-src.md) | — | Disallow `data:` URL font sources in `@font-face src`. |
| [`no-duplicate-descriptors-in-font-face`](../no-duplicate-descriptors-in-font-face.md) | — | Disallow duplicate descriptor declarations within a single `@font-face` block. |
| [`no-duplicate-font-face`](../no-duplicate-font-face.md) | — | Disallow duplicate `@font-face` blocks that share the same `font-family` + `font-style` + `font-weight` variant. |
| [`no-duplicate-src-format`](../no-duplicate-src-format.md) | — | Disallow duplicate explicit `format()` hints within a single `@font-face src` declaration. |
| [`no-empty-font-face`](../no-empty-font-face.md) | — | Disallow empty `@font-face` declaration blocks that contain no descriptors. |
| [`no-font-face-in-selectors`](../no-font-face-in-selectors.md) | — | Disallow `@font-face` rules nested inside regular CSS selectors. |
| [`no-generic-family-in-font-face`](../no-generic-family-in-font-face.md) | — | Disallow CSS generic family keywords as `font-family` descriptor values inside `@font-face` blocks. |
| [`no-http-font-url`](../no-http-font-url.md) | — | Disallow plain `http://` URLs in `@font-face src` declarations. |
| [`no-invalid-font-style`](../no-invalid-font-style.md) | — | Disallow invalid `font-style` descriptor values in `@font-face` blocks. |
| [`no-invalid-font-weight`](../no-invalid-font-weight.md) | — | Disallow invalid `font-weight` descriptor values in `@font-face` blocks. |
| [`no-legacy-formats`](../no-legacy-formats.md) | 🔧 | Disallow legacy `@font-face` formats (`eot`, `svg`, `truetype`) in modern projects. |
| [`no-missing-fallback-before-web-font`](../no-missing-fallback-before-web-font.md) | — | Disallow web-font-first `font-family` stacks that omit a fallback family. |
| [`no-overlapping-unicode-range`](../no-overlapping-unicode-range.md) | — | Disallow overlapping `unicode-range` subsets across `@font-face` blocks that share the same family/style/weight tuple. |
| [`no-protocol-relative-font-url`](../no-protocol-relative-font-url.md) | — | Disallow protocol-relative URLs (`//`) in `@font-face src` declarations. |
| [`no-src-format-mismatch`](../no-src-format-mismatch.md) | — | Disallow `@font-face src` entries where the URL file extension contradicts the explicit `format()` hint. |
| [`no-unquoted-font-family-in-font-face`](../no-unquoted-font-family-in-font-face.md) | 🔧 | Require the `font-family` descriptor value inside `@font-face` to be quoted. |
| [`no-whitespace-in-unquoted-family`](../no-whitespace-in-unquoted-family.md) | 🔧 | Disallow unquoted whitespace-containing `font-family` names. |
| [`prefer-variable-fonts`](../prefer-variable-fonts.md) | — | Prefer variable-font workflows when the same family defines many static `@font-face` weight variants. |
| [`prefer-woff2`](../prefer-woff2.md) | — | Prefer including a `woff2` source in every `@font-face` src list. |
| [`require-font-display`](../require-font-display.md) | 🔧 | Require `font-display` in every `@font-face` declaration block. |
| [`require-font-family-in-font-face`](../require-font-family-in-font-face.md) | — | Require a `font-family` descriptor in every `@font-face` declaration block. |
| [`require-font-style`](../require-font-style.md) | 🔧 | Require explicit `font-style` in every `@font-face` block. |
| [`require-font-weight`](../require-font-weight.md) | 🔧 | Require explicit `font-weight` in every `@font-face` block. |
| [`require-format-hint`](../require-format-hint.md) | 🔧 | Require `format(...)` hints for `url(...)` sources in `@font-face src` values. |
| [`require-src-in-font-face`](../require-src-in-font-face.md) | — | Require a `src` descriptor in every `@font-face` declaration block. |
| [`require-system-font-fallback`](../require-system-font-fallback.md) | 🔧 | Require regular selector `font-family` stacks to end with a system fallback. |
| [`require-unicode-range-for-large-family`](../require-unicode-range-for-large-family.md) | — | Require `unicode-range` for families that define four or more `@font-face` blocks in the same file. |
| [`woff2-before-woff`](../woff2-before-woff.md) | 🔧 | Require `woff2` entries to appear before `woff` entries in `@font-face src`. |

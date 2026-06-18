---
title: font-all
description: Enables the full stylelint-plugin-font rule catalog.
---

# font-all

`font-all` enables every public `font/*` rule exported by this package.

Use it when you want the strictest repository-wide font-quality policy.

## Rules in this config

**Fix legend:** 🔧 = autofixable · — = report only

| Rule                                                                                     | Fix | Description                                                                                                                                |
| ---------------------------------------------------------------------------------------- | :-: | ------------------------------------------------------------------------------------------------------------------------------------------ |
| [`consistent-font-display`](../consistent-font-display.md)                               |  —  | Require `@font-face` declarations in the same file to use a consistent `font-display` value.                                               |
| [`consistent-font-family-casing`](../consistent-font-family-casing.md)                   | 🔧  | Require consistent `font-family` casing across `@font-face` declarations.                                                                  |
| [`local-src-before-url`](../local-src-before-url.md)                                     | 🔧  | Require `local(...)` entries to appear before `url(...)` entries in `@font-face src`.                                                      |
| [`no-absolute-font-url`](../no-absolute-font-url.md)                                     |  —  | Disallow absolute root-relative font URLs in `@font-face src` declarations.                                                                |
| [`no-data-uri-src`](../no-data-uri-src.md)                                               |  —  | Disallow `data:` URL font sources in `@font-face src`.                                                                                     |
| [`no-duplicate-descriptors-in-font-face`](../no-duplicate-descriptors-in-font-face.md)   |  —  | Disallow duplicate descriptor declarations within a single `@font-face` block.                                                             |
| [`no-duplicate-font-face`](../no-duplicate-font-face.md)                                 |  —  | Disallow duplicate `@font-face` blocks that share the same `font-family` + `font-style` + `font-weight` variant.                           |
| [`no-duplicate-font-family-src`](../no-duplicate-font-family-src.md)                     |  —  | Disallow duplicate `src` URLs across `@font-face` blocks that share the same `font-family` name.                                           |
| [`no-duplicate-src-format`](../no-duplicate-src-format.md)                               |  —  | Disallow duplicate explicit `format()` hints within a single `@font-face src` declaration.                                                 |
| [`no-empty-font-face`](../no-empty-font-face.md)                                         |  —  | Disallow empty `@font-face` declaration blocks that contain no descriptors.                                                                |
| [`no-font-face-in-media-query`](../no-font-face-in-media-query.md)                       |  —  | Disallow `@font-face` blocks nested inside `@media`, `@supports`, or `@container` at-rules.                                                |
| [`no-font-face-in-selectors`](../no-font-face-in-selectors.md)                           |  —  | Disallow `@font-face` rules nested inside regular CSS selectors.                                                                           |
| [`no-generic-family-in-font-face`](../no-generic-family-in-font-face.md)                 |  —  | Disallow CSS generic family keywords as `font-family` descriptor values inside `@font-face` blocks.                                        |
| [`no-http-font-url`](../no-http-font-url.md)                                             |  —  | Disallow plain `http://` URLs in `@font-face src` declarations.                                                                            |
| [`no-invalid-font-display`](../no-invalid-font-display.md)                               |  —  | Disallow invalid `font-display` descriptor values in `@font-face` blocks.                                                                  |
| [`no-invalid-font-style`](../no-invalid-font-style.md)                                   |  —  | Disallow invalid `font-style` descriptor values in `@font-face` blocks.                                                                    |
| [`no-invalid-font-weight`](../no-invalid-font-weight.md)                                 |  —  | Disallow invalid `font-weight` descriptor values in `@font-face` blocks.                                                                   |
| [`no-invalid-unicode-range`](../no-invalid-unicode-range.md)                             |  —  | Disallow invalid `unicode-range` descriptor values in `@font-face` blocks.                                                                 |
| [`no-legacy-formats`](../no-legacy-formats.md)                                           | 🔧  | Disallow legacy `@font-face` formats (`eot`, `svg`, `truetype`) in modern projects.                                                        |
| [`no-local-src-in-font-face`](../no-local-src-in-font-face.md)                           |  —  | Disallow `local()` references in `@font-face src` declarations.                                                                            |
| [`no-missing-fallback-before-web-font`](../no-missing-fallback-before-web-font.md)       |  —  | Disallow web-font-first `font-family` stacks that omit a fallback family.                                                                  |
| [`no-missing-font-file`](../no-missing-font-file.md)                                     |  —  | Disallow local `@font-face src:url(...)` paths that do not resolve to an existing font file on disk.                                       |
| [`no-overlapping-unicode-range`](../no-overlapping-unicode-range.md)                     |  —  | Disallow overlapping `unicode-range` subsets across `@font-face` blocks that share the same family/style/weight tuple.                     |
| [`no-protocol-relative-font-url`](../no-protocol-relative-font-url.md)                   |  —  | Disallow protocol-relative URLs (`//`) in `@font-face src` declarations.                                                                   |
| [`no-src-format-mismatch`](../no-src-format-mismatch.md)                                 |  —  | Disallow `@font-face src` entries where the URL file extension contradicts the explicit `format()` hint.                                   |
| [`no-unquoted-font-family-in-font-face`](../no-unquoted-font-family-in-font-face.md)     | 🔧  | Require the `font-family` descriptor value inside `@font-face` to be quoted.                                                               |
| [`no-unused-font-face`](../no-unused-font-face.md)                                       |  —  | Disallow `@font-face` blocks whose `font-family` name is never referenced in any `font-family` declaration.                                |
| [`no-whitespace-in-unquoted-family`](../no-whitespace-in-unquoted-family.md)             | 🔧  | Disallow unquoted whitespace-containing `font-family` names.                                                                               |
| [`prefer-variable-fonts`](../prefer-variable-fonts.md)                                   |  —  | Prefer variable-font workflows when the same family defines many static `@font-face` weight variants.                                      |
| [`prefer-woff2`](../prefer-woff2.md)                                                     |  —  | Prefer including a `woff2` source in every `@font-face` src list.                                                                          |
| [`require-font-display`](../require-font-display.md)                                     | 🔧  | Require `font-display` in every `@font-face` declaration block.                                                                            |
| [`require-font-family-in-font-face`](../require-font-family-in-font-face.md)             |  —  | Require a `font-family` descriptor in every `@font-face` declaration block.                                                                |
| [`require-font-style`](../require-font-style.md)                                         | 🔧  | Require explicit `font-style` in every `@font-face` block.                                                                                 |
| [`require-font-weight`](../require-font-weight.md)                                       | 🔧  | Require explicit `font-weight` in every `@font-face` block.                                                                                |
| [`require-format-hint`](../require-format-hint.md)                                       | 🔧  | Require `format(...)` hints for `url(...)` sources in `@font-face src` values.                                                             |
| [`require-src-in-font-face`](../require-src-in-font-face.md)                             |  —  | Require a `src` descriptor in every `@font-face` declaration block.                                                                        |
| [`require-system-font-fallback`](../require-system-font-fallback.md)                     | 🔧  | Require regular selector `font-family` stacks to end with a system fallback.                                                               |
| [`require-unicode-range-for-large-family`](../require-unicode-range-for-large-family.md) |  —  | Require `unicode-range` for families that define four or more `@font-face` blocks in the same file.                                        |
| [`require-unicode-range-for-subset-fonts`](../require-unicode-range-for-subset-fonts.md) |  —  | Require `unicode-range` when `@font-face src` URLs appear to target script/language subsets (for example `latin`, `cyrillic`, `japanese`). |
| [`woff2-before-woff`](../woff2-before-woff.md)                                           | 🔧  | Require `woff2` entries to appear before `woff` entries in `@font-face src`.                                                               |

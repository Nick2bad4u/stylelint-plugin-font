---
title: Current Status
description: Current status of the public stylelint-plugin-font rule catalog.
---

# Current Status

The plugin currently ships **34** public `font/*` rules.

The catalog covers:

- required `@font-face` declarations (`font-display`, `font-style`, `font-weight`, `unicode-range`, `src`)
- `src` quality and ordering (`local()`, `woff2`, format hints, legacy/data URI detection, protocol-relative URL prevention, duplicate format hints)
- duplicate and consistency checks across font-face blocks (including overlapping unicode subsets)
- `font-family` descriptor correctness (generic keyword prevention, empty block prevention)
- placement rules for `@font-face` (top-level vs. inside conditional at-rules)
- runtime fallback and deployment safety checks on `font-family` usage

The repository is now in active rule-authoring mode with a font-loading and performance focus.

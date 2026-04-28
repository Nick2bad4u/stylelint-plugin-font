---
title: Current Status
description: Current status of the public stylelint-plugin-font rule catalog.
---

# Current Status

The plugin currently ships **18** public `font/*` rules.

The catalog covers:

- required `@font-face` declarations (`font-display`, `font-style`, `font-weight`, `unicode-range`)
- `src` quality and ordering (`local()`, `woff2`, format hints, legacy/data URI detection)
- duplicate and consistency checks across font-face blocks
- runtime fallback and deployment safety checks on `font-family` usage

The repository is now in active rule-authoring mode with a font-loading and performance focus.

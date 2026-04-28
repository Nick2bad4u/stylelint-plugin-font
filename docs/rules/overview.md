---
title: Overview
description: Overview of stylelint-plugin-font and its package surface.
---

# stylelint-plugin-font

`stylelint-plugin-font` is a Stylelint plugin focused on font-loading quality, `@font-face` correctness, and performance-oriented fallback hygiene.

The repository uses a modern Stylelint plugin architecture with typed rule modules, statically authored rule metadata, and shareable config exports.

## What the package currently exports

- A default Stylelint plugin pack export.
- A plugin-scoped shareable config map: `fontPluginConfigs`
  - `font-recommended`
  - `font-all`
- Static runtime metadata and typed helper infrastructure for future rule authoring.

## Current rule status

The public rule catalog includes **18** font-focused rules.

Current rule families cover:

- required `@font-face` declarations
- `src` order and format preferences
- duplicate/consistency checks across font-face blocks
- fallback and deployment safety checks in normal selectors

## What comes next

Future public rules can continue extending font-quality concerns such as:

- stricter optional variable-font migration detection
- locale/subset guidance beyond unicode-range presence
- refined fallback stack policies per project profile

The package surface is intentionally curated: the goal is high-signal font guidance, not duplication of generic CSS lint rules.

# stylelint-plugin-font

Stylelint plugin pack focused on font loading quality, `@font-face` correctness, and fallback performance best practices.

## Installation

```sh
npm install --save-dev stylelint stylelint-plugin-font
```

## Quick start

```js
import { fontPluginConfigs } from "stylelint-plugin-font";

export default fontPluginConfigs["font-recommended"];
```

Or via `extends`:

```js
export default {
 extends: ["stylelint-plugin-font/configs/font-recommended"],
};
```

## Exports

- default plugin pack (`default`)
- `fontPluginConfigs`
- `configNames`, `ruleNames`, `ruleIds`, `rules`, `meta`
- config subpaths:
  - `stylelint-plugin-font/configs/font-recommended`
  - `stylelint-plugin-font/configs/font-all`

## Configs

- `font-recommended`
- `font-all`

## Rules

**Fix legend:**

- 🔧 = autofixable
- — = report only

**Preset key legend:**

- [🟢](./docs/rules/configs/font-recommended.md) — `fontPluginConfigs["font-recommended"]`
- [🟣](./docs/rules/configs/font-all.md) — `fontPluginConfigs["font-all"]`

| Rule | Fix | Preset key | Description |
| --- | :-: | --- | --- |
| [`consistent-font-display`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/consistent-font-display) | — | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Require `@font-face` declarations in the same file to use a consistent `font-display` value. |
| [`consistent-font-family-casing`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/consistent-font-family-casing) | 🔧 | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Require consistent `font-family` casing across `@font-face` declarations. |
| [`local-src-before-url`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/local-src-before-url) | 🔧 | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Require `local(...)` entries to appear before `url(...)` entries in `@font-face src`. |
| [`no-absolute-font-url`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-absolute-font-url) | — | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Disallow absolute root-relative font URLs in `@font-face src` declarations. |
| [`no-data-uri-src`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-data-uri-src) | — | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Disallow `data:` URL font sources in `@font-face src`. |
| [`no-duplicate-font-face`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-duplicate-font-face) | — | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Disallow duplicate `@font-face` blocks that share the same `font-family` + `font-style` + `font-weight` variant. |
| [`no-legacy-formats`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-legacy-formats) | 🔧 | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Disallow legacy `@font-face` formats (`eot`, `svg`, `truetype`) in modern projects. |
| [`no-missing-fallback-before-web-font`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-missing-fallback-before-web-font) | — | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Disallow web-font-first `font-family` stacks that omit a fallback family. |
| [`no-whitespace-in-unquoted-family`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/no-whitespace-in-unquoted-family) | 🔧 | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Disallow unquoted whitespace-containing `font-family` names. |
| [`prefer-variable-fonts`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/prefer-variable-fonts) | — | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Prefer variable-font workflows when the same family defines many static `@font-face` weight variants. |
| [`prefer-woff2`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/prefer-woff2) | — | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Prefer including a `woff2` source in every `@font-face` src list. |
| [`require-font-display`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/require-font-display) | 🔧 | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Require `font-display` in every `@font-face` declaration block. |
| [`require-font-style`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/require-font-style) | 🔧 | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Require explicit `font-style` in every `@font-face` block. |
| [`require-font-weight`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/require-font-weight) | 🔧 | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Require explicit `font-weight` in every `@font-face` block. |
| [`require-format-hint`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/require-format-hint) | 🔧 | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Require `format(...)` hints for `url(...)` sources in `@font-face src` values. |
| [`require-system-font-fallback`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/require-system-font-fallback) | 🔧 | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Require regular selector `font-family` stacks to end with a system fallback. |
| [`require-unicode-range-for-large-family`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/require-unicode-range-for-large-family) | — | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Require `unicode-range` for families that define four or more `@font-face` blocks in the same file. |
| [`woff2-before-woff`](https://nick2bad4u.github.io/stylelint-plugin-font/docs/rules/woff2-before-woff) | 🔧 | [🟢](./docs/rules/configs/font-recommended.md) [🟣](./docs/rules/configs/font-all.md) | Require `woff2` entries to appear before `woff` entries in `@font-face src`. |

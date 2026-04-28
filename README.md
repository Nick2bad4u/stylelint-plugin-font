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

| Rule                                          |
| --------------------------------------------- |
| `font/consistent-font-display`                |
| `font/consistent-font-family-casing`          |
| `font/local-src-before-url`                   |
| `font/no-absolute-font-url`                   |
| `font/no-data-uri-src`                        |
| `font/no-duplicate-font-face`                 |
| `font/no-legacy-formats`                      |
| `font/no-missing-fallback-before-web-font`    |
| `font/no-whitespace-in-unquoted-family`       |
| `font/prefer-variable-fonts`                  |
| `font/prefer-woff2`                           |
| `font/require-font-display`                   |
| `font/require-font-style`                     |
| `font/require-font-weight`                    |
| `font/require-format-hint`                    |
| `font/require-system-font-fallback`           |
| `font/require-unicode-range-for-large-family` |
| `font/woff2-before-woff`                      |

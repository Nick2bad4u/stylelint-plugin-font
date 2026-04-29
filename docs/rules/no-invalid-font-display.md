# no-invalid-font-display

Disallow invalid `font-display` descriptor values in `@font-face` blocks.

> **Rule catalog ID:** R037

## Targeted pattern scope

- `font-display` declarations inside `@font-face` blocks.

## What this rule reports

This rule reports `font-display` values that are not valid CSS Fonts descriptors.

Valid values are:

- `auto`
- `block`
- `swap`
- `fallback`
- `optional`

## Why this rule exists

Invalid `font-display` values are ignored by browsers, which silently falls back to default behavior. That often causes inconsistent rendering strategy (FOIT/FOUT behavior) compared with project expectations.

Because this failure mode is silent at runtime, a dedicated lint rule catches mistakes earlier than visual QA.

## ❌ Incorrect

```css
@font-face {
  font-family: "Inter";
  font-display: fast;
  src: url("./inter.woff2") format("woff2");
}
```

```css
@font-face {
  font-family: "Inter";
  font-display: swapy;
  src: url("./inter.woff2") format("woff2");
}
```

## ✅ Correct

```css
@font-face {
  font-family: "Inter";
  font-display: swap;
  src: url("./inter.woff2") format("woff2");
}
```

```css
@font-face {
  font-family: "Inter";
  font-display: optional;
  src: url("./inter.woff2") format("woff2");
}
```

## Stylelint config example

```js
import fontPlugin, { fontPluginConfigs } from "stylelint-plugin-font";

export default {
  ...fontPluginConfigs["font-recommended"],
  plugins: [...fontPlugin],
  rules: {
    ...fontPluginConfigs["font-recommended"].rules,
    "font/no-invalid-font-display": true,
  },
};
```

## When not to use it

Disable this rule only if your stylesheets intentionally include non-standard custom-syntax tokens in `font-display` and a downstream transform rewrites them before they reach browsers.

## Further reading

- [MDN: `font-display`](https://developer.mozilla.org/docs/Web/CSS/@font-face/font-display)
- [CSS Fonts Module Level 4](https://www.w3.org/TR/css-fonts-4/#font-display-desc)

# no-invalid-unicode-range

Disallow invalid `unicode-range` descriptor values in `@font-face` blocks.

> **Rule catalog ID:** R038

## Targeted pattern scope

- `unicode-range` descriptors declared inside `@font-face`.

## What this rule reports

This rule reports `unicode-range` values that do not parse as valid Unicode range syntax.

Accepted patterns include:

- single codepoint: `U+00A0`
- explicit range: `U+0000-00FF`
- wildcard range: `U+4??`
- comma-separated lists of valid ranges

## Why this rule exists

Invalid `unicode-range` values are ignored by browsers, causing subset font loading strategies to fail silently.

When this happens, you can end up with unnecessary downloads or missing glyph behavior that only appears in certain scripts/locales.

## ❌ Incorrect

```css
@font-face {
 font-family: "Inter";
 src: url("./inter-latin.woff2") format("woff2");
 unicode-range: U+00??-FF;
}
```

```css
@font-face {
 font-family: "Inter";
 src: url("./inter-cjk.woff2") format("woff2");
 unicode-range: 0000-00FF;
}
```

## ✅ Correct

```css
@font-face {
 font-family: "Inter";
 src: url("./inter-latin.woff2") format("woff2");
 unicode-range: U+0000-00FF;
}
```

```css
@font-face {
 font-family: "Inter";
 src: url("./inter-icons.woff2") format("woff2");
 unicode-range: U+E000-F8FF, U+00A0;
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
  "font/no-invalid-unicode-range": true,
 },
};
```

## Further reading

- [MDN: `unicode-range`](https://developer.mozilla.org/docs/Web/CSS/@font-face/unicode-range)
- [CSS Fonts Module Level 4](https://www.w3.org/TR/css-fonts-4/#descdef-font-face-unicode-range)

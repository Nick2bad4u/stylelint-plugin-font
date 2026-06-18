# require-unicode-range-for-subset-fonts

Require `unicode-range` when a `@font-face src` URL appears to target a script/language subset (for example `latin`, `cyrillic`, or `japanese`).

> **Rule catalog ID:** R036

## Targeted pattern scope

- `@font-face` blocks that include a `src` descriptor and do not define `unicode-range`.
- URL sources whose path includes subset-like tokens separated by common delimiters (`-`, `_`, `.`, `/`).

Examples of matched tokens include `latin`, `latinext`, `cyrillic`, `greek`, `arabic`, `japanese`, `korean`, `han`, and related script names.

## What this rule reports

This rule reports `@font-face` blocks when both of these are true:

1. A `src:url(...)` value looks subset-specific based on the URL token.
2. The block omits `unicode-range`.

## Why this rule exists

Subset fonts are intended to load only for matching codepoint ranges. If subset files are shipped without `unicode-range`, browsers can fetch unnecessary files and lose the performance advantage of subsetting.

This is a common regression during asset-pipeline migrations where file names preserve subset hints (`inter-latin.woff2`) but descriptor metadata is not carried over.

## ❌ Incorrect

```css
@font-face {
 font-family: "Inter";
 src: url("./inter-latin.woff2") format("woff2");
}
```

## ✅ Correct

```css
@font-face {
 font-family: "Inter";
 unicode-range: U+0000-00FF;
 src: url("./inter-latin.woff2") format("woff2");
}
```

## Additional examples

```css
/* Also valid when using another subset token */
@font-face {
 font-family: "Inter";
 unicode-range: U+0400-04FF;
 src: url("./inter-cyrillic.woff2") format("woff2");
}
```

```css
/* Non-subset-looking file name is not targeted by this rule */
@font-face {
 font-family: "Inter";
 src: url("./inter-regular.woff2") format("woff2");
}
```

## Stylelint config example

```js
import fontPlugin, { fontPluginConfigs } from "stylelint-plugin-font";

export default {
 ...fontPluginConfigs["font-all"],
 plugins: [...fontPlugin],
 rules: {
  ...fontPluginConfigs["font-all"].rules,
  "font/require-unicode-range-for-subset-fonts": true,
 },
};
```

## When not to use it

Disable this rule if subset-like tokens in your font file names are purely historical naming artifacts and are not intended to express codepoint partitioning.

## Further reading

- [MDN: `@font-face` `unicode-range`](https://developer.mozilla.org/docs/Web/CSS/@font-face/unicode-range)
- [CSS Fonts Module Level 4](https://www.w3.org/TR/css-fonts-4/)

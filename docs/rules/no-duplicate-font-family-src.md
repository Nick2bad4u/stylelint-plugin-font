# no-duplicate-font-family-src

Disallow duplicate `src` URLs across `@font-face` blocks that share the same `font-family` name.

> **Rule catalog ID:** R039

## Targeted pattern scope

- `src` declarations inside `@font-face` blocks.

## What this rule reports

This rule reports when two or more `@font-face` blocks for the **same `font-family` name** reference the **same `src` URL** at least twice. Each `@font-face` variant (different weight, style, or unicode range) should load a distinct font file. Duplicate URLs almost always indicate a copy-paste error where the URL was not updated for the new variant.

## Why this rule exists

A common workflow is to copy an existing `@font-face` block and update only the weight or style descriptors. When the `src` URL is accidentally left unchanged, all variants load the same binary — wasting bandwidth and producing identical rendering regardless of which variant is selected.

This failure is invisible at runtime: the browser will use the duplicate file without error, but the intended weight or style variation will never appear.

## ❌ Incorrect

```css
/* Both weight variants load the same file — almost certainly a copy-paste bug */
@font-face {
 font-family: "Inter";
 font-weight: 400;
 src: url("./inter.woff2") format("woff2");
}

@font-face {
 font-family: "Inter";
 font-weight: 700;
 src: url("./inter.woff2") format("woff2");
}
```

## ✅ Correct

```css
@font-face {
 font-family: "Inter";
 font-weight: 400;
 src: url("./inter-400.woff2") format("woff2");
}

@font-face {
 font-family: "Inter";
 font-weight: 700;
 src: url("./inter-700.woff2") format("woff2");
}
```

```css
/* Different families may share a URL — only checked within the same family */
@font-face {
 font-family: "Inter";
 src: url("./inter.woff2") format("woff2");
}

@font-face {
 font-family: "Roboto";
 src: url("./roboto.woff2") format("woff2");
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
  "font/no-duplicate-font-family-src": true,
 },
};
```

## When not to use it

Disable this rule if you intentionally serve the same font file for multiple variants — for example, when a single OpenType font file contains multiple named instances and you want to expose them as separate CSS `@font-face` blocks using the same source binary. This pattern is rare in modern web font delivery but does occur with Variable Font subsetting workflows.

## Further reading

- [MDN: `@font-face`](https://developer.mozilla.org/docs/Web/CSS/@font-face)
- [CSS Fonts Module Level 4 — `src` descriptor](https://www.w3.org/TR/css-fonts-4/#src-desc)

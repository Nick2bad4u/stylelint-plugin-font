# no-missing-font-file

Disallow local `@font-face src:url(...)` paths that do not resolve to an existing file on disk.

> **Rule catalog ID:** R035

## Targeted pattern scope

- `url(...)` entries inside `@font-face` `src` descriptors.
- Only **local path** URLs are checked (for example `./fonts/inter.woff2`, `../assets/font.woff2`, or `font.woff2`).

## What this rule reports

This rule reports a warning when a local font URL cannot be resolved to a file on disk relative to the stylesheet file.

The rule intentionally skips non-local URL patterns, including:

- absolute/protocol URLs (`https://`, `http://`, `data:`, etc.)
- protocol-relative URLs (`//cdn.example.com/font.woff2`)
- root-relative URLs (`/fonts/inter.woff2`)
- dynamic URL values such as `url(var(--font-path))`

## Why this rule exists

Broken local font URLs are easy to miss during development, especially when moving CSS files or reorganizing asset folders.

When this happens, browsers fail to load the font at runtime and silently fall back to another family. This can cause:

- inconsistent typography across routes/pages
- avoidable network 404s
- late visual regressions discovered only after deployment

This rule catches those path issues at lint time.

## ❌ Incorrect

```css
/* ../fonts/inter.woff2 does not exist relative to this stylesheet */
@font-face {
 font-family: "Inter";
 src: url("../fonts/inter.woff2") format("woff2");
}
```

## ✅ Correct

```css
/* file exists on disk relative to the stylesheet */
@font-face {
 font-family: "Inter";
 src: url("../fonts/inter.woff2") format("woff2");
}
```

```css
/* remote URLs are intentionally ignored by this rule */
@font-face {
 font-family: "Inter";
 src: url("https://cdn.example.com/inter.woff2") format("woff2");
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
  "font/no-missing-font-file": true,
 },
};
```

## When not to use it

Disable this rule if your CSS intentionally uses build-time virtual URL schemes or non-filesystem asset resolvers that cannot be resolved from the source stylesheet path.

## Further reading

- [MDN: `@font-face` `src`](https://developer.mozilla.org/docs/Web/CSS/@font-face/src)
- [CSS Fonts Module Level 4](https://www.w3.org/TR/css-fonts-4/)

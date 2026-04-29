# no-unused-font-face

Disallow `@font-face` blocks whose `font-family` name is never referenced in any `font-family` declaration.

> **Rule catalog ID:** R040

## Targeted pattern scope

- `@font-face` at-rules whose declared `font-family` is never used.

## What this rule reports

This rule reports `@font-face` blocks where the `font-family` value is not referenced by any `font-family` declaration in the same stylesheet. Unreferenced `@font-face` blocks waste bandwidth because the font file will still be loaded by some browsers even when the family is never applied.

The check is **file-scoped**: it only compares `@font-face` declarations and `font-family` properties within the same CSS file. Cross-file references (from HTML, JavaScript, or other stylesheets) are not visible to a static CSS linter.

Declarations that use CSS custom properties (`var(...)`) are **excluded** from the reference check because their runtime values cannot be statically resolved.

## Why this rule exists

Unused `@font-face` blocks accumulate over time as designs change but old declarations are not cleaned up. Even a single unused `@font-face` can add hundreds of kilobytes to a page's font payload. A lint rule catches these regressions before they ship.

## ❌ Incorrect

```css
/* @font-face is declared but no rule ever sets font-family: "Inter" */
@font-face {
  font-family: "Inter";
  src: url("./inter.woff2") format("woff2");
}

.title {
  font-family: "Roboto", system-ui;
}
```

```css
/* Standalone @font-face file with no matching usage */
@font-face {
  font-family: "Old Font";
  src: url("./old-font.woff2") format("woff2");
}
```

## ✅ Correct

```css
@font-face {
  font-family: "Inter";
  src: url("./inter.woff2") format("woff2");
}

.title {
  font-family: "Inter", system-ui;
}
```

```css
/* CSS custom property — the variable may resolve to "Inter" at runtime,
   so the @font-face block is not flagged */
@font-face {
  font-family: "Inter";
  src: url("./inter.woff2") format("woff2");
}

:root {
  --brand-font: "Inter";
}

.title {
  font-family: var(--brand-font), system-ui;
}
```

## Stylelint config example

```js
import fontPlugin from "stylelint-plugin-font";

export default {
  plugins: [...fontPlugin],
  rules: {
    "font/no-unused-font-face": true,
  },
};
```

## When not to use it

Disable this rule when:

- You maintain dedicated **font-face definition files** that are `@import`ed into other stylesheets where the families are used. The rule only sees declarations within a single file.
- Fonts are loaded via a **CSS-in-JS** solution, design token system, or CMS where `font-family` references never appear as plain CSS property declarations.
- You intentionally **preload** fonts for future use (though removing the preload when removing the `@font-face` is still recommended).

## Further reading

- [MDN: `@font-face`](https://developer.mozilla.org/docs/Web/CSS/@font-face)
- [CSS Fonts Module Level 4](https://www.w3.org/TR/css-fonts-4/#font-face-rule)
- [web.dev — Optimize WebFont loading](https://web.dev/fast/#optimize-webfonts)

# no-font-face-in-selectors

Disallow `@font-face` rules nested inside regular CSS selectors.

> **Rule catalog ID:** R034

## Targeted pattern scope

- Every `@font-face` block that appears inside a regular CSS rule or selector.

## What this rule reports

- `@font-face` blocks that are nested inside selector contexts like `body {}`,
  `.container {}`, `#header {}`, or similar.

This rule allows `@font-face` at the root level and inside at-rule blocks like
`@media`, `@supports`, `@layer`, and `@container`.

## Why this rule exists

`@font-face` blocks should only appear at the root level (top of the stylesheet)
or inside at-rule blocks (`@media`, `@supports`, `@layer`, `@container`). When
nested inside a regular selector, critical issues occur:

1. **Unexpected re-registration.** Modern browsers may re-register or override
   the font family each time the selector matches, causing redundant work and
   potential rendering delays.

2. **Scope confusion.** Developers reading the code expect font definitions at
   the root. A nested `@font-face` is easy to miss and causes maintainability
   issues.

3. **CSS spec compliance.** The CSS Fonts specification does not define behavior
   for `@font-face` inside selectors. Browsers may ignore the block, apply it
   inconsistently, or apply it with unexpected cascading side-effects.

4. **Performance impact.** Each time a selector matches, the browser's CSS parser
   may re-evaluate the nested `@font-face`, even though the registration should
   happen only once at load time.

Correct usage is to define all fonts at the stylesheet root or inside at-rules
for conditional font loading.

## ❌ Incorrect

```css
/* @font-face nested inside a selector — unpredictable behavior */
body {
  @font-face {
    font-family: "Inter";
    src: url("./inter.woff2") format("woff2");
  }
}
```

```css
/* Nested inside a class selector */
.container {
  @font-face {
    font-family: "Roboto";
    src: url("./roboto.woff2") format("woff2");
  }
}
```

## ✅ Correct

```css
/* At the root level */
@font-face {
  font-family: "Inter";
  src: url("./inter.woff2") format("woff2");
}

body {
  font-family: "Inter", sans-serif;
}
```

```css
/* Inside an at-rule like @media */
@media (prefers-color-scheme: dark) {
  @font-face {
    font-family: "Inter Dark";
    src: url("./inter-dark.woff2") format("woff2");
  }
}
```

```css
/* Inside @supports for conditional loading */
@supports (font-variation-settings: normal) {
  @font-face {
    font-family: "Inter Variable";
    font-weight: 100 900;
    src: url("./inter-variable.woff2") format("woff2-variations");
  }
}
```

## Stylelint config example

```json
{ "font/no-font-face-in-selectors": true }
```

## Further reading

- [CSS Fonts Level 4 — @font-face rule](https://www.w3.org/TR/css-fonts-4/#font-face-rule)
- [MDN: @font-face](https://developer.mozilla.org/docs/Web/CSS/@font-face)
- [CSS Fonts — placement and scope](https://www.w3.org/TR/css-fonts-4/#font-face-rule)

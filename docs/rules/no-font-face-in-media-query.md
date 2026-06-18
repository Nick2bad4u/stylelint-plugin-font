# no-font-face-in-media-query

Disallow `@font-face` blocks nested inside `@media`, `@supports`, or `@container` at-rules.

> **Rule catalog ID:** R025

## Targeted pattern scope

- `@font-face` blocks whose parent chain contains a `@media`, `@supports`, or `@container` conditional at-rule.

## What this rule reports

- Any `@font-face` declaration block found nested inside a `@media`, `@supports`, or `@container` rule.

## Why this rule exists

The CSS Fonts specification technically allows `@font-face` inside conditional at-rules, but browser behavior for **when the font file is downloaded** varies across implementations:

- **Firefox**: Downloads the font only when the media condition is matched.
- **Chrome/Safari (historical)**: Some versions downloaded the font regardless of the media condition when the `@font-face` was encountered during parse.
- **Result**: In some browser/version combinations a font declared only inside `@media print` is downloaded on every page load, defeating the purpose of the condition.

This inconsistency makes nested `@font-face` unreliable for conditional loading strategies. For print vs screen distinctions, prefer using `unicode-range` and separate family names, or use JavaScript-based font loading via the CSS Font Loading API.

The rule is set to `recommended: false` because there are legitimate historical patterns (especially legacy print stylesheet integration) where nesting is intentional and accepted.

## ❌ Incorrect

```css
/* @font-face inside @media — download behavior is inconsistent across browsers */
@media screen {
 @font-face {
  font-family: "Inter";
  src: url("./inter.woff2") format("woff2");
 }
}
```

```css
@supports (font-variation-settings: normal) {
 @font-face {
  font-family: "InterVar";
  src: url("./inter-variable.woff2") format("woff2");
 }
}
```

## ✅ Correct

```css
/* Top-level @font-face — reliable and spec-aligned */
@font-face {
 font-family: "Inter";
 src: url("./inter.woff2") format("woff2");
}
```

```css
/* Conditional font behavior via unicode-range and separate family names */
@font-face {
 font-family: "InterPrint";
 src: url("./inter-print.woff2") format("woff2");
}
```

## When not to use it

- Legacy print stylesheets that intentionally scope print-only `@font-face` declarations inside `@media print`.
- Codebases that rely on browser-specific behavior for conditional font loading.

Disable the rule with an inline comment in those files:

```css
/* stylelint-disable font/no-font-face-in-media-query */
@media print {
 @font-face {
  font-family: "PrintFont";
  src: url("./print-font.woff2") format("woff2");
 }
}
/* stylelint-enable font/no-font-face-in-media-query */
```

## Further reading

- [CSS Fonts Level 4 — `@font-face`](https://www.w3.org/TR/css-fonts-4/#font-face-rule)
- [CSS Font Loading API](https://developer.mozilla.org/docs/Web/API/CSS_Font_Loading_API)
- [MDN: @font-face](https://developer.mozilla.org/docs/Web/CSS/@font-face)

# require-src-in-font-face

Require a `src` descriptor in every `@font-face` declaration block.

> **Rule catalog ID:** R022

## Targeted pattern scope

- Every `@font-face` block in the stylesheet.

## What this rule reports

- `@font-face` blocks that are missing a `src` descriptor entirely.

## Why this rule exists

The `src` descriptor is the only mechanism by which a browser locates and downloads a custom font file. An `@font-face` block without `src` is **silently inert**: the browser parses it without error but the family name can never resolve to an actual typeface. In practice this is always a typo or incomplete migration.

Unlike most missing-descriptor rules this failure is absolute: there is no fallback behavior, no default value, and no workaround. The block has zero effect until `src` is added.

## ❌ Incorrect

```css
/* src omitted entirely — @font-face block has no effect */
@font-face {
 font-family: "Inter";
 font-weight: 400;
 font-style: normal;
 font-display: swap;
}
```

## ✅ Correct

```css
@font-face {
 font-family: "Inter";
 font-weight: 400;
 font-style: normal;
 font-display: swap;
 src: url("./inter-regular.woff2") format("woff2");
}
```

## When not to use it

If you use a CSS pre-processor or build tool that programmatically injects `src` into `@font-face` blocks after a partial declaration, you may see false positives during static analysis. In that case, disable this rule for the affected source files.

## Further reading

- [CSS Fonts Level 4 — `src` descriptor](https://www.w3.org/TR/css-fonts-4/#src-desc)
- [MDN: @font-face](https://developer.mozilla.org/docs/Web/CSS/@font-face)

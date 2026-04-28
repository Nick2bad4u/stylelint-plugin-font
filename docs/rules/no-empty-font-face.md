# no-empty-font-face

Disallow empty `@font-face` declaration blocks that contain no descriptors.

> **Rule catalog ID:** R023

## Targeted pattern scope

- Every `@font-face` block in the stylesheet.

## What this rule reports

- `@font-face` blocks whose body contains no descriptor declarations (empty braces or blocks containing only whitespace and/or comments).

## Why this rule exists

An `@font-face` block with no declarations is **inert**. The browser parses it without error, but the block registers no family name, no source, and no variant descriptors — it cannot be referenced by any `font-family` property in the document. The block occupies stylesheet bytes and parse time for zero effect.

This pattern almost always indicates one of:

- An incomplete code generation or copy-paste that was never finished.
- A block that had all its descriptors deleted or moved and the shell was not removed.
- A stale placeholder left from a build scaffold.

## ❌ Incorrect

```css
/* Completely empty — no descriptors, zero effect */
@font-face {}
```

```css
/* Only a comment — still no declarations */
@font-face {
  /* TODO: add font source */
}
```

## ✅ Correct

```css
@font-face {
  font-family: "Inter";
  src: url("./inter.woff2") format("woff2");
}
```

## Further reading

- [CSS Fonts Level 4 — `@font-face`](https://www.w3.org/TR/css-fonts-4/#font-face-rule)
- [MDN: @font-face](https://developer.mozilla.org/docs/Web/CSS/@font-face)

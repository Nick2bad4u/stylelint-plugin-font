# no-duplicate-descriptors-in-font-face

Disallow duplicate descriptor declarations within a single `@font-face` block.

> **Rule catalog ID:** R029

## Targeted pattern scope

- All descriptor declarations inside each `@font-face` block.

## What this rule reports

- Any `@font-face` block that contains two or more declarations with the same
  property name (for example two `font-family` or two `src` descriptors).

## Why this rule exists

CSS applies a last-write-wins strategy within a declaration block: when the same
property appears more than once, every declaration except the final one is
silently discarded by the browser parser. For `@font-face` blocks this means:

- **A duplicate `font-family`** registers the block under the _last_ family name
  — the earlier declaration is invisible at runtime.
- **A duplicate `src`** discards the earlier source list entirely, which may
  mean the intended font file is never fetched.
- **A duplicate `font-weight` or `font-style`** silently alters the variant key
  used to match the block, potentially causing surprising fallback behaviour.

Duplicates almost always arise from copy-paste errors, incomplete refactoring,
or conflicting code generators. Because the earlier declaration produces no
observable effect, there is no benign use-case for duplicate descriptors.

## ❌ Incorrect

```css
/* Two font-family descriptors — first one is silently discarded */
@font-face {
  font-family: "Old Name";
  font-family: "New Name";
  src: url("./font.woff2") format("woff2");
}
```

```css
/* Two src descriptors — first source list is never fetched */
@font-face {
  font-family: "Inter";
  src: url("./inter-v1.woff2") format("woff2");
  src: url("./inter-v2.woff2") format("woff2");
}
```

## ✅ Correct

```css
@font-face {
  font-family: "Inter";
  src: url("./inter.woff2") format("woff2"),
       url("./inter.woff") format("woff");
  font-weight: 400;
  font-style: normal;
}
```

## Stylelint config example

```json
{ "font/no-duplicate-descriptors-in-font-face": true }
```

## Further reading

- [CSS Cascading and Inheritance — block-level precedence](https://www.w3.org/TR/css-cascade-5/)
- [CSS Fonts Level 4 — `@font-face`](https://www.w3.org/TR/css-fonts-4/#font-face-rule)
- [MDN: @font-face](https://developer.mozilla.org/docs/Web/CSS/@font-face)

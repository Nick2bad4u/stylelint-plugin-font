# require-font-display

Require `font-display` in every `@font-face` block.

> **Rule catalog ID:** R001

## Targeted pattern scope

- `@font-face` at-rules in CSS and SCSS files.

## What this rule reports

- Any `@font-face` block that omits `font-display`.

## Why this rule exists

Missing `font-display` can cause FOIT and inconsistent text paint behavior.

## ❌ Incorrect

```css
@font-face {
  font-family: "Inter";
  src: url("./inter.woff2") format("woff2");
}
```

## ✅ Correct

```css
@font-face {
  font-family: "Inter";
  font-display: swap;
  src: url("./inter.woff2") format("woff2");
}
```

## Further reading

- [MDN: font-display](https://developer.mozilla.org/docs/Web/CSS/@font-face/font-display)

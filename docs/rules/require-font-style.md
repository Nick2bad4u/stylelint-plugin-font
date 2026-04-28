# require-font-style

Require explicit `font-style` in every `@font-face` block.

> **Rule catalog ID:** R002

## Targeted pattern scope

- `font-style` declarations inside `@font-face`.

## What this rule reports

- `@font-face` blocks that omit `font-style`.

## Why this rule exists

Explicit style declarations make face selection deterministic across normal and italic variants.

## ❌ Incorrect

```css
@font-face {
  font-family: "Inter";
  font-weight: 400;
  src: url("./inter.woff2") format("woff2");
}
```

## ✅ Correct

```css
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  src: url("./inter.woff2") format("woff2");
}
```

## Further reading

- [MDN: @font-face](https://developer.mozilla.org/docs/Web/CSS/@font-face)

# require-font-weight

Require explicit `font-weight` in every `@font-face` block.

> **Rule catalog ID:** R003

## Targeted pattern scope

- `font-weight` declarations inside `@font-face`.

## What this rule reports

- `@font-face` blocks that omit `font-weight`.

## Why this rule exists

Missing weights create ambiguous mapping and make variable/static face upgrades riskier.

## ❌ Incorrect

```css
@font-face {
 font-family: "Inter";
 font-style: normal;
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

- [MDN: font-weight](https://developer.mozilla.org/docs/Web/CSS/font-weight)

# woff2-before-woff

Require `woff2` entries before `woff` entries.

> **Rule catalog ID:** R009

## Targeted pattern scope

- Ordering of comma-separated `src` entries in `@font-face`.

## What this rule reports

- Source lists where a `woff` source appears before a `woff2` source.

## Why this rule exists

Ordering `woff2` first helps capable browsers select the smallest supported file immediately.

## ❌ Incorrect

```css
@font-face {
 src:
  url("./inter.woff") format("woff"),
  url("./inter.woff2") format("woff2");
}
```

## ✅ Correct

```css
@font-face {
 src:
  url("./inter.woff2") format("woff2"),
  url("./inter.woff") format("woff");
}
```

## Further reading

- [MDN: @font-face](https://developer.mozilla.org/docs/Web/CSS/@font-face)

# no-legacy-formats

Disallow legacy font formats (`eot`, `svg`, and `truetype`).

> **Rule catalog ID:** R008

## Targeted pattern scope

- `format(...)` hints and URL extensions inside `@font-face` `src`.

## What this rule reports

- Sources using legacy formats in modern-targeted stylesheets.

## Why this rule exists

Legacy formats add payload and maintenance complexity without useful modern coverage.

## ❌ Incorrect

```css
@font-face {
 src:
  url("./inter.ttf") format("truetype"),
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

- [MDN: @font-face/src](https://developer.mozilla.org/docs/Web/CSS/@font-face/src)

# local-src-before-url

Require `local(...)` entries before `url(...)` entries in `@font-face` `src`.

> **Rule catalog ID:** R006

## Targeted pattern scope

- Comma-separated source lists in `@font-face` `src`.

## What this rule reports

- Lists where the first network URL appears before a local source.

## Why this rule exists

Prioritizing `local(...)` avoids unnecessary requests when fonts are already installed.

## ❌ Incorrect

```css
@font-face {
  src: url("./inter.woff2") format("woff2"), local("Inter");
}
```

## ✅ Correct

```css
@font-face {
  src: local("Inter"), url("./inter.woff2") format("woff2");
}
```

## Further reading

- [MDN: local()](https://developer.mozilla.org/docs/Web/CSS/@font-face/src#localfont_name)

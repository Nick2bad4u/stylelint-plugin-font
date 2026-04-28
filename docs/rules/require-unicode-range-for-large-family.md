# require-unicode-range-for-large-family

Require `unicode-range` for families with four or more `@font-face` blocks in one file.

> **Rule catalog ID:** R004

## Targeted pattern scope

- `@font-face` groups sharing the same `font-family`.

## What this rule reports

- Faces in large family groups that omit `unicode-range`.

## Why this rule exists

Range partitioning prevents unnecessary glyph downloads for large families.

## ❌ Incorrect

```css
@font-face {
  font-family: "Inter";
  font-weight: 400;
  src: url("./inter-400.woff2") format("woff2");
}
```

## ✅ Correct

```css
@font-face {
  font-family: "Inter";
  font-weight: 400;
  unicode-range: U+0000-00FF;
  src: url("./inter-400.woff2") format("woff2");
}
```

## Further reading

- [MDN: unicode-range](https://developer.mozilla.org/docs/Web/CSS/@font-face/unicode-range)

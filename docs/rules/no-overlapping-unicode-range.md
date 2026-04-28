# no-overlapping-unicode-range

Disallow overlapping `unicode-range` subsets across `@font-face` blocks that share the same `font-family`, `font-style`, and `font-weight` tuple.

> **Rule catalog ID:** R019

## Targeted pattern scope

- Multiple `@font-face` blocks in the same stylesheet.
- Same family/style/weight variant split into subsets with `unicode-range`.

## What this rule reports

- Overlap between two subset ranges that should be mutually exclusive.

## Why this rule exists

Subset ranges are usually intended to partition glyph coverage (for example Latin vs Cyrillic). If ranges overlap inside the same face variant, browsers can fetch redundant resources for the same characters.

## ❌ Incorrect

```css
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  src: url("./inter-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF;
}

@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  src: url("./inter-latin-ext.woff2") format("woff2");
  unicode-range: U+00A0-024F;
}
```

## ✅ Correct

```css
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  src: url("./inter-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF;
}

@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  src: url("./inter-latin-ext.woff2") format("woff2");
  unicode-range: U+0100-024F;
}
```

## When not to use it

Disable this rule when overlapping subsets are an intentional compatibility strategy and duplicate range coverage is accepted by design.

## Further reading

- [MDN: unicode-range descriptor](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range)
- [CSS-Tricks: unicode-range](https://css-tricks.com/almanac/properties/u/unicode-range/)

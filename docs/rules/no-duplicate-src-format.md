# no-duplicate-src-format

Disallow duplicate explicit `format()` hints within a single `@font-face src` declaration.

> **Rule catalog ID:** R024

## Targeted pattern scope

- Explicit `format(...)` hints within `@font-face src` declarations.

## What this rule reports

- `@font-face src` lists where the same format hint string appears more than once (for example two separate `format("woff2")` entries).

## Why this rule exists

Browsers select a font source by scanning the `src` list from left to right and downloading the first entry whose format they support. Once a browser finds a matching format and begins downloading, it stops evaluating the rest of the list. Any subsequent entry with the same format hint is **unreachable** — the browser will never fetch it.

Duplicate format hints are therefore always a bug: either a copy-paste error that left a stale entry, or an accidental duplication during a refactor. The dead entry increases stylesheet bytes and misleads readers about the intended source list structure.

## ❌ Incorrect

```css
/* Two woff2 entries — browser stops at the first one and never fetches the second */
@font-face {
  font-family: "Inter";
  src:
    url("./inter-subset-latin.woff2") format("woff2"),
    url("./inter-subset-ext.woff2") format("woff2");
}
```

```css
/* Accidentally duplicated during a woff2-only migration */
@font-face {
  font-family: "Roboto";
  src:
    url("./roboto.woff2") format("woff2"),
    url("./roboto-fallback.woff2") format("woff2"),
    url("./roboto.woff") format("woff");
}
```

## ✅ Correct

```css
/* Each format appears at most once */
@font-face {
  font-family: "Inter";
  src:
    url("./inter.woff2") format("woff2"),
    url("./inter.woff") format("woff");
}
```

## When not to use it

If your build tool intentionally emits multiple source entries with the same format (for example for A/B CDN redundancy using a custom browser-extension mechanism), disable this rule for the generated file.

## Further reading

- [CSS Fonts Level 4 — `src` descriptor](https://www.w3.org/TR/css-fonts-4/#src-desc)
- [MDN: @font-face src](https://developer.mozilla.org/docs/Web/CSS/@font-face#src)

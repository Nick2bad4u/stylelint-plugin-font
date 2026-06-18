# consistent-font-display

Require one `font-display` strategy per stylesheet.

> **Rule catalog ID:** R012

## Targeted pattern scope

- All `font-display` declarations inside `@font-face` blocks.

## What this rule reports

- Files that mix display values such as `swap` and `fallback`.

## Why this rule exists

Mixed strategies make perceived loading behavior inconsistent across fonts in the same page.

## ❌ Incorrect

```css
@font-face {
 font-family: "Inter";
 font-display: swap;
}

@font-face {
 font-family: "Inter";
 font-display: fallback;
}
```

## ✅ Correct

```css
@font-face {
 font-family: "Inter";
 font-display: swap;
}

@font-face {
 font-family: "Inter";
 font-display: swap;
}
```

## Further reading

- [MDN: font-display](https://developer.mozilla.org/docs/Web/CSS/@font-face/font-display)

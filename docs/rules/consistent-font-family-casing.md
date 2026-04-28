# consistent-font-family-casing

Require consistent `font-family` casing across `@font-face` declarations.

> **Rule catalog ID:** R013

## Targeted pattern scope

- `font-family` values inside `@font-face` declarations.

## What this rule reports

- Casing drift for the same logical family (`Inter` vs `inter`).

## Why this rule exists

Casing drift hides duplicates and makes font-face inventory harder to audit.

## ❌ Incorrect

```css
@font-face {
  font-family: "Inter";
}

@font-face {
  font-family: "inter";
}
```

## ✅ Correct

```css
@font-face {
  font-family: "Inter";
}

@font-face {
  font-family: "Inter";
}
```

## Further reading

- [MDN: font-family](https://developer.mozilla.org/docs/Web/CSS/font-family)

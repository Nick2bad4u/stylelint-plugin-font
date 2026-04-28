# no-invalid-font-style

Disallow invalid `font-style` descriptor values in `@font-face` blocks.

> **Rule catalog ID:** R033

## Targeted pattern scope

- The `font-style` descriptor inside every `@font-face` block.

## What this rule reports

- `@font-face` blocks where the `font-style` descriptor value is syntactically
  invalid or does not match a recognized keyword or angle syntax.

## Why this rule exists

The CSS Fonts specification defines a precise set of valid `font-style` values in
`@font-face` blocks:

- **Keywords:** `normal` or `italic`
- **Oblique:** The keyword `oblique` alone, or `oblique` followed by an angle
  (e.g., `oblique 10deg` for variable fonts that support an italic/oblique axis).

Invalid values like `"bold"` (not a valid style keyword), `"italic 10deg"`
(angle not allowed with italic), or `"slant 5"` (non-standard keywords) cause
the browser to either ignore the block or apply unpredictable fallback behavior.

These errors usually arise from confusion between `font-style` property values
(used in selectors, which do accept keywords like `oblique` with angles) and
`font-style` descriptor values (used in `@font-face`, with stricter syntax).

## ❌ Incorrect

```css
/* "bold" is not a valid style keyword — it is a weight keyword */
@font-face {
  font-family: "Inter";
  font-style: bold;
  src: url("./inter.woff2") format("woff2");
}
```

```css
/* Angle is not allowed with "italic" */
@font-face {
  font-family: "Inter";
  font-style: italic 10deg;
  src: url("./inter.woff2") format("woff2");
}
```

```css
/* Unrecognized keyword "slant" */
@font-face {
  font-family: "Inter";
  font-style: slant 5;
  src: url("./inter.woff2") format("woff2");
}
```

## ✅ Correct

```css
/* Simple keyword: "normal" or "italic" */
@font-face {
  font-family: "Inter";
  font-style: normal;
  src: url("./inter-normal.woff2") format("woff2");
}
```

```css
/* "italic" for italic font */
@font-face {
  font-family: "Inter";
  font-style: italic;
  src: url("./inter-italic.woff2") format("woff2");
}
```

```css
/* Oblique with an angle (variable fonts) */
@font-face {
  font-family: "Inter Variable";
  font-style: oblique 0deg 15deg;
  src: url("./inter-variable.woff2") format("woff2-variations");
}
```

## Stylelint config example

```json
{ "font/no-invalid-font-style": true }
```

## Further reading

- [CSS Fonts Level 4 — font-style descriptor](https://www.w3.org/TR/css-fonts-4/#font-style-desc)
- [MDN: @font-face — font-style descriptor](https://developer.mozilla.org/docs/Web/CSS/@font-face/font-style)
- [Variable fonts — italic/oblique axis](https://learn.microsoft.com/en-us/typography/opentype/spec/variations#axis-record)

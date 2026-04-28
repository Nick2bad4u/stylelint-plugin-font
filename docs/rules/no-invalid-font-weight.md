# no-invalid-font-weight

Disallow invalid `font-weight` descriptor values in `@font-face` blocks.

> **Rule catalog ID:** R032

## Targeted pattern scope

- The `font-weight` descriptor inside every `@font-face` block.

## What this rule reports

- `@font-face` blocks where the `font-weight` descriptor value is syntactically
  invalid or outside the valid range.

## Why this rule exists

The CSS Fonts specification defines strict rules for valid `font-weight` values
in `@font-face` blocks:

- **Integer range:** 1 to 1000 (inclusive). Common values are 400 (normal) and
  700 (bold), but any integer in this range is valid.
- **Keyword:** The single keyword `normal`, which is equivalent to 400.
- **Range (for variable fonts):** Two space-separated integers "MIN MAX" where
  both are in the 1–1000 range and MIN ≤ MAX. This declares a variable font
  that interpolates between those weights.

Invalid values like `"900 1100"` (exceeds 1000), `"bold"` (not a valid descriptor
keyword), or `"400px"` (has units) cause browsers to reject the entire `@font-face`
block or apply unpredictable fallback behaviour. These errors are usually the
result of copy-paste from `font-weight` property values (used in selectors) or
misunderstanding the descriptor syntax.

## ❌ Incorrect

```css
/* Out of range: 1100 exceeds the max of 1000 */
@font-face {
  font-family: "Inter";
  font-weight: 900 1100;
  src: url("./inter-variable.woff2") format("woff2-variations");
}
```

```css
/* Invalid keyword: "bold" is a property value, not a descriptor value */
@font-face {
  font-family: "Inter";
  font-weight: bold;
  src: url("./inter.woff2") format("woff2");
}
```

```css
/* Has units: descriptors take unitless numbers */
@font-face {
  font-family: "Inter";
  font-weight: 400px;
  src: url("./inter.woff2") format("woff2");
}
```

## ✅ Correct

```css
/* Single weight value */
@font-face {
  font-family: "Inter";
  font-weight: 400;
  src: url("./inter.woff2") format("woff2");
}
```

```css
/* Keyword "normal" (equivalent to 400) */
@font-face {
  font-family: "Inter";
  font-weight: normal;
  src: url("./inter.woff2") format("woff2");
}
```

```css
/* Valid range for variable fonts */
@font-face {
  font-family: "Inter Variable";
  font-weight: 100 900;
  src: url("./inter-variable.woff2") format("woff2-variations");
}
```

## Stylelint config example

```json
{ "font/no-invalid-font-weight": true }
```

## Further reading

- [CSS Fonts Level 4 — font-weight descriptor](https://www.w3.org/TR/css-fonts-4/#font-weight-desc)
- [MDN: @font-face — font-weight descriptor](https://developer.mozilla.org/docs/Web/CSS/@font-face/font-weight)
- [Variable fonts — weight axis](https://learn.microsoft.com/en-us/typography/opentype/spec/variations#example-1-weight)

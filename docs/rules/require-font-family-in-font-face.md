# require-font-family-in-font-face

Require a `font-family` descriptor in every `@font-face` declaration block.

> **Rule catalog ID:** R026

## Targeted pattern scope

- Every `@font-face` block in the stylesheet.

## What this rule reports

- `@font-face` blocks that contain no `font-family` descriptor.

## Why this rule exists

The `font-family` descriptor is the key that ties an `@font-face` block to a
`font-family` property value in selectors. Without it, the entire block has no
effect — the browser cannot register the font under any family name, so no
selector can reference it.

A block missing `font-family` is almost always the result of:

- Incomplete code generation or copy-paste.
- A block where the `font-family` line was accidentally deleted.
- A scaffold placeholder that was never finished.

Because the CSS specification does not make the descriptor optional, this is
always a bug rather than a deliberate choice.

## ❌ Incorrect

```css
/* Missing font-family — block cannot be referenced */
@font-face {
 src: url("./inter.woff2") format("woff2");
}
```

## ✅ Correct

```css
@font-face {
 font-family: "Inter";
 src: url("./inter.woff2") format("woff2");
}
```

## Stylelint config example

```json
{ "font/require-font-family-in-font-face": true }
```

## Further reading

- [CSS Fonts Level 4 — `@font-face`](https://www.w3.org/TR/css-fonts-4/#font-face-rule)
- [MDN: @font-face — font-family descriptor](https://developer.mozilla.org/docs/Web/CSS/@font-face/font-family)

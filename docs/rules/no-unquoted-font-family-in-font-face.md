# no-unquoted-font-family-in-font-face

Require the `font-family` descriptor value inside `@font-face` to be quoted.

> **Rule catalog ID:** R027
> 🔧 **Fixable** — this rule can auto-apply the recommended fix.

## Targeted pattern scope

- The `font-family` descriptor inside every `@font-face` block.

## What this rule reports

- `@font-face` blocks where the `font-family` descriptor value is not wrapped in
  single quotes (`'`) or double quotes (`"`).

## Why this rule exists

Although CSS technically allows unquoted identifiers as a `font-family`
descriptor value (for example `font-family: Inter`), this practice is fragile
for three reasons:

1. **CSS keyword shadowing.** An unquoted identifier that collides with a CSS
   generic family keyword (`serif`, `sans-serif`, `monospace`, `cursive`,
   `fantasy`, `system-ui`, `math`, `emoji`, `fangsong`) or a system font alias
   (`caption`, `icon`, `menu`, `message-box`, `small-caption`, `status-bar`) is
   invalid by definition — browsers will ignore or misinterpret the block.

2. **Future-generic risk.** CSS Fonts Level 4 and beyond continue to add new
   reserved generic family names. An unquoted name safe today may become invalid
   in a future browser version.

3. **Selector inconsistency.** Quoted and unquoted family names must match
   exactly in `font-family` selectors — mixing styles leads to subtle failures
   that are hard to debug.

Quoting the value unconditionally is the safest, most portable authoring
practice.

## ❌ Incorrect

```css
/* Unquoted — fragile and potentially ambiguous */
@font-face {
  font-family: Inter;
  src: url("./inter.woff2") format("woff2");
}
```

## ✅ Correct

```css
/* Quoted — unambiguous, safe against keyword conflicts */
@font-face {
  font-family: "Inter";
  src: url("./inter.woff2") format("woff2");
}
```

## Behavior and migration notes

When `--fix` is supplied, this rule wraps the unquoted value in double quotes:

```css
/* Before */
@font-face { font-family: MyFont; }

/* After */
@font-face { font-family: "MyFont"; }
```

## Stylelint config example

```json
{ "font/no-unquoted-font-family-in-font-face": true }
```

## Further reading

- [CSS Fonts Level 4 — `font-family` descriptor](https://www.w3.org/TR/css-fonts-4/#family-name-value)
- [MDN: @font-face — font-family descriptor](https://developer.mozilla.org/docs/Web/CSS/@font-face/font-family)

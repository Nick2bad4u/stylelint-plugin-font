# no-src-format-mismatch

Disallow `@font-face src` entries where the URL file extension contradicts the explicit `format()` hint.

> **Rule catalog ID:** R031

## Targeted pattern scope

- Every `url(...)` entry with an explicit `format(...)` hint inside each
  `@font-face src` descriptor.

## What this rule reports

- `@font-face src` entries where the file extension of the URL and the
  `format()` keyword do not agree (for example `url("font.woff2")
format("woff")` — the extension says WOFF2 but the hint says WOFF).

Only entries that include **both** a recognisable file extension **and** an
explicit `format()` hint are checked. Entries without a format hint, without a
file extension, or with an unrecognised extension are skipped.

## Why this rule exists

Browsers use the `format()` hint to decide whether they support the font format
**before** downloading the file. When the format hint contradicts the actual
file extension, two failure modes occur:

1. **Skipped download (false negative).** A browser that supports WOFF2 but not
   WOFF will skip `url("font.woff2") format("woff")` because the hint declares
   a format the browser considers unsupported. The file is never fetched, even
   though it would have worked.

2. **Wasted download (false positive).** A browser downloads a file and then
   discovers it cannot decode it because the format hint was wrong. The network
   request is wasted.

Both cases are silent — the browser produces no visible error in the stylesheet,
only a network-level failure that is easy to miss in testing.

Mismatches almost always result from copy-paste or search-and-replace edits that
updated the file path but not the adjacent `format()` keyword.

## ❌ Incorrect

```css
/* Extension is .woff2 but format hint says woff — browser may skip the file */
@font-face {
 font-family: "Inter";
 src: url("./inter.woff2") format("woff");
}
```

```css
/* Extension is .woff but format hint says woff2 */
@font-face {
 font-family: "Inter";
 src: url("./inter.woff") format("woff2");
}
```

```css
/* Extension is .ttf but format hint says opentype (wrong alias) */
@font-face {
 font-family: "Inter";
 src: url("./inter.ttf") format("opentype");
}
```

## ✅ Correct

```css
/* Extension and format hint agree */
@font-face {
 font-family: "Inter";
 src:
  url("./inter.woff2") format("woff2"),
  url("./inter.woff") format("woff");
}
```

```css
/* TTF uses the correct format keyword */
@font-face {
 font-family: "Inter";
 src: url("./inter.ttf") format("truetype");
}
```

## Additional examples

Extension-to-format keyword mapping used by this rule:

| Extension | Expected `format()` keyword |
| --------- | --------------------------- |
| `.woff2`  | `woff2`                     |
| `.woff`   | `woff`                      |
| `.ttf`    | `truetype`                  |
| `.otf`    | `opentype`                  |
| `.eot`    | `embedded-opentype`         |

`.svg` is intentionally excluded because both `svg` and `svg-fonts` are used as
format keywords in the wild, making a strict single-value match unreliable.

## Stylelint config example

```json
{ "font/no-src-format-mismatch": true }
```

## Further reading

- [CSS Fonts Level 4 — src descriptor and format hints](https://www.w3.org/TR/css-fonts-4/#font-format-values)
- [MDN: @font-face — src descriptor](https://developer.mozilla.org/docs/Web/CSS/@font-face/src)

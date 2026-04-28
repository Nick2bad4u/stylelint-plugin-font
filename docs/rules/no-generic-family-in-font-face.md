# no-generic-family-in-font-face

Disallow CSS generic family keywords as `font-family` descriptor values inside `@font-face` blocks.

> **Rule catalog ID:** R020

## Targeted pattern scope

- `font-family` descriptor inside `@font-face` blocks.

## What this rule reports

- `@font-face` blocks where `font-family` is set to a CSS generic family keyword such as `serif`, `sans-serif`, `monospace`, `cursive`, `fantasy`, `system-ui`, `ui-serif`, `ui-sans-serif`, `ui-monospace`, `ui-rounded`, `emoji`, `math`, or `fangsong`.

## Why this rule exists

The CSS Fonts specification requires the `font-family` descriptor inside `@font-face` to be a custom author-defined family name. Assigning a CSS generic keyword (such as `sans-serif`) silently **shadows** the built-in generic family: any element that tries to fall back to `sans-serif` will instead receive this custom `@font-face` definition, which is almost always unintentional. Additionally, the block effectively becomes unresolvable as a named web font because the name collides with the CSS keyword.

This is a common copy-paste mistake and nearly always indicates a forgotten custom name. The browser behaviour is implementation-defined and unreliable across engines.

## ❌ Incorrect

```css
/* Generic keyword used as custom font name — shadows the built-in generic */
@font-face {
  font-family: sans-serif;
  src: url("./inter.woff2") format("woff2");
}
```

```css
@font-face {
  font-family: serif;
  src: url("./my-font.woff2") format("woff2");
}
```

## ✅ Correct

```css
@font-face {
  font-family: "Inter";
  src: url("./inter.woff2") format("woff2");
}
```

```css
@font-face {
  font-family: "My Custom Font";
  src: url("./my-font.woff2") format("woff2");
}
```

## Additional examples

The following CSS-defined generic family keywords trigger this rule:

| Keyword         | Category    |
| --------------- | ----------- |
| `serif`         | Traditional |
| `sans-serif`    | Traditional |
| `monospace`     | Traditional |
| `cursive`       | Traditional |
| `fantasy`       | Traditional |
| `system-ui`     | System UI   |
| `ui-serif`      | System UI   |
| `ui-sans-serif` | System UI   |
| `ui-monospace`  | System UI   |
| `ui-rounded`    | System UI   |
| `emoji`         | Specialized |
| `math`          | Specialized |
| `fangsong`      | Specialized |

## Further reading

- [CSS Fonts Level 4 — `font-family` descriptor](https://www.w3.org/TR/css-fonts-4/#font-family-desc)
- [MDN: @font-face](https://developer.mozilla.org/docs/Web/CSS/@font-face)

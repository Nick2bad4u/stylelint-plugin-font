# require-format-hint

Require `format(...)` hints for `url(...)` entries in `@font-face` `src`.

> **Rule catalog ID:** R005

## Targeted pattern scope

- `src` declarations inside `@font-face`.

## What this rule reports

- `url(...)` entries that do not include `format(...)`.

## Why this rule exists

Format hints let browsers skip unsupported probes and improve source selection efficiency.

## ❌ Incorrect

```css
@font-face {
  src: url("./inter.woff2");
}
```

## ✅ Correct

```css
@font-face {
  src: url("./inter.woff2") format("woff2");
}
```

## Further reading

- [MDN: src descriptor](https://developer.mozilla.org/docs/Web/CSS/@font-face/src)

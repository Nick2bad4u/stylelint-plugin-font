# no-missing-fallback-before-web-font

Disallow web-font-only `font-family` stacks.

> **Rule catalog ID:** R016

## Targeted pattern scope

- `font-family` declarations outside `@font-face` where a web font appears first.

## What this rule reports

- Stacks that start with a custom font and provide no fallback family.

## Why this rule exists

Web fonts can fail to load; fallback families preserve readability and layout stability.

## ❌ Incorrect

```css
.title {
  font-family: "Inter";
}
```

## ✅ Correct

```css
.title {
  font-family: "Inter", system-ui;
}
```

## Further reading

- [MDN: font-family best practices](https://developer.mozilla.org/docs/Web/CSS/font-family)

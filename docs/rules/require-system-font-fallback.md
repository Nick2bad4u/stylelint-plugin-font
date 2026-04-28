# require-system-font-fallback

Require `font-family` stacks to end with a system fallback.

> **Rule catalog ID:** R015

## Targeted pattern scope

- `font-family` declarations outside `@font-face`.

## What this rule reports

- Stacks that do not end with a system fallback name such as `system-ui`.

## Why this rule exists

Explicit system fallback improves resiliency when custom fonts fail.

## ❌ Incorrect

```css
.title {
  font-family: "Inter", Arial;
}
```

## ✅ Correct

```css
.title {
  font-family: "Inter", system-ui;
}
```

## Further reading

- [MDN: system-ui](https://developer.mozilla.org/docs/Web/CSS/font-family#system_ui)

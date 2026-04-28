# no-whitespace-in-unquoted-family

Disallow unquoted multi-word `font-family` names.

> **Rule catalog ID:** R014

## Targeted pattern scope

- `font-family` declaration values in regular rules and `@font-face`.

## What this rule reports

- Unquoted family tokens containing whitespace.

## Why this rule exists

Quoted multi-word names are clearer and avoid parser/tooling ambiguity.

## ❌ Incorrect

```css
.title {
  font-family: Open Sans, system-ui;
}
```

## ✅ Correct

```css
.title {
  font-family: "Open Sans", system-ui;
}
```

## Further reading

- [MDN: font-family syntax](https://developer.mozilla.org/docs/Web/CSS/font-family#values)

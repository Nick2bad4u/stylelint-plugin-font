# prefer-variable-fonts

Encourage variable-font usage when a family is split into multiple static weights.

> **Rule catalog ID:** R017

## Targeted pattern scope

- Groups of `@font-face` declarations sharing a family name.

## What this rule reports

- Families with three or more static-weight faces and no obvious variable-weight source.

## Why this rule exists

Variable fonts often reduce request count and simplify long-term font maintenance.

## ❌ Incorrect

```css
@font-face {
 font-family: "Inter";
 font-weight: 300;
 src: url("./inter-300.woff2") format("woff2");
}

@font-face {
 font-family: "Inter";
 font-weight: 400;
 src: url("./inter-400.woff2") format("woff2");
}

@font-face {
 font-family: "Inter";
 font-weight: 700;
 src: url("./inter-700.woff2") format("woff2");
}
```

## ✅ Correct

```css
@font-face {
 font-family: "Inter";
 font-weight: 100 900;
 src: url("./inter-variable.woff2") format("woff2");
}
```

## Further reading

- [MDN: variable fonts](https://developer.mozilla.org/docs/Web/CSS/CSS_fonts/Variable_fonts_guide)

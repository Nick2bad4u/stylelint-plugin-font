# no-duplicate-font-face

Disallow duplicate `@font-face` tuples for the same family/style/weight.

> **Rule catalog ID:** R011

## Targeted pattern scope

- `@font-face` blocks grouped by family + style + weight.

## What this rule reports

- Duplicate tuples where two blocks describe the same face variant.

## Why this rule exists

Duplicate tuples create ambiguous source resolution and fragile maintenance.

## ❌ Incorrect

```css
@font-face {
 font-family: "Inter";
 font-style: normal;
 font-weight: 400;
 src: url("./inter-a.woff2") format("woff2");
}

@font-face {
 font-family: "Inter";
 font-style: normal;
 font-weight: 400;
 src: url("./inter-b.woff2") format("woff2");
}
```

## ✅ Correct

```css
@font-face {
 font-family: "Inter";
 font-style: normal;
 font-weight: 400;
 src: url("./inter-regular.woff2") format("woff2");
}
```

## Further reading

- [Stylelint developer guide](https://stylelint.io/developer-guide/plugins)

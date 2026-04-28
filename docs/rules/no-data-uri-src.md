# no-data-uri-src

Disallow data-URI font sources in `@font-face`.

> **Rule catalog ID:** R010

## Targeted pattern scope

- `url("data:...")` entries in `@font-face` `src`.

## What this rule reports

- Any data URI source used for font files.

## Why this rule exists

Inlining fonts grows stylesheet size and delays parsing.

## ❌ Incorrect

```css
@font-face {
  src: url("data:font/woff2;base64,AAAA") format("woff2");
}
```

## ✅ Correct

```css
@font-face {
  src: url("./inter.woff2") format("woff2");
}
```

## Further reading

- [Web.dev: optimize webfont loading](https://web.dev/learn/performance/optimize-web-fonts)

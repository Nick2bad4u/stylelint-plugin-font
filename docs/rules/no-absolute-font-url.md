# no-absolute-font-url

Disallow absolute root-relative font URLs in `@font-face`.

> **Rule catalog ID:** R018

## Targeted pattern scope

- `url("/...")` font paths inside `@font-face` `src`.

## What this rule reports

- Root-relative font URLs that can break under sub-path deployments.

## Why this rule exists

Relative URLs are safer across GitHub Pages paths, reverse proxies, and nested app routes.

## ❌ Incorrect

```css
@font-face {
 src: url("/fonts/inter.woff2") format("woff2");
}
```

## ✅ Correct

```css
@font-face {
 src: url("./fonts/inter.woff2") format("woff2");
}
```

## Further reading

- [MDN: url()](https://developer.mozilla.org/docs/Web/CSS/url_function)

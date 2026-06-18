# no-protocol-relative-font-url

Disallow protocol-relative URLs (`//`) in `@font-face src` declarations.

> **Rule catalog ID:** R021

## Targeted pattern scope

- `url(...)` entries inside `@font-face` `src` declarations.

## What this rule reports

- `@font-face src` entries that use a protocol-relative URL starting with `//` (for example `url("//cdn.example.com/inter.woff2")`).

## Why this rule exists

Protocol-relative URLs (those starting with `//`) inherit the protocol of the current page. On an HTTPS page the request uses HTTPS, but on a plain HTTP page the font loads over insecure HTTP. This creates:

- **Security exposure:** mixed-content issues can block the font on HTTPS pages in some browsers, and unencrypted font delivery on HTTP pages allows man-in-the-middle attacks that substitute font files.
- **Fragility:** the URL silently switches protocols as the hosting environment changes.

The fix is always unambiguous: use an explicit `https://` prefix or a relative path. This makes the rule safe to set as `"error"`.

## ❌ Incorrect

```css
@font-face {
 font-family: "Inter";
 src: url("//cdn.example.com/fonts/inter.woff2") format("woff2");
}
```

## ✅ Correct

```css
/* Explicit HTTPS */
@font-face {
 font-family: "Inter";
 src: url("https://cdn.example.com/fonts/inter.woff2") format("woff2");
}
```

```css
/* Relative path */
@font-face {
 font-family: "Inter";
 src: url("./fonts/inter.woff2") format("woff2");
}
```

## Further reading

- [MDN: Mixed content](https://developer.mozilla.org/docs/Web/Security/Mixed_content)
- [MDN: @font-face](https://developer.mozilla.org/docs/Web/CSS/@font-face)
- [Protocol-relative URLs — Paul Irish](https://www.paulirish.com/2010/the-protocol-relative-url/)

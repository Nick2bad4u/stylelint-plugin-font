# no-http-font-url

Disallow plain `http://` URLs in `@font-face src` declarations.

> **Rule catalog ID:** R028

## Targeted pattern scope

- The `src` descriptor inside every `@font-face` block.

## What this rule reports

- `@font-face src` entries whose URL starts with `http://` (case-insensitive).

## Why this rule exists

Loading fonts over plain HTTP from an HTTPS page is a **mixed-content** request.
Modern browsers block mixed-content resource loads by default, which means the
font will silently fail to download and the browser will fall back to the next
`font-family` stack entry. This causes:

- **Silent visual regressions** — text renders in a fallback font with no error
  in the stylesheet, only a network-level console warning.
- **Security exposure** — unencrypted HTTP font transfers can be intercepted and
  replaced by a man-in-the-middle attacker, enabling font-based attacks or
  serving altered glyphs.
- **SEO/Core Web Vitals impact** — mixed-content warnings appear in Lighthouse
  audits and may affect site ranking signals.

Use `https://` for third-party font hosts, or prefer relative paths for
self-hosted assets.

## ❌ Incorrect

```css
/* Plain HTTP — blocked as mixed content on HTTPS pages */
@font-face {
  font-family: "Inter";
  src: url("http://fonts.example.com/inter.woff2") format("woff2");
}
```

## ✅ Correct

```css
/* HTTPS — secure and safe */
@font-face {
  font-family: "Inter";
  src: url("https://fonts.example.com/inter.woff2") format("woff2");
}
```

```css
/* Relative path — even better for self-hosted fonts */
@font-face {
  font-family: "Inter";
  src: url("./fonts/inter.woff2") format("woff2");
}
```

## Stylelint config example

```json
{ "font/no-http-font-url": true }
```

## When not to use it

Disable this rule when your project is intentionally served over HTTP only
(e.g., a local development environment without HTTPS). In that case you may
want to allow `http://` font URLs.

## Further reading

- [MDN: Mixed content](https://developer.mozilla.org/docs/Web/Security/Mixed_content)
- [CSS Fonts Level 4 — `@font-face src`](https://www.w3.org/TR/css-fonts-4/#src-desc)
- [Google Fonts — serving fonts over HTTPS](https://fonts.google.com/)

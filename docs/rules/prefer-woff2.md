# prefer-woff2

Require at least one `woff2` source in each `@font-face` `src` list.

> **Rule catalog ID:** R007

## Targeted pattern scope

- Font source lists in `@font-face`.

## What this rule reports

- `@font-face` blocks that have no `woff2` source.

## Why this rule exists

`woff2` provides the best modern compression and should be part of default source stacks.

## ❌ Incorrect

```css
@font-face {
  src: url("./inter.woff") format("woff");
}
```

## ✅ Correct

```css
@font-face {
  src: url("./inter.woff2") format("woff2"), url("./inter.woff") format("woff");
}
```

## When not to use it

Disable this rule if you are intentionally serving only legacy WOFF or TTF/EOT fonts to a constrained legacy-only environment where WOFF2 decoders are unavailable.

## Ready-made WOFF2 resources

If you do not yet have WOFF2 assets for your fonts, the following self-hosted repositories provide ready-to-use WOFF2 font files:

- **[nerd-fonts-woff2](https://github.com/Nick2bad4u/nerd-fonts-woff2)** — Automatically converted WOFF2 versions of the complete [Nerd Fonts](https://www.nerdfonts.com/) collection. Ideal for developer tooling, terminals, and icon-rich UIs.
- **[popular-web-fonts-woff2](https://github.com/Nick2bad4u/popular-web-fonts-woff2)** _(coming soon)_ — The top 100 most-used web fonts (Roboto, Open Sans, Lato, Montserrat, Poppins, Inter, and more) converted to WOFF2 and ready to self-host, eliminating the need for third-party font CDNs.

## Further reading

- [Can I use: woff2](https://caniuse.com/woff2)
- [MDN: WOFF2](https://developer.mozilla.org/en-US/docs/Web/Guide/WOFF)
- [web.dev: Optimize WebFont loading and rendering](https://web.dev/articles/optimize-webfont-loading)

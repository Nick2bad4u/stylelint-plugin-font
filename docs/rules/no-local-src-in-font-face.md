# no-local-src-in-font-face

Disallow `local()` references in `@font-face src` declarations.

> **Rule catalog ID:** R030

## Targeted pattern scope

- The `src` descriptor inside every `@font-face` block.

## What this rule reports

- `@font-face src` entries that use `local()` to reference a font installed on
  the user's operating system.

## Why this rule exists

`local()` instructs the browser to use a font already installed on the user's
machine instead of downloading the web font file. While this can reduce network
requests, it introduces a category of unpredictability that is unacceptable for
pixel-perfect, reproducible rendering scenarios:

1. **Version skew.** The locally installed font may be an older or newer version
   than the web font. Different versions often have different glyph metrics,
   kerning tables, or hinting data, producing subtle — or dramatic — layout
   differences across user machines.

2. **OS-level substitution.** Some operating systems (particularly macOS and
   iOS) ship their own version of widely-used typefaces (for example _Helvetica
   Neue_, _Arial_, _Georgia_). `local("Helvetica Neue")` on macOS will resolve
   to Apple's version, which is metrically distinct from the version a designer
   uses on Windows or Linux.

3. **Reproducibility and QA.** Font rendering differences caused by `local()`
   cannot be reproduced in isolation — they vary per user device — making visual
   regression testing unreliable.

4. **Security (font fingerprinting).** The presence or absence of specific
   locally-installed fonts can be used by third-party scripts to fingerprint
   browsers. Removing `local()` from `@font-face` blocks reduces that attack
   surface.

This rule is intentionally `recommended: false` because `local()` is a
legitimate performance optimisation when version skew is not a concern (for
example generic system-font stacks or internal tools). Enable it only when
pixel-perfect, reproducible rendering is required.

## ❌ Incorrect

```css
/* local() lookup is unpredictable across OS/version */
@font-face {
 font-family: "Inter";
 src:
  local("Inter"),
  url("./inter.woff2") format("woff2");
}
```

## ✅ Correct

```css
/* URL-only source list — predictable across all user environments */
@font-face {
 font-family: "Inter";
 src:
  url("./inter.woff2") format("woff2"),
  url("./inter.woff") format("woff");
}
```

## Stylelint config example

```json
{ "font/no-local-src-in-font-face": true }
```

## When not to use it

- System-font stacks where you explicitly want to leverage OS-level fonts.
- Internal tooling where all users share the same controlled OS image.
- Projects that intentionally prioritise local cache hits over pixel-perfect
  consistency.

## Further reading

- [CSS Fonts Level 4 — `local()` in src](https://www.w3.org/TR/css-fonts-4/#local-def)
- [MDN: @font-face — src descriptor](https://developer.mozilla.org/docs/Web/CSS/@font-face/src)
- [Font fingerprinting via local() — EFF Panopticlick research](https://coveryourtracks.eff.org/)

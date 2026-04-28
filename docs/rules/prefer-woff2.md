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

## Further reading

- [Can I use: woff2](https://caniuse.com/woff2)

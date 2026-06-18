---
title: Getting Started
description: Install and use stylelint-plugin-font in an ESM Stylelint config.
---

# Getting Started

## Installation

```sh
npm install --save-dev stylelint stylelint-plugin-font
```

## Quick start with a shareable config

```js
import { fontPluginConfigs } from "stylelint-plugin-font";

export default fontPluginConfigs["font-recommended"];
```

## Quick start with `extends`

```js
export default {
 extends: [
  "stylelint-config-standard",
  "stylelint-config-recess-order",
  "stylelint-config-idiomatic-order",
  "stylelint-config-standard-scss",
  "stylelint-config-tailwindcss",
  "stylelint-plugin-font/configs/font-recommended",
 ],
};
```

## Manual plugin registration

If you prefer to compose rules manually:

```js
import fontPlugin from "stylelint-plugin-font";

export default {
 plugins: ["stylelint-plugin-font"],
 // Alternative explicit pack form:
 // plugins: [...fontPlugin],
 rules: {
  "font/require-font-display": true,
 },
};
```

This package default-exports a plugin-pack array, so both plugin registration forms are supported.

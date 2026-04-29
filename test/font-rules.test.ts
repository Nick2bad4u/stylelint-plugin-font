import { describe, expect, it } from "vitest";

import { fontPluginConfigs, ruleIds } from "../src/plugin";
import {
    lintWithConfig,
    runStylelintWithConfig,
} from "./_internal/stylelint-test-helpers";

type RuleCase = Readonly<{
    accept: string;
    fixed?: Readonly<{
        input: string;
        output: string;
    }>;
    reject: string;
    ruleId: string;
}>;

const cases: readonly RuleCase[] = [
    {
        accept: '@font-face{font-family:"Inter";font-display:swap;font-style:normal;font-weight:400;src:url("./inter.woff2") format("woff2");}',
        fixed: {
            input: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
            output: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");font-display:swap;}',
        },
        reject: '@font-face{font-family:"Inter";font-style:normal;font-weight:400;src:url("./inter.woff2") format("woff2");}',
        ruleId: "font/require-font-display",
    },
    {
        accept: '@font-face{font-family:"Inter";font-style:normal;src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        ruleId: "font/require-font-style",
    },
    {
        accept: '@font-face{font-family:"Inter";font-weight:400;src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-style:normal;src:url("./inter.woff2") format("woff2");}',
        ruleId: "font/require-font-weight",
    },
    {
        accept: '@font-face{font-family:"Inter";font-weight:100;unicode-range:U+0-5FF;src:url("./inter-100.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:200;unicode-range:U+0-5FF;src:url("./inter-200.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:300;unicode-range:U+0-5FF;src:url("./inter-300.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:400;unicode-range:U+0-5FF;src:url("./inter-400.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-weight:100;unicode-range:U+0-5FF;src:url("./inter-100.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:200;src:url("./inter-200.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:300;src:url("./inter-300.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:400;src:url("./inter-400.woff2") format("woff2");}',
        ruleId: "font/require-unicode-range-for-large-family",
    },
    {
        accept: '@font-face{font-family:"Inter";unicode-range:U+0000-00FF;src:url("./inter-latin.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";src:url("./inter-latin.woff2") format("woff2");}',
        ruleId: "font/require-unicode-range-for-subset-fonts",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";src:url("./inter.woff2");}',
        ruleId: "font/require-format-hint",
    },
    {
        accept: '@font-face{font-family:"Inter";src:local("Inter"),url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2"),local("Inter");}',
        ruleId: "font/local-src-before-url",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2"),url("./inter.woff") format("woff");}',
        reject: '@font-face{font-family:"Inter";src:url("./inter.woff") format("woff");}',
        ruleId: "font/prefer-woff2",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";src:url("./inter.ttf") format("truetype"),url("./inter.woff2") format("woff2");}',
        ruleId: "font/no-legacy-formats",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2"),url("./inter.woff") format("woff");}',
        reject: '@font-face{font-family:"Inter";src:url("./inter.woff") format("woff"),url("./inter.woff2") format("woff2");}',
        ruleId: "font/woff2-before-woff",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";src:url("data:font/woff2;base64,AAAA") format("woff2");}',
        ruleId: "font/no-data-uri-src",
    },
    {
        accept: '@font-face{font-family:"Inter";font-style:normal;font-weight:400;src:url("./inter-400.woff2") format("woff2");}@font-face{font-family:"Inter";font-style:normal;font-weight:700;src:url("./inter-700.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-style:normal;font-weight:400;src:url("./inter-a.woff2") format("woff2");}@font-face{font-family:"Inter";font-style:normal;font-weight:400;src:url("./inter-b.woff2") format("woff2");}',
        ruleId: "font/no-duplicate-font-face",
    },
    {
        accept: '@font-face{font-family:"Inter";font-display:swap;src:url("./inter-400.woff2") format("woff2");}@font-face{font-family:"Inter";font-display:swap;src:url("./inter-700.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-display:swap;src:url("./inter-400.woff2") format("woff2");}@font-face{font-family:"Inter";font-display:fallback;src:url("./inter-700.woff2") format("woff2");}',
        ruleId: "font/consistent-font-display",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter-400.woff2") format("woff2");}@font-face{font-family:"Inter";src:url("./inter-700.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";src:url("./inter-400.woff2") format("woff2");}@font-face{font-family:"inter";src:url("./inter-700.woff2") format("woff2");}',
        ruleId: "font/consistent-font-family-casing",
    },
    {
        accept: '.title{font-family:"Open Sans",system-ui;}',
        reject: ".title{font-family:Open Sans,system-ui;}",
        ruleId: "font/no-whitespace-in-unquoted-family",
    },
    {
        accept: '.title{font-family:"Inter",system-ui;}',
        reject: '.title{font-family:"Inter",Arial;}',
        ruleId: "font/require-system-font-fallback",
    },
    {
        accept: '.title{font-family:"Inter",system-ui;}',
        reject: '.title{font-family:"Inter";}',
        ruleId: "font/no-missing-fallback-before-web-font",
    },
    {
        accept: '@font-face{font-family:"Inter";font-weight:100 900;src:url("./inter-variable.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-weight:300;src:url("./inter-300.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:400;src:url("./inter-400.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:700;src:url("./inter-700.woff2") format("woff2");}',
        ruleId: "font/prefer-variable-fonts",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./fonts/inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";src:url("/fonts/inter.woff2") format("woff2");}',
        ruleId: "font/no-absolute-font-url",
    },
    {
        accept: '@font-face{font-family:"Inter";font-style:normal;font-weight:400;src:url("./inter-basic.woff2") format("woff2");unicode-range:U+0000-00FF;}@font-face{font-family:"Inter";font-style:normal;font-weight:400;src:url("./inter-ext.woff2") format("woff2");unicode-range:U+0100-024F;}',
        reject: '@font-face{font-family:"Inter";font-style:normal;font-weight:400;src:url("./inter-basic.woff2") format("woff2");unicode-range:U+0000-00FF;}@font-face{font-family:"Inter";font-style:normal;font-weight:400;src:url("./inter-ext.woff2") format("woff2");unicode-range:U+00A0-024F;}',
        ruleId: "font/no-overlapping-unicode-range",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter-latin.woff2") format("woff2");unicode-range:U+0000-00FF;}',
        reject: '@font-face{font-family:"Inter";src:url("./inter-latin.woff2") format("woff2");unicode-range:U+00??-FF;}',
        ruleId: "font/no-invalid-unicode-range",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:sans-serif;src:url("./inter.woff2") format("woff2");}',
        ruleId: "font/no-generic-family-in-font-face",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";src:url("//cdn.example.com/inter.woff2") format("woff2");}',
        ruleId: "font/no-protocol-relative-font-url",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";}',
        ruleId: "font/require-src-in-font-face",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        reject: "@font-face{}",
        ruleId: "font/no-empty-font-face",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2"),url("./inter.woff") format("woff");}',
        reject: '@font-face{font-family:"Inter";src:url("./inter-a.woff2") format("woff2"),url("./inter-b.woff2") format("woff2");}',
        ruleId: "font/no-duplicate-src-format",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        reject: '@media screen{@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}}',
        ruleId: "font/no-font-face-in-media-query",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{src:url("./inter.woff2") format("woff2");}',
        ruleId: "font/require-font-family-in-font-face",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        fixed: {
            input: "@font-face{font-family:Inter;src:url('./inter.woff2') format('woff2');}",
            output: "@font-face{font-family:\"Inter\";src:url('./inter.woff2') format('woff2');}",
        },
        reject: "@font-face{font-family:Inter;src:url('./inter.woff2') format('woff2');}",
        ruleId: "font/no-unquoted-font-family-in-font-face",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("https://fonts.example.com/inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";src:url("http://fonts.example.com/inter.woff2") format("woff2");}',
        ruleId: "font/no-http-font-url",
    },
    {
        accept: '@font-face{font-family:"Inter";font-display:swap;src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-display:fast;src:url("./inter.woff2") format("woff2");}',
        ruleId: "font/no-invalid-font-display",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-family:"Roboto";src:url("./inter.woff2") format("woff2");}',
        ruleId: "font/no-duplicate-descriptors-in-font-face",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";src:local("Inter"),url("./inter.woff2") format("woff2");}',
        ruleId: "font/no-local-src-in-font-face",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("https://cdn.example.com/inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";src:url("./missing-font.woff2") format("woff2");}',
        ruleId: "font/no-missing-font-file",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff");}',
        ruleId: "font/no-src-format-mismatch",
    },
    {
        accept: '@font-face{font-family:"Inter";font-weight:400;src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-weight:999999;src:url("./inter.woff2") format("woff2");}',
        ruleId: "font/no-invalid-font-weight",
    },
    {
        // Range where min > max is invalid
        accept: '@font-face{font-family:"Inter";font-weight:100 900;src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-weight:900 100;src:url("./inter.woff2") format("woff2");}',
        ruleId: "font/no-invalid-font-weight",
    },
    {
        // "bold" keyword is valid per CSS Fonts Level 4 (equivalent to 700)
        accept: '@font-face{font-family:"Inter";font-weight:bold;src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-weight:bolder;src:url("./inter.woff2") format("woff2");}',
        ruleId: "font/no-invalid-font-weight",
    },
    {
        accept: '@font-face{font-family:"Inter";font-style:italic;src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-style:skew;src:url("./inter.woff2") format("woff2");}',
        ruleId: "font/no-invalid-font-style",
    },
    {
        // Oblique with valid angle
        accept: '@font-face{font-family:"Inter";font-style:oblique 14deg;src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-style:oblique badangle;src:url("./inter.woff2") format("woff2");}',
        ruleId: "font/no-invalid-font-style",
    },
    {
        // Variable-font oblique angle range (CSS Fonts Level 4)
        accept: '@font-face{font-family:"Inter";font-style:oblique -90deg 90deg;src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-style:oblique bad good;src:url("./inter.woff2") format("woff2");}',
        ruleId: "font/no-invalid-font-style",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        fixed: {
            input: '@font-face{font-family:"Inter";src:url("./inter.ttf") format("truetype"),url("./inter.woff2") format("woff2");}',
            output: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        },
        reject: '@font-face{font-family:"Inter";src:url("./inter.svg") format("svg");}',
        ruleId: "font/no-legacy-formats",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2"),url("./inter.woff") format("woff");}',
        fixed: {
            input: '@font-face{font-family:"Inter";src:url("./inter.woff") format("woff"),url("./inter.woff2") format("woff2");}',
            output: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2"),url("./inter.woff") format("woff");}',
        },
        reject: '@font-face{font-family:"Inter";src:url("./inter.woff") format("woff"),url("./inter.woff2") format("woff2");}',
        ruleId: "font/woff2-before-woff",
    },
    {
        accept: '@font-face{font-family:"Inter";src:local("Inter"),url("./inter.woff2") format("woff2");}',
        fixed: {
            input: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2"),local("Inter");}',
            output: '@font-face{font-family:"Inter";src:local("Inter"),url("./inter.woff2") format("woff2");}',
        },
        reject: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2"),local("Inter");}',
        ruleId: "font/local-src-before-url",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        fixed: {
            input: '@font-face{font-family:"Inter";src:url("./inter.woff2");}',
            output: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        },
        reject: '@font-face{font-family:"Inter";src:url("./inter.woff2");}',
        ruleId: "font/require-format-hint",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        reject: 'body{@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}}',
        ruleId: "font/no-font-face-in-selectors",
    },
    {
        // @font-face inside @layer (an at-rule) is acceptable — exercises the atrule walk-up path
        accept: '@layer base{@font-face{font-family:"Inter";src:url("./inter.woff2")format("woff2");}}',
        reject: '@media screen{body{@font-face{font-family:"Inter";src:url("./inter.woff2")format("woff2");}}}',
        ruleId: "font/no-font-face-in-selectors",
    },
    {
        // Autofix: normalise second @font-face casing to match canonical first block
        accept: '@font-face{font-family:"Inter";src:url("./a.woff2")format("woff2");}@font-face{font-family:"Inter";src:url("./b.woff2")format("woff2");}',
        fixed: {
            input: '@font-face{font-family:"Inter";src:url("./a.woff2")format("woff2");}@font-face{font-family:"inter";src:url("./b.woff2")format("woff2");}',
            output: '@font-face{font-family:"Inter";src:url("./a.woff2")format("woff2");}@font-face{font-family:"Inter";src:url("./b.woff2")format("woff2");}',
        },
        reject: '@font-face{font-family:"Inter";src:url("./a.woff2")format("woff2");}@font-face{font-family:"inter";src:url("./b.woff2")format("woff2");}',
        ruleId: "font/consistent-font-family-casing",
    },
    {
        // Autofix: wrap unquoted multi-word family name in quotes
        accept: '.title{font-family:"Open Sans",system-ui;}',
        fixed: {
            input: ".title{font-family:Open Sans,system-ui;}",
            output: '.title{font-family:"Open Sans",system-ui;}',
        },
        reject: ".title{font-family:Open Sans,system-ui;}",
        ruleId: "font/no-whitespace-in-unquoted-family",
    },
    {
        // Invalid unicode-range tokens (wildcard+explicit-end U+00??-FF, and wildcard-end U+20-?F)
        // cause those @font-face blocks to be skipped — no overlap is detected
        accept: '@font-face{font-family:"I";unicode-range:U+00??-FF,U+20-?F;src:url("./a.woff2")format("woff2");}@font-face{font-family:"I";unicode-range:U+0100-01FF;src:url("./b.woff2")format("woff2");}',
        reject: '@font-face{font-family:"I";unicode-range:U+0020-00FF;src:url("./a.woff2")format("woff2");}@font-face{font-family:"I";unicode-range:U+00A0-024F;src:url("./b.woff2")format("woff2");}',
        ruleId: "font/no-overlapping-unicode-range",
    },
    {
        // Wildcard range (U+00?? = U+0000-00FF) exercises wildcardToInterval helper
        // Non-overlapping with U+0100-01FF exercises the continue (non-overlap) path
        accept: '@font-face{font-family:"I";unicode-range:U+00??;src:url("./a.woff2")format("woff2");}@font-face{font-family:"I";unicode-range:U+0100-01FF;src:url("./b.woff2")format("woff2");}',
        reject: '@font-face{font-family:"I";unicode-range:U+00??;src:url("./a.woff2")format("woff2");}@font-face{font-family:"I";unicode-range:U+0020-00FF;src:url("./b.woff2")format("woff2");}',
        ruleId: "font/no-overlapping-unicode-range",
    },
    {
        // Local() entries are not URLs; exercises the entry.isUrl === false path in prefer-woff2
        accept: '@font-face{font-family:"Inter";src:local("Inter"),url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";src:local("Inter"),url("./inter.ttf") format("truetype");}',
        ruleId: "font/prefer-woff2",
    },
    {
        // 3+ blocks, one has variable weight range → hasVariableWeightRange = true → already using variable fonts
        accept: '@font-face{font-family:"Inter";font-weight:400;src:url("./inter-400.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:700;src:url("./inter-700.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:100 900;src:url("./inter-var.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-weight:200;src:url("./inter-200.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:400;src:url("./inter-400.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:700;src:url("./inter-700.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:900;src:url("./inter-900.woff2") format("woff2");}',
        ruleId: "font/prefer-variable-fonts",
    },
    {
        // Font-family inside @font-face is skipped; first-family as system-ui is accepted
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}.title{font-family:system-ui,"Inter";}',
        reject: '.title{font-family:"Roboto";}',
        ruleId: "font/no-missing-fallback-before-web-font",
    },
    {
        // Unquoted multi-word family in 2nd block — exercises the canonical.includes(" ") branch
        accept: '@font-face{font-family:"Open Inter";src:url("./a.woff2")format("woff2");}@font-face{font-family:"Open Inter";src:url("./b.woff2")format("woff2");}',
        fixed: {
            input: '@font-face{font-family:"Open Inter";src:url("./a.woff2")format("woff2");}@font-face{font-family:open inter;src:url("./b.woff2")format("woff2");}',
            output: '@font-face{font-family:"Open Inter";src:url("./a.woff2")format("woff2");}@font-face{font-family:"Open Inter";src:url("./b.woff2")format("woff2");}',
        },
        reject: '@font-face{font-family:"Open Inter";src:url("./a.woff2")format("woff2");}@font-face{font-family:open inter;src:url("./b.woff2")format("woff2");}',
        ruleId: "font/consistent-font-family-casing",
    },
    {
        // @font-face without src + local() + URL without extension exercises lines 59, 80, 93, 99
        accept: '@font-face{font-family:"Inter";}@font-face{font-family:"Inter";src:local("Inter"),url("./font") format("woff2"),url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("truetype");}',
        ruleId: "font/no-src-format-mismatch",
    },
    {
        // Local() + URL with unknown extension exercises addInferredFormatHints lines 37, 43
        accept: '@font-face{font-family:"Inter";src:local("Inter"),url("./inter.woff2") format("woff2");}',
        fixed: {
            input: '@font-face{font-family:"Inter";src:local("Inter"),url("./font.xyz"),url("./inter.woff2");}',
            output: '@font-face{font-family:"Inter";src:local("Inter"), url("./font.xyz"), url("./inter.woff2") format("woff2");}',
        },
        reject: '@font-face{font-family:"Inter";src:local("Inter"),url("./font.xyz"),url("./inter.woff2");}',
        ruleId: "font/require-format-hint",
    },
    {
        // @font-face font-family skipped; system-ui at end is accepted — covers lines 44, 56
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}.title{font-family:"Inter",system-ui;}',
        reject: '.title{font-family:"Inter";}',
        ruleId: "font/require-system-font-fallback",
    },
    {
        // URL with no dot (no extension) → extractExtension returns undefined — covers lines 59, 99
        accept: '@font-face{font-family:"Inter";src:url("fontname") format("woff2"),url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff");}',
        ruleId: "font/no-src-format-mismatch",
    },
    {
        // URL containing "variable" → hasLikelyVariableSource = true — covers line 81
        accept: '@font-face{font-family:"Inter";src:url("./inter-variable.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:700;src:url("./inter-700.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:900;src:url("./inter-900.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-weight:200;src:url("./inter-200.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:400;src:url("./inter-400.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:700;src:url("./inter-700.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:900;src:url("./inter-900.woff2") format("woff2");}',
        ruleId: "font/prefer-variable-fonts",
    },
    {
        // Each @font-face for the same family uses a unique URL
        accept: '@font-face{font-family:"Inter";font-weight:400;src:url("./inter-400.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:700;src:url("./inter-700.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-weight:400;src:url("./inter.woff2") format("woff2");}@font-face{font-family:"Inter";font-weight:700;src:url("./inter.woff2") format("woff2");}',
        ruleId: "font/no-duplicate-font-family-src",
    },
    {
        // @font-face family is referenced by a font-family declaration in the same stylesheet
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}.title{font-family:"Inter",system-ui;}',
        reject: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        ruleId: "font/no-unused-font-face",
    },
] as const;

type FixableRuleCase = RuleCase & { fixed: NonNullable<RuleCase["fixed"]> };

const fixableCases = cases.filter(
    (c): c is FixableRuleCase => c.fixed !== undefined
);

describe("font plugin rules", () => {
    it("exports exactly the requested rule catalog", () => {
        expect.hasAssertions();
        expect(ruleIds).toHaveLength(40);
        expect(ruleIds).toContain("font/require-font-display");
        expect(ruleIds).toContain("font/no-duplicate-font-face");
        expect(fontPluginConfigs["font-recommended"].rules).toBeDefined();
    });

    it.each(cases)("$ruleId accepts compliant code", async (testCase) => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: testCase.accept,
            config: {
                rules: {
                    [testCase.ruleId]: true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it.each(cases)("$ruleId reports invalid code", async (testCase) => {
        expect.hasAssertions();

        const result = await lintWithConfig({
            code: testCase.reject,
            config: {
                rules: {
                    [testCase.ruleId]: true,
                },
            },
        });

        expect(result.parseErrors).toHaveLength(0);
        expect(result.warnings.length).toBeGreaterThanOrEqual(1);
    });

    it.each(fixableCases)(
        "$ruleId autofixes deterministic cases",
        async (testCase) => {
            expect.hasAssertions();

            const result = await runStylelintWithConfig({
                code: testCase.fixed.input,
                config: {
                    rules: {
                        [testCase.ruleId]: true,
                    },
                },
                fix: true,
            });

            const [firstResult] = result.results;

            expect(firstResult?.parseErrors).toHaveLength(0);
            expect(result.code?.replaceAll("\n", "").replaceAll(" ", "")).toBe(
                testCase.fixed.output.replaceAll("\n", "").replaceAll(" ", "")
            );
        }
    );
});

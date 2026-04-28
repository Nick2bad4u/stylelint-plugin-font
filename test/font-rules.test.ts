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
        accept: '@font-face{font-family:"Inter";font-style:italic;src:url("./inter.woff2") format("woff2");}',
        reject: '@font-face{font-family:"Inter";font-style:skew;src:url("./inter.woff2") format("woff2");}',
        ruleId: "font/no-invalid-font-style",
    },
    {
        accept: '@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}',
        reject: 'body{@font-face{font-family:"Inter";src:url("./inter.woff2") format("woff2");}}',
        ruleId: "font/no-font-face-in-selectors",
    },
] as const;

type FixableRuleCase = RuleCase & { fixed: NonNullable<RuleCase["fixed"]> };

const fixableCases = cases.filter(
    (c): c is FixableRuleCase => c.fixed !== undefined
);

describe("font plugin rules", () => {
    it("exports exactly the requested rule catalog", () => {
        expect.hasAssertions();
        expect(ruleIds).toHaveLength(34);
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

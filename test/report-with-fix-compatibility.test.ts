import type { PostcssResult, RuleContext } from "stylelint";

import postcss, { type Result } from "postcss";
import { describe, expect, it, vi } from "vitest";

import { reportWithFixCompatibility } from "../src/_internal/report-with-fix-compatibility.js";

const ruleName = "font/test-fix-compatibility";

function createProblem(fix: () => void): Readonly<{
    problem: Parameters<typeof reportWithFixCompatibility>[0];
    result: Result;
}> {
    const root = postcss.parse(".fixture {}", { from: "fixture.css" });
    const result = root.toResult() as PostcssResult;

    result.stylelint = {
        customMessages: {},
        customUrls: {},
        disabledRanges: { all: [] },
        fixersData: {},
        lexer: null,
        rangesOfComputedEditInfos: [],
        referenceRoots: [root],
        ruleMetadata: { [ruleName]: { fixable: true } },
        ruleSeverities: { [ruleName]: "error" },
    };

    return {
        problem: {
            fix,
            message: "Compatibility test warning",
            node: root,
            result,
            ruleName,
        },
        result,
    };
}

describe(reportWithFixCompatibility, () => {
    it("applies the legacy fix directly when Stylelint exposes a true data property", () => {
        expect.assertions(2);

        const fix = vi.fn<() => void>();
        const { problem, result } = createProblem(fix);

        reportWithFixCompatibility(problem, { fix: true });

        expect(fix).toHaveBeenCalledExactlyOnceWith();
        expect(result.warnings()).toHaveLength(0);
    });

    it("reports normally when the legacy data property disables fixing", () => {
        expect.assertions(3);

        const fix = vi.fn<() => void>();
        const { problem, result } = createProblem(fix);

        reportWithFixCompatibility(problem, { fix: false });

        expect(fix).not.toHaveBeenCalled();
        expect(result.warnings()).toHaveLength(1);
        expect(result.warnings()[0]?.text).toContain(ruleName);
    });

    it("does not read the deprecated modern Stylelint fix getter", () => {
        expect.assertions(3);

        const fix = vi.fn<() => void>();
        const getter = vi.fn<() => boolean>(() => true);
        const context: RuleContext = {};
        const { problem, result } = createProblem(fix);

        Object.defineProperty(context, "fix", { get: getter });
        reportWithFixCompatibility(problem, context);

        expect(getter).not.toHaveBeenCalled();
        expect(fix).not.toHaveBeenCalled();
        expect(result.warnings()).toHaveLength(1);
    });
});

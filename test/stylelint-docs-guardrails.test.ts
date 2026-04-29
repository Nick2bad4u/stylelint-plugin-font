import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { ruleIds } from "../src/plugin";

function getRuleSlug(ruleId: string): string {
    return ruleId.replace(/^font\//v, "");
}

describe("stylelint docs guardrails", () => {
    it("has a docs page for every exported rule id", async () => {
        expect.hasAssertions();

        for (const ruleId of ruleIds) {
            const slug = getRuleSlug(ruleId);
            const docsPath = path.resolve("docs", "rules", `${slug}.md`);

            await expect(readFile(docsPath, "utf8")).resolves.toBeTypeOf(
                "string"
            );
        }
    });

    it("keeps each rule docs page structurally complete", async () => {
        expect.hasAssertions();

        for (const ruleId of ruleIds) {
            const slug = getRuleSlug(ruleId);
            const docsPath = path.resolve("docs", "rules", `${slug}.md`);
            const docs = await readFile(docsPath, "utf8");

            expect(docs).toContain(`# ${slug}`);
            expect(docs).toContain("## Further reading");
            expect(docs).toContain("Rule catalog ID");
        }
    });
});

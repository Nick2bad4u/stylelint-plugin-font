import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const releaseWorkflowPath = fileURLToPath(
    new URL("../.github/workflows/release.yml", import.meta.url)
);
const installWorkflowPaths = [
    fileURLToPath(new URL("../.github/workflows/ci.yml", import.meta.url)),
    fileURLToPath(
        new URL("../.github/workflows/deploy-docusaurus.yml", import.meta.url)
    ),
    releaseWorkflowPath,
];

describe("release workflow guardrails", () => {
    it("keeps verification and release identities fail-closed", async () => {
        expect.assertions(15);

        const workflow = await readFile(releaseWorkflowPath, "utf8");

        expect(workflow).toContain('run: "npm run release:check"');
        expect(workflow).toContain("git add -- package.json package-lock.json");
        expect(workflow).toContain("git push --atomic origin");
        expect(workflow).toContain('name: "Install declared npm version"');
        expect(workflow).toMatch(
            /npm install --global --ignore-scripts "npm@\$\{npm_version\}"/v
        );
        expect(workflow).toContain('name: "Configure npm cache and registry"');
        expect(workflow).toContain("package-manager-cache: false");
        expect(workflow).toContain("elif grep -q 'E404'");
        expect(workflow).toContain("node scripts/read-npm-pack-filename.mjs");
        expect(workflow).toContain("overwrite_files: false");
        expect(workflow).toMatch(
            /git commit -m "🔖 \[chore\] \(release\) Publish \$\{TAG\}"/v
        );
        expect(workflow).not.toContain("skip_verify");
        expect(workflow).not.toContain("git add -A");
        expect(workflow).not.toContain("npm ci --force");
        expect(workflow).not.toContain("git fetch --tags --force");
    });

    it("runs only reviewed dependency lifecycle scripts", async () => {
        expect.assertions(6);

        for (const workflowPath of installWorkflowPaths) {
            const workflow = await readFile(workflowPath, "utf8");

            expect(workflow).toContain("npm ci --ignore-scripts");
            expect(workflow).toContain("npm rebuild --foreground-scripts");
        }
    });
});

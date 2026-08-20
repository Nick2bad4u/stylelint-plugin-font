import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const releaseWorkflowPath = fileURLToPath(
    new URL("../.github/workflows/release.yml", import.meta.url)
);
const ciWorkflowPath = fileURLToPath(
    new URL("../.github/workflows/ci.yml", import.meta.url)
);
const packageJsonPath = fileURLToPath(
    new URL("../package.json", import.meta.url)
);
const actionlintScriptPath = fileURLToPath(
    new URL("../scripts/run-actionlint.mjs", import.meta.url)
);
const installWorkflowPaths = [
    ciWorkflowPath,
    fileURLToPath(
        new URL("../.github/workflows/deploy-docusaurus.yml", import.meta.url)
    ),
    releaseWorkflowPath,
];

describe("release workflow guardrails", () => {
    it("keeps verification and release identities fail-closed", async () => {
        expect.assertions(17);

        const workflow = await readFile(releaseWorkflowPath, "utf8");

        expect(workflow).toContain('run: "npm run release:check"');
        expect(workflow).toContain("Merge a checked version PR first.");
        expect(workflow).toMatch(/git push origin "refs\/tags\/\$\{TAG\}"/v);
        expect(workflow).toContain('name: "Install declared npm version"');
        expect(workflow).toMatch(
            /npm install --global --ignore-scripts "npm@\$\{npm_version\}"/v
        );
        expect(workflow).toContain('name: "Configure npm cache and registry"');
        expect(workflow).toContain("package-manager-cache: false");
        expect(workflow).toContain("elif grep -q 'E404'");
        expect(workflow).toContain("node scripts/read-npm-pack-filename.mjs");
        expect(workflow).toContain("overwrite_files: false");
        expect(workflow).not.toContain('npm version "');
        expect(workflow).not.toContain("git commit");
        expect(workflow).not.toContain("skip_verify");
        expect(workflow).not.toContain("git add -A");
        expect(workflow).not.toContain("npm ci --force");
        expect(workflow).not.toContain("git fetch --tags --force");
        expect(workflow).not.toMatch(/HEAD:refs\/heads\/\$\{BRANCH\}/v);
    });

    it("runs only reviewed dependency lifecycle scripts", async () => {
        expect.assertions(6);

        for (const workflowPath of installWorkflowPaths) {
            const workflow = await readFile(workflowPath, "utf8");

            expect(workflow).toContain("npm ci --ignore-scripts");
            expect(workflow).toContain("npm rebuild --foreground-scripts");
        }
    });

    it("uses locked local binaries for hosted verification and docs", async () => {
        expect.assertions(15);

        const [
            actionlintScript,
            ciWorkflow,
            packageJsonText,
        ] = await Promise.all([
            readFile(actionlintScriptPath, "utf8"),
            readFile(ciWorkflowPath, "utf8"),
            readFile(packageJsonPath, "utf8"),
        ]);
        const packageJson = JSON.parse(packageJsonText) as {
            devDependencies: Record<string, string>;
            scripts: Record<string, string>;
        };

        expect(ciWorkflow).toContain('run: "npm run test:coverage:ci"');
        expect(ciWorkflow).not.toContain("npx vitest");
        expect(ciWorkflow).toContain('run: "npm run lint:actions"');
        expect(packageJson.devDependencies).not.toHaveProperty("actionlint");
        expect(packageJson.devDependencies).toHaveProperty(
            "stylelint-config-inspector",
            "^2.3.5"
        );
        expect(packageJson.scripts["lint:actions"]).toBe(
            "node scripts/run-actionlint.mjs -color -shellcheck= -pyflakes="
        );
        expect(packageJsonText).not.toContain("config-inspector@latest");
        expect(packageJson.scripts["test:coverage:ci"]).toContain(
            "vitest run --coverage"
        );
        expect(actionlintScript).toContain(
            "https://github.com/rhysd/actionlint/releases/download/"
        );
        expect(actionlintScript).toContain(
            'export const ACTIONLINT_VERSION = "1.7.12"'
        );
        expect(actionlintScript).toContain(
            "8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8"
        );
        expect(actionlintScript).toContain("getDefaultCacheDirectory()");
        expect(actionlintScript).toContain("await lstat(cacheDirectoryPath)");
        expect(actionlintScript).toContain('flag: "wx"');
        expect(actionlintScript).toMatch(
            /invocation-\$\{platform\}-\$\{arch\}-/v
        );
    });
});

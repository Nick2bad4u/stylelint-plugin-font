import * as nodePath from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import {
    createCompatibilityCheckCommands,
    createConsumerManifest,
} from "../scripts/run-stylelint16-compat.mjs";

describe("stylelint 16 isolated consumer", () => {
    it("installs only the packed plugin and supported Stylelint major", () => {
        expect.assertions(1);

        const tarballPath = nodePath.resolve("temp", "plugin.tgz");

        expect(createConsumerManifest(tarballPath)).toMatchObject({
            dependencies: {
                stylelint: "16.0.0",
                "stylelint-plugin-font": pathToFileURL(tarballPath).href,
            },
            private: true,
        });
    });

    it("uses ordinary consumer installation without bypass flags", () => {
        expect.assertions(4);

        const commands = createCompatibilityCheckCommands({
            consumerDirectoryPath: "consumer",
            consumerSmokeScriptPath: "consumer/smoke.mjs",
            nodeCommand: "node",
            npmCommand: "npm",
            platform: "linux",
            repositoryRootPath: "repository",
        });
        const allArguments = commands.flatMap(({ args }) => args);

        expect(commands).toStrictEqual([
            {
                args: ["run", "build"],
                command: "npm",
                cwd: "repository",
                shell: false,
            },
            {
                args: [
                    "install",
                    "--no-audit",
                    "--no-fund",
                ],
                command: "npm",
                cwd: "consumer",
                shell: false,
            },
            {
                args: ["consumer/smoke.mjs", "--expect-stylelint-major=16"],
                command: "node",
                cwd: "consumer",
                shell: false,
            },
        ]);
        expect(allArguments).not.toContain("--force");
        expect(allArguments).not.toContain("--legacy-peer-deps");
        expect(allArguments).not.toContain("--ignore-scripts");
    });
});

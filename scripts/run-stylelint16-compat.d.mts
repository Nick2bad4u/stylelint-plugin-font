export interface Stylelint16CompatCommandSpec {
    readonly args: readonly string[];
    readonly command: string;
    readonly cwd: string;
    readonly shell: boolean;
}

export function getNpmCommand(platform?: string): string;

export function getWindowsCommandShell(environment?: NodeJS.ProcessEnv): string;

export function isDirectExecution(input: {
    readonly argvEntry?: string | undefined;
    readonly currentImportUrl: string;
}): boolean;

export function createConsumerManifest(
    tarballPath: string
): Readonly<Record<string, unknown>>;

export function createCompatibilityCheckCommands(input: {
    readonly consumerDirectoryPath: string;
    readonly consumerSmokeScriptPath: string;
    readonly nodeCommand?: string | undefined;
    readonly npmCommand?: string | undefined;
    readonly platform?: string | undefined;
    readonly repositoryRootPath?: string | undefined;
}): readonly Stylelint16CompatCommandSpec[];

export function runCommand(
    input: Stylelint16CompatCommandSpec,
    options?: {
        readonly captureStdout?: boolean | undefined;
        readonly windowsCommandShell?: string | undefined;
    }
): string;

export function runStylelint16Compat(input?: {
    readonly copyFileFn?:
        typeof import("node:fs/promises").copyFile | undefined;
    readonly mkdtempFn?: typeof import("node:fs/promises").mkdtemp | undefined;
    readonly nodeCommand?: string | undefined;
    readonly npmCommand?: string | undefined;
    readonly platform?: string | undefined;
    readonly repositoryRootPath?: string | undefined;
    readonly rmFn?: typeof import("node:fs/promises").rm | undefined;
    readonly runCommandFn?: typeof runCommand | undefined;
    readonly smokeScriptPath?: string | undefined;
    readonly tempRootPath?: string | undefined;
    readonly windowsCommandShell?: string | undefined;
    readonly writeFileFn?:
        typeof import("node:fs/promises").writeFile | undefined;
}): Promise<void>;

export function runCli(): Promise<void>;

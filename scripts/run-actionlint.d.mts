export const ACTIONLINT_VERSION: "1.7.12";

export type ActionlintAsset = Readonly<{
    filename: string;
    sha256: string;
    size: number;
}>;

export function getActionlintAsset(
    input?: Readonly<{
        arch?: string | undefined;
        platform?: string | undefined;
    }>
): ActionlintAsset;

export function calculateSha256(payload: Uint8Array): string;

export function verifyAssetPayload(
    asset: ActionlintAsset,
    payload: Uint8Array
): void;

export function verifyActionlintVersion(binaryPath: string): void;

export function getTarCommand(
    input?: Readonly<{
        environment?: NodeJS.ProcessEnv | undefined;
        platform?: string | undefined;
    }>
): string;

export function prepareActionlint(
    input?: Readonly<{
        arch?: string | undefined;
        cacheDirectoryPath?: string | undefined;
        environment?: NodeJS.ProcessEnv | undefined;
        platform?: string | undefined;
    }>
): Promise<
    Readonly<{
        binaryPath: string;
        cleanup: () => Promise<void>;
    }>
>;

export function runActionlint(arguments_?: readonly string[]): Promise<number>;

export function isDirectExecution(
    input?: Readonly<{
        argvEntry?: string | undefined;
        currentImportUrl?: string | undefined;
    }>
): boolean;

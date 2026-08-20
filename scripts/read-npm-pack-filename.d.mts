export function readNpmPackFilename(metadata: unknown): string;

export function parseNpmPackFilename(metadataText: string): string;

export function runCli(argv?: readonly string[]): Promise<void>;

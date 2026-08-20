export interface NpmExtensionManifest extends Readonly<
    Record<string, unknown>
> {
    readonly name?: string;
    peerDependencies?: Record<string, string>;
    readonly version?: string;
}

export function transformManifest<TManifest extends NpmExtensionManifest>(
    manifest: TManifest,
    context: Readonly<{ log: (message: string) => void }>
): TManifest;

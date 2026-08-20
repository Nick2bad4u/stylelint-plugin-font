/**
 * Temporarily repair Madge 8's stale optional TypeScript peer range.
 *
 * Upstream tracking: https://github.com/pahen/madge/pull/460 Remove this repair
 * once a published Madge release supports TypeScript 6.
 *
 * @param {Record<string, unknown>} manifest
 * @param {{ log: (message: string) => void }} context
 *
 * @returns {Record<string, unknown>}
 */
export function transformManifest(manifest, context) {
    if (manifest["name"] !== "madge" || manifest["version"] !== "8.0.0") {
        return manifest;
    }

    const peerDependencies = manifest["peerDependencies"];
    if (
        typeof peerDependencies !== "object" ||
        peerDependencies === null ||
        Array.isArray(peerDependencies) ||
        Reflect.get(peerDependencies, "typescript") !== "^5.4.4"
    ) {
        throw new Error(
            "Madge 8.0.0 peer metadata changed; remove or revalidate the temporary TypeScript 6 repair."
        );
    }

    manifest["peerDependencies"] = {
        ...peerDependencies,
        typescript: "^5.4.4 || ^6.0.3",
    };
    context.log(
        "Extended madge@8.0.0's optional TypeScript peer through TypeScript 6."
    );

    return manifest;
}

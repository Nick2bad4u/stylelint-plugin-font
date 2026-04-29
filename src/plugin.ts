/**
 * @packageDocumentation
 * Public plugin entrypoint for `stylelint-plugin-font` exports and
 * shareable config wiring.
 */
import type { Config, Plugin as StylelintPlugin } from "stylelint";

import { isDefined, objectKeys } from "ts-extras";

import type { StylelintPluginRuleContract } from "./_internal/create-stylelint-rule.js";

import {
    CONFIG_NAMES as configNamesValue,
    type FontConfigName as InternalFontConfigName,
    PACKAGE_NAME as packageNameValue,
    PACKAGE_VERSION as packageVersionValue,
    PLUGIN_NAMESPACE as pluginNamespaceValue,
} from "./_internal/plugin-constants.js";
import { fontRules as fontRulesValue } from "./_internal/rules-registry.js";

/** Public shareable config map exported by this package. */
export type FontConfigMap = Record<FontConfigName, FontShareableConfig>;
/** Shareable config names exposed by this package. */
export type FontConfigName = InternalFontConfigName;
/** Public fully-qualified rule ids supported by this package. */
export type FontRuleId = `${typeof pluginNamespaceValue}/${string}`;

/** Public unqualified rule names supported by this package. */
export type FontRuleName = Extract<keyof typeof fontRulesValue, string>;

/** Shareable config shape exported by this package. */
export type FontShareableConfig = Config & {
    plugins: (string | StylelintPlugin)[];
    rules: NonNullable<Config["rules"]>;
};

/** Internal ordered registry entry tuple. */
type FontRuleEntry = readonly [string, StylelintPluginRuleContract];
/** Internal runtime rule registry shape. */
type FontRulesMap = Readonly<Record<string, StylelintPluginRuleContract>>;

/** Local package metadata values used to avoid import re-export warnings. */
const packageMetaName = packageNameValue;
const packageMetaNamespace = pluginNamespaceValue;
const packageMetaVersion = packageVersionValue;
/** Local rule registry alias used to avoid import re-export warnings. */
const runtimeRules = fontRulesValue;
/** Local config-name alias used to avoid import re-export warnings. */
const publicConfigNames = configNamesValue;

/** Public package metadata exported alongside the plugin pack. */
export const meta: Readonly<{
    name: string;
    namespace: string;
    version: string;
}> = {
    name: packageMetaName,
    namespace: packageMetaNamespace,
    version: packageMetaVersion,
};

/** Public rule registry keyed by unqualified rule name. */
export const rules: FontRulesMap = runtimeRules;

/** Stable ordered unqualified rule names. */
export const ruleNames: readonly string[] = objectKeys(rules).toSorted(
    (left, right) => left.localeCompare(right)
);

/** Stable ordered registry entries used to derive configs and ids. */
const fontRuleEntries: readonly FontRuleEntry[] = (() => {
    const entries: FontRuleEntry[] = [];

    for (const ruleName of ruleNames) {
        const rule = rules[ruleName];

        if (!isDefined(rule)) {
            continue;
        }

        entries.push([ruleName, rule]);
    }

    return entries;
})();

/** Default plugin-pack export consumed by Stylelint. */
export const plugins: readonly StylelintPlugin[] = fontRuleEntries.map(
    ([, rule]) => rule
);

/** Stable ordered fully qualified rule ids. */
export const ruleIds: readonly FontRuleId[] = fontRuleEntries.map(
    ([, rule]) => rule.ruleName as FontRuleId
);

/** Rule ids included in the recommended shareable config. */
const recommendedRuleIds: readonly FontRuleId[] = fontRuleEntries
    .filter(([, rule]) => rule.docs.recommended)
    .map(([, rule]) => rule.ruleName as FontRuleId);

/**
 * Build one shareable Stylelint config.
 *
 * @param enabledRuleIds - Rule ids to enable in the config.
 *
 * @returns Shareable Stylelint config.
 */
function createConfig(
    enabledRuleIds: readonly FontRuleId[]
): FontShareableConfig {
    return {
        plugins: [...plugins],
        rules: (() => {
            const rulesConfig: NonNullable<Config["rules"]> = {};

            for (const ruleId of enabledRuleIds) {
                rulesConfig[ruleId] = true;
            }

            return rulesConfig;
        })(),
    };
}

/**
 * Build one shareable config while applying explicit severity per rule.
 *
 * @param enabledRuleIds - Rule ids to enable.
 */
function createConfigWithSeverity(
    enabledRuleIds: readonly FontRuleId[]
): FontShareableConfig {
    const config = createConfig(enabledRuleIds);

    const severityByRule: Readonly<Record<FontRuleId, "error" | "warning">> = {
        "font/consistent-font-display": "warning",
        "font/consistent-font-family-casing": "warning",
        "font/local-src-before-url": "error",
        "font/no-absolute-font-url": "warning",
        "font/no-data-uri-src": "warning",
        "font/no-duplicate-descriptors-in-font-face": "error",
        "font/no-duplicate-font-face": "error",
        "font/no-duplicate-font-family-src": "error",
        "font/no-duplicate-src-format": "error",
        "font/no-empty-font-face": "error",
        "font/no-font-face-in-media-query": "warning",
        "font/no-font-face-in-selectors": "error",
        "font/no-generic-family-in-font-face": "error",
        "font/no-http-font-url": "error",
        "font/no-invalid-font-display": "error",
        "font/no-invalid-font-style": "error",
        "font/no-invalid-font-weight": "error",
        "font/no-invalid-unicode-range": "error",
        "font/no-legacy-formats": "warning",
        "font/no-local-src-in-font-face": "warning",
        "font/no-missing-fallback-before-web-font": "warning",
        "font/no-missing-font-file": "warning",
        "font/no-overlapping-unicode-range": "warning",
        "font/no-protocol-relative-font-url": "error",
        "font/no-src-format-mismatch": "error",
        "font/no-unquoted-font-family-in-font-face": "warning",
        "font/no-unused-font-face": "warning",
        "font/no-whitespace-in-unquoted-family": "error",
        "font/prefer-variable-fonts": "warning",
        "font/prefer-woff2": "warning",
        "font/require-font-display": "error",
        "font/require-font-family-in-font-face": "error",
        "font/require-font-style": "warning",
        "font/require-font-weight": "warning",
        "font/require-format-hint": "warning",
        "font/require-src-in-font-face": "error",
        "font/require-system-font-fallback": "warning",
        "font/require-unicode-range-for-large-family": "warning",
        "font/require-unicode-range-for-subset-fonts": "warning",
        "font/woff2-before-woff": "warning",
    };

    for (const ruleId of enabledRuleIds) {
        const severity = severityByRule[ruleId];

        config.rules[ruleId] = [true, { severity }];
    }

    return config;
}

/** Shareable config exports exposed by the package. */
export const fontPluginConfigs: FontConfigMap = {
    "font-all": createConfigWithSeverity(ruleIds),
    "font-recommended": createConfigWithSeverity(recommendedRuleIds),
};

/** Stable ordered shareable config names. */
export const configNames: readonly FontConfigName[] = publicConfigNames;

/** Default export consumed by Stylelint when the package is used as a plugin. */
export default plugins;

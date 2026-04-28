/**
 * @packageDocumentation
 * Canonical registry of public Stylelint rules exported by this package.
 */
import type { StylelintPluginRuleContract } from "./create-stylelint-rule.js";

import * as consistentFontDisplayModule from "../rules/consistent-font-display.js";
import * as consistentFontFamilyCasingModule from "../rules/consistent-font-family-casing.js";
import * as localSrcBeforeUrlModule from "../rules/local-src-before-url.js";
import * as noAbsoluteFontUrlModule from "../rules/no-absolute-font-url.js";
import * as noDataUriSrcModule from "../rules/no-data-uri-src.js";
import * as noDuplicateDescriptorsInFontFaceModule from "../rules/no-duplicate-descriptors-in-font-face.js";
import * as noDuplicateFontFaceModule from "../rules/no-duplicate-font-face.js";
import * as noDuplicateSrcFormatModule from "../rules/no-duplicate-src-format.js";
import * as noEmptyFontFaceModule from "../rules/no-empty-font-face.js";
import * as noFontFaceInMediaQueryModule from "../rules/no-font-face-in-media-query.js";
import * as noFontFaceInSelectorsModule from "../rules/no-font-face-in-selectors.js";
import * as noGenericFamilyInFontFaceModule from "../rules/no-generic-family-in-font-face.js";
import * as noHttpFontUrlModule from "../rules/no-http-font-url.js";
import * as noInvalidFontStyleModule from "../rules/no-invalid-font-style.js";
import * as noInvalidFontWeightModule from "../rules/no-invalid-font-weight.js";
import * as noLegacyFormatsModule from "../rules/no-legacy-formats.js";
import * as noLocalSrcInFontFaceModule from "../rules/no-local-src-in-font-face.js";
import * as noMissingFallbackBeforeWebFontModule from "../rules/no-missing-fallback-before-web-font.js";
import * as noOverlappingUnicodeRangeModule from "../rules/no-overlapping-unicode-range.js";
import * as noProtocolRelativeFontUrlModule from "../rules/no-protocol-relative-font-url.js";
import * as noSrcFormatMismatchModule from "../rules/no-src-format-mismatch.js";
import * as noUnquotedFontFamilyInFontFaceModule from "../rules/no-unquoted-font-family-in-font-face.js";
import * as noWhitespaceInUnquotedFamilyModule from "../rules/no-whitespace-in-unquoted-family.js";
import * as preferVariableFontsModule from "../rules/prefer-variable-fonts.js";
import * as preferWoff2Module from "../rules/prefer-woff2.js";
import * as requireFontDisplayModule from "../rules/require-font-display.js";
import * as requireFontFamilyInFontFaceModule from "../rules/require-font-family-in-font-face.js";
import * as requireFontStyleModule from "../rules/require-font-style.js";
import * as requireFontWeightModule from "../rules/require-font-weight.js";
import * as requireFormatHintModule from "../rules/require-format-hint.js";
import * as requireSrcInFontFaceModule from "../rules/require-src-in-font-face.js";
import * as requireSystemFontFallbackModule from "../rules/require-system-font-fallback.js";
import * as requireUnicodeRangeForLargeFamilyModule from "../rules/require-unicode-range-for-large-family.js";
import * as woff2BeforeWoffModule from "../rules/woff2-before-woff.js";

/** Public rule registry keyed by unqualified rule name. */
export const fontRules: Readonly<Record<string, StylelintPluginRuleContract>> =
    {
        "consistent-font-display": consistentFontDisplayModule.default,
        "consistent-font-family-casing":
            consistentFontFamilyCasingModule.default,
        "local-src-before-url": localSrcBeforeUrlModule.default,
        "no-absolute-font-url": noAbsoluteFontUrlModule.default,
        "no-data-uri-src": noDataUriSrcModule.default,
        "no-duplicate-descriptors-in-font-face":
            noDuplicateDescriptorsInFontFaceModule.default,
        "no-duplicate-font-face": noDuplicateFontFaceModule.default,
        "no-duplicate-src-format": noDuplicateSrcFormatModule.default,
        "no-empty-font-face": noEmptyFontFaceModule.default,
        "no-font-face-in-media-query": noFontFaceInMediaQueryModule.default,
        "no-font-face-in-selectors": noFontFaceInSelectorsModule.default,
        "no-generic-family-in-font-face":
            noGenericFamilyInFontFaceModule.default,
        "no-http-font-url": noHttpFontUrlModule.default,
        "no-invalid-font-style": noInvalidFontStyleModule.default,
        "no-invalid-font-weight": noInvalidFontWeightModule.default,
        "no-legacy-formats": noLegacyFormatsModule.default,
        "no-local-src-in-font-face": noLocalSrcInFontFaceModule.default,
        "no-missing-fallback-before-web-font":
            noMissingFallbackBeforeWebFontModule.default,
        "no-overlapping-unicode-range": noOverlappingUnicodeRangeModule.default,
        "no-protocol-relative-font-url":
            noProtocolRelativeFontUrlModule.default,
        "no-src-format-mismatch": noSrcFormatMismatchModule.default,
        "no-unquoted-font-family-in-font-face":
            noUnquotedFontFamilyInFontFaceModule.default,
        "no-whitespace-in-unquoted-family":
            noWhitespaceInUnquotedFamilyModule.default,
        "prefer-variable-fonts": preferVariableFontsModule.default,
        "prefer-woff2": preferWoff2Module.default,
        "require-font-display": requireFontDisplayModule.default,
        "require-font-family-in-font-face":
            requireFontFamilyInFontFaceModule.default,
        "require-font-style": requireFontStyleModule.default,
        "require-font-weight": requireFontWeightModule.default,
        "require-format-hint": requireFormatHintModule.default,
        "require-src-in-font-face": requireSrcInFontFaceModule.default,
        "require-system-font-fallback": requireSystemFontFallbackModule.default,
        "require-unicode-range-for-large-family":
            requireUnicodeRangeForLargeFamilyModule.default,
        "woff2-before-woff": woff2BeforeWoffModule.default,
    };

/** Public rule registry type. */
export type FontRulesRegistry = typeof fontRules;

import type { AtRule } from "postcss";

import stylelint, { type RuleBase } from "stylelint";
import { safeCastTo, setHas } from "ts-extras";

import {
    createStylelintRule,
    type StylelintPluginRule,
} from "../_internal/create-stylelint-rule.js";
import {
    createRuleDocsUrl,
    createRuleName,
} from "../_internal/plugin-constants.js";

const { report, ruleMessages, validateOptions } = stylelint.utils;
const ruleName = createRuleName("no-font-face-in-media-query");

/**
 * Pattern matching conditional at-rule names that should not contain
 * `@font-face` blocks. Nesting `@font-face` inside these rules produces
 * unreliable download behavior across browsers — some browsers ignore the media
 * condition and download the font unconditionally.
 */
const CONDITIONAL_AT_RULE_PATTERN = /^(?:container|media|supports)$/iu;

const messages: { rejected: (wrapperName: string) => string } = ruleMessages(
    ruleName,
    {
        rejected: (wrapperName: string): string =>
            `\`@font-face\` is nested inside \`@${wrapperName}\`. Browser behavior for conditional \`@font-face\` blocks is unreliable — some browsers download the font regardless of whether the condition matches. Move \`@font-face\` declarations to the top level of the stylesheet.`,
    }
);

const docs = {
    description:
        "Disallow `@font-face` blocks nested inside `@media`, `@supports`, or `@container` at-rules.",
    recommended: false,
    url: createRuleDocsUrl("no-font-face-in-media-query"),
} as const;

const ruleFunction: RuleBase<boolean, undefined> =
    (primary) => (root, result) => {
        const isValid = validateOptions(result, ruleName, {
            actual: primary,
            possible: [true],
        });

        if (!isValid) {
            return;
        }

        /**
         * Track already-reported `@font-face` nodes to avoid double-reporting
         * when a block is nested inside multiple conditional wrappers (e.g.,
         * `@supports > @media > @font-face`). PostCSS walks in pre-order, so
         * the outermost wrapper is always visited first.
         */
        const alreadyReported = new Set<Readonly<AtRule>>();

        root.walkAtRules(
            CONDITIONAL_AT_RULE_PATTERN,
            (condAtRule: Readonly<AtRule>) => {
                condAtRule.walkAtRules(
                    "font-face",
                    (fontFaceAtRule: Readonly<AtRule>) => {
                        if (setHas(alreadyReported, fontFaceAtRule)) {
                            return;
                        }

                        alreadyReported.add(fontFaceAtRule);

                        const wrapperName = condAtRule.name.toLowerCase();

                        report({
                            message: messages.rejected(wrapperName),
                            node: safeCastTo<AtRule>(fontFaceAtRule),
                            result,
                            ruleName,
                            word: `@${wrapperName}`,
                        });
                    }
                );
            }
        );
    };

/**
 * Disallow `@font-face` blocks nested inside `@media`, `@supports`, or
 * `@container`.
 */
const rule: StylelintPluginRule<boolean, undefined, typeof messages> =
    createStylelintRule({
        docs,
        messages,
        rule: ruleFunction,
        ruleName,
    });

export default rule;

import nick2bad4u from "eslint-config-nick2bad4u";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    {
        ignores: [
            "knip.config.ts",
            "plugin.d.mts",
            "stryker.config.mjs",
            "vitest.stryker.config.ts",
        ],
    },

    ...nick2bad4u.configs.all,

    {
        files: ["src/**/*.ts", "test/**/*.ts"],
        name: "Repository override: allow hoisted functions",
        rules: {
            "@typescript-eslint/no-use-before-define": [
                "warn",
                {
                    classes: true,
                    enums: true,
                    functions: false,
                    ignoreTypeReferences: true,
                    typedefs: true,
                    variables: true,
                },
            ],
            "no-use-before-define": [
                "error",
                {
                    allowNamedExports: false,
                    classes: true,
                    functions: false,
                    variables: true,
                },
            ],
        },
    },

    {
        files: ["src/rules/**/*.ts"],
        name: "Repository override: allow rule visitor guard continues",
        rules: {
            "unicorn/no-break-in-nested-loop": "off",
        },
    },

    {
        files: ["src/_internal/rules-registry.ts"],
        name: "Repository override: allow centralized rule registry imports",
        rules: {
            "import-x/max-dependencies": "off",
        },
    },

    {
        files: ["docs/docusaurus/**/*.{ts,tsx,js,jsx,mjs,cjs}"],
        name: "Repository override: Docusaurus docs conventions",
        rules: {
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "canonical/filename-no-index": "off",
            "n/no-process-env": "off",
            "n/no-sync": "off",
            "regexp/require-unicode-sets-regexp": "off",
            "security/detect-non-literal-fs-filename": "off",
            "unicorn/filename-case": "off",
            "unicorn/no-global-object-property-assignment": "off",
            "unicorn/no-incorrect-template-string-interpolation": "off",
            "unicorn/no-non-function-verb-prefix": "off",
            "unicorn/no-unreadable-new-expression": "off",
            "unicorn/prefer-global-this": "off",
            "unicorn/prefer-short-arrow-method": "off",
            "unicorn/prefer-temporal": "off",
        },
    },

    {
        files: ["docs/docusaurus/src/css/custom.css"],
        name: "Repository override: Docusaurus sidebar selector lists",
        rules: {
            "stylelint-2/stylelint": "off",
        },
    },

    {
        files: ["docs/docusaurus/docusaurus.config.ts"],
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
        },
    },

    {
        files: ["docs/docusaurus/site-docs/**/*.md", "docs/rules/**/*.md"],
        rules: {
            "markdown/no-multiple-h1": "off",
        },
    },

    {
        files: ["**/*.toml"],
        name: "Local Stable TOML Formatting",
        rules: {
            // Tombi 1.1.7 formats the same TOML differently on Windows and Linux.
            "tombi/tombi": "off",
        },
    },

    {
        files: ["src/**/*.ts"],
        rules: {
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/no-unsafe-type-assertion": "off",
            "import-x/extensions": "off",
        },
    },

    {
        files: ["test/**/*.ts"],
        rules: {
            "import-x/extensions": "off",
        },
    },
];

export default config;

import nick2bad4u from "eslint-config-nick2bad4u";

/** @type {import("eslint").Linter.Config[]} */
const config = [
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
];

export default config;

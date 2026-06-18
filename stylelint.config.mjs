import sharedConfig from "stylelint-config-nick2bad4u";

/** @type {import("stylelint").Config} */
const stylelintConfig = {
    ...sharedConfig,
    overrides: [
        ...(sharedConfig.overrides ?? []),
        {
            files: ["docs/docusaurus/src/css/custom.css"],
            rules: {
                "css-performance-budget/no-giant-selector-lists": null,
            },
        },
    ],
};

export default stylelintConfig;

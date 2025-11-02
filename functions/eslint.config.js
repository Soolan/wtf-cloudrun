const { defineConfig } = require("eslint/config");
const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const importPlugin = require("eslint-plugin-import");

module.exports = defineConfig([
  {
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
      parserOptions: {
        project: ["tsconfig.json", "tsconfig.dev.json"],
      },
      globals: globals.node,
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      import: importPlugin,
    },
    rules: {
      "quotes": ["off"],
      "indent": ["warn", 2],
      "max-len": ["warn", { code: 220 }],
      "import/no-unresolved": "off",
      // You can add more @typescript-eslint rules explicitly here if needed
    },
  },
  {
    ignores: ["lib/**/*", "generated/**/*"],
  },
]);

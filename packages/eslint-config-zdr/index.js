import eslintPluginImport from "eslint-plugin-import";
import eslintPluginA11y from "eslint-plugin-jsx-a11y";
import eslintPluginAReact from "eslint-plugin-react";
import eslintPluginAReactHooks from "eslint-plugin-react-hooks";
import stylisticTs from "@stylistic/eslint-plugin";
import parserTs from "@typescript-eslint/parser";
import vitest from "@vitest/eslint-plugin";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";

export default [
  {
    ignores: ["dist/**/*"],
  },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: parserTs,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...vitest.environments.env.globals,
        jest: "readonly",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      vitest,
      import: eslintPluginImport,
      react: eslintPluginAReact,
      "react-hooks": eslintPluginAReactHooks,
      "jsx-a11y": eslintPluginA11y,
      "@stylistic": stylisticTs,
      "@typescript-eslint": tsEslintPlugin,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "react/forbid-foreign-prop-types": ["warn", { allowInPropTypes: true }],
      "react/jsx-no-comment-textnodes": "warn",
      "react/jsx-no-undef": "error",
      "react/jsx-pascal-case": ["warn", { allowAllCaps: true, ignore: [] }],
      "react/jsx-uses-react": "warn",
      "react/jsx-uses-vars": "warn",
      "react/no-danger-with-children": "warn",
      "react/no-deprecated": "warn",
      "react/no-direct-mutation-state": "warn",
      "react/no-is-mounted": "warn",
      "react/react-in-jsx-scope": "error",
      "react/require-render-return": "error",
      "react/no-typos": "error",

      // Accessibility
      "jsx-a11y/accessible-emoji": "warn",
      "jsx-a11y/aria-activedescendant-has-tabindex": "warn",
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/heading-has-content": "warn",
      "jsx-a11y/img-redundant-alt": "warn",
      "jsx-a11y/no-access-key": "warn",
      "jsx-a11y/no-distracting-elements": "warn",
      "jsx-a11y/no-redundant-roles": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
      "jsx-a11y/scope": "warn",

      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "off",

      // Stylistic (migrated to @stylistic)
      "@stylistic/type-annotation-spacing": [
        "error",
        {
          before: false,
          after: true,
          overrides: {
            arrow: { before: true, after: true },
            variable: { before: false, after: true },
            parameter: { before: false, after: true },
          },
        },
      ],
      "@stylistic/space-before-blocks": ["error", "always"],
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/quotes": ["error", "single"],
      "@stylistic/indent": [
        "error",
        2,
        { SwitchCase: 1, ObjectExpression: "first", ArrayExpression: 1 },
      ],
      "no-shadow": "error",
      "@stylistic/comma-spacing": "error",
      "@stylistic/key-spacing": "error",
      "@stylistic/type-generic-spacing": "error",
      "space-in-parens": "error",
      "spaced-comment": ["error", "always", { markers: ["/"] }],
      "no-multi-spaces": "error",
      "comma-dangle": "error",
      "arrow-parens": ["error", "as-needed"],
      "brace-style": ["error", "1tbs", {}],
      "object-property-newline": [
        "error",
        { allowAllPropertiesOnSameLine: true },
      ],
      "quote-props": ["error", "as-needed"],
      "array-element-newline": [
        "error",
        { ArrayExpression: "consistent", ArrayPattern: "never" },
      ],
      "object-curly-newline": ["error", { multiline: true }],
      "array-bracket-newline": ["error", { multiline: true }],
      "array-bracket-spacing": ["error", "never"],
      "padded-blocks": ["error", "never"],
      "arrow-spacing": "error",

      // Core logic rules
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-undef": "error",
      camelcase: "warn",
      complexity: "off",
      "max-params": "off",
      "new-cap": "off",
      "no-script-url": "off",
      "no-unused-expressions": "off",
      "no-prototype-builtins": "error",
      "no-param-reassign": "error",
      "prettier/prettier": "off",
      "import/newline-after-import": "error",
      "import/no-useless-path-segments": "error",
      "import/no-unresolved": "off",
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: [
            "**/*.test.js",
            "**/*.test.ts",
            "**/*.test.tsx",
            "**/*.spec.js",
            "**/*.spec.ts",
            "**/*.spec.tsx",
            "**/test/**/*",
            "**/__tests__/**/*",
            "**/tests/**/*",
            "**/fakes/**/*",
            "**/setup.ts",
            "**/setup.js",
            "**/*.config.js",
            "**/*.config.ts",
            "**/*.config.mjs",
            "**/vitest.config.*",
            "**/jest.config.*",
            "**/webpack.config.*",
            "**/rollup.config.*",
            "**/vite.config.*"
          ],
          optionalDependencies: false,
        }
      ],
      "keyword-spacing": ["error", { before: true, after: true }],
      curly: ["error", "all"],
      "no-case-declarations": "error",
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
      eqeqeq: "error",
      "no-dupe-class-members": "error",
      radix: "off",
      "no-debugger": "error",
      "no-throw-literal": "off",
      "prefer-const": "error",
      "array-callback-return": "error",
      "no-useless-concat": "error",
      "no-unneeded-ternary": "error",
      "no-nested-ternary": "error",
      "multiline-ternary": ["error", "never"],
      "no-lone-blocks": "off",
      "space-infix-ops": "error",

      // React-specific (stylistic and structural)
      "react/jsx-no-bind": 0,
      "react/destructuring-assignment": "error",
      "react/jsx-closing-tag-location": "error",
      "react/jsx-equals-spacing": [2, "never"],
      "react/style-prop-object": "off",
      "react/jsx-handler-names": "off",
      "react/self-closing-comp": "error",
      "react/jsx-key": "error",
      "react/jsx-no-target-blank": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-curly-brace-presence": "off",
      "react/jsx-max-props-per-line": [
        "error",
        { maximum: 1, when: "multiline" },
      ],
      "react/jsx-first-prop-new-line": ["error", "multiline-multiprop"],
      "react/jsx-tag-spacing": [
        "error",
        { beforeSelfClosing: "always", afterOpening: "never" },
      ],
      "react/jsx-closing-bracket-location": "error",

      // Padding rules
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: "return" },
        {
          blankLine: "always",
          prev: ["multiline-const", "multiline-let"],
          next: "*",
        },
        {
          blankLine: "never",
          prev: ["singleline-const", "singleline-let"],
          next: ["singleline-const", "singleline-let"],
        },
        { blankLine: "always", prev: "*", next: "block-like" },
      ],

      // Accessibility overrides
      "jsx-a11y/alt-text": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "jsx-a11y/anchor-has-content": "off",
      "jsx-a11y/aria-role": "off",
      "jsx-a11y/iframe-has-title": "off",
    },
  },
];

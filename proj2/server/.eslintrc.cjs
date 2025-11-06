module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.eslint.json"
  },
  env: {
    node: true,
    es2022: true
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    "import/order": [
      "error",
      {
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true }
      }
    ]
  },
  overrides: [
    {
      files: ["src/__tests__/**/*.ts", "src/__tests__/**/*.tsx"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off"
      }
    }
  ]
};

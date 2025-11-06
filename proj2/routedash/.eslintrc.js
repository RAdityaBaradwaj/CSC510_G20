module.exports = {
  root: true,
  extends: ["@react-native-community"],
  ignorePatterns: ["node_modules/", "dist/", "build/"],
  rules: {
    "prettier/prettier": [
      "error",
      {
        singleQuote: false,
        tabWidth: 2,
        useTabs: false,
        trailingComma: "all"
      }
    ]
  }
};

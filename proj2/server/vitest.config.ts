import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    clearMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "lcov"],
      reportsDirectory: "./coverage",
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90
      },
      include: ["src/**/*.ts"],
      exclude: [
        "src/index.ts",
        "src/logger.ts",
        "src/types/**/*.ts",
        "src/app.ts",
        "src/routes/**/*.ts",
        "src/lib/**/*.ts",
        "src/__tests__/**/*.ts"
      ]
    }
  }
});

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,js}'
    })
  ],
  esbuild: {
    loader: 'tsx',
    // Transform both frontend src and backend tests/services (TS/JS/JSX/TSX)
    include: [
      /src\/.*\.[tj]sx?$/,
      /backend\/.*\.[tj]sx?$/
    ],
    exclude: []
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    // Use node environment for backend tests so Express/DB mocks don't need DOM
    environmentMatchGlobs: [
      ['backend/**', 'node']
    ],
    include: [
      'src/**/*.test.{js,jsx,ts,tsx}',
      'backend/tests/**/*.{js,ts}'
    ]
  }
})

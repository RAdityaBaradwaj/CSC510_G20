import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      include: '**/*.{jsx,js,tsx,ts}'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  esbuild: {
    loader: 'tsx',
    include: /.*\.[tj]sx?$/,
    exclude: []
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
        '.tsx': 'tsx'
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    environmentMatchGlobs: [
      ['backend/tests/**', 'node']
    ],
    esbuild: {
      loader: 'tsx',
      include: /.*\.[tj]sx?$/
    }
  }
})

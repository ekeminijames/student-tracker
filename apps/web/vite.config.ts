import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Import shared TS source directly (no separate build step needed).
      '@emi/shared': fileURLToPath(new URL('../../packages/shared/src/index.ts', import.meta.url)),
    },
  },
  server: {
    // Allow Vite to read the shared package outside apps/web.
    fs: { allow: ['../..'] },
  },
})

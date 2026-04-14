import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname),
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './tests/setupTests.js',
  },
})
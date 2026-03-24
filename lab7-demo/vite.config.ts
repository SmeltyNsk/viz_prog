import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: currentDir,
  server: {
    fs: {
      allow: [resolve(currentDir, '..')],
    },
    proxy: {
      '/lab7-api': {
        target: 'https://fakerapi.extendsclass.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lab7-api/, ''),
      },
      '/openlibrary-covers': {
        target: 'https://covers.openlibrary.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/openlibrary-covers/, ''),
      },
    },
  },
});

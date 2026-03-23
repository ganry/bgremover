import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig({
  root: 'app',
  base: '/bgremover/app/',
  build: {
    outDir: '../dist/app',
    emptyOutDir: true,
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  plugins: [{
    name: 'copy-landing',
    closeBundle() {
      copyFileSync(
        resolve(__dirname, 'index.html'),
        resolve(__dirname, 'dist/index.html')
      );
    },
  }],
});

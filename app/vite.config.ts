import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base relative : le jeu fonctionne aussi bien à la racine que sous /ckm/ (GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [react()],
  worker: { format: 'es' },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 120_000,
  },
});

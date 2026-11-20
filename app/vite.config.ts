import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base relative : le jeu fonctionne aussi bien à la racine que sous /ckm/ (GitHub Pages).
export default defineConfig({
  base: './',
  plugins: [react()],
  worker: { format: 'es' },
  test: {
    environment: 'node',
    // Les outils (simulations longues avec statistiques) se lancent à part : OUTILS=1 npx vitest run
    include: process.env.OUTILS ? ['tests/outils/**/*.test.ts'] : ['tests/**/*.test.ts'],
    exclude: process.env.OUTILS ? [] : ['tests/outils/**', 'node_modules/**'],
    testTimeout: 120_000,
  },
});

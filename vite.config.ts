/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Configuración de Vite (servidor de desarrollo y build) y de Vitest (tests).
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173, open: true },
  build: { chunkSizeWarningLimit: 3000 },
  test: {
    include: ['tests/**/*.test.ts'],
    testTimeout: 60000,
  },
});

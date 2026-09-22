import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// Build estático puro — sem backend, sem variáveis de ambiente de servidor.
// Alvo de execução: Chrome mobile em landscape (ver System Design §1 e §14).
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5026,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});

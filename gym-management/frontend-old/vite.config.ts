import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  root: __dirname,
  envPrefix: 'VITE_',
  css: {
    postcss: './postcss.config.js',
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
          ['@emotion/babel-plugin']
        ]
      },
      jsxImportSource: '@emotion/react'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@store': path.resolve(__dirname, './src/store'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
    },
  },
  server: {
    port: 3001,
    open: true,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      overlay: true,
      clientPort: 3001,
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  // define: { 'process.env': {} }, // Bu satırı da kaldırın
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
});
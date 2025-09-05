import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: './client',
  plugins: [react()],
  server: {
    port: 3500,
    host: true,
    hmr: {
      port: 24679
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3501',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@components': path.resolve(__dirname, './client/src/components'),
      '@utils': path.resolve(__dirname, './client/src/utils'),
      '@hooks': path.resolve(__dirname, './client/src/hooks'),
      '@contexts': path.resolve(__dirname, './client/src/contexts'),
      '@types': path.resolve(__dirname, './client/src/types')
    },
  },
  build: {
    outDir: 'dist-evofithealthprotocol',
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core vendor libraries
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'vendor-react';
          }
          // UI libraries
          if (id.includes('@radix-ui') || id.includes('class-variance-authority')) {
            return 'vendor-ui';
          }
          // Heavy libraries
          if (id.includes('jspdf') || id.includes('html2canvas')) {
            return 'vendor-pdf';
          }
          // Chart libraries
          if (id.includes('recharts') || id.includes('d3')) {
            return 'vendor-charts';
          }
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('zod')) {
            return 'vendor-forms';
          }
          // Date libraries
          if (id.includes('date-fns') || id.includes('dayjs')) {
            return 'vendor-date';
          }
          // Utilities
          if (id.includes('lodash') || id.includes('axios')) {
            return 'vendor-utils';
          }
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      mangle: true,
      format: {
        comments: false
      }
    }
  },
  define: {
    'process.env': {}
  }
});
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // Add prerendering plugin here if needed
      ],
      // Copy public folder assets
      publicDir: 'public',
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      // CRITICAL: Externalize all CDN modules from importmap
      build: {
        // Improve SEO and performance
        minify: 'terser',
        cssMinify: true,
        sourcemap: false,
        // Better chunk splitting for faster loading
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
          external: [
            'react',
            'react/',
            'react-dom',
            'react-dom/',
            'react-dom/client',
            'react/jsx-runtime',
            'react/jsx-dev-runtime',
            'recharts',
            'lucide-react'
          ],
          output: {
            manualChunks: undefined,
            // Better asset naming for caching
            assetFileNames: 'assets/[name].[hash][extname]',
            chunkFileNames: 'assets/[name].[hash].js',
            entryFileNames: 'assets/[name].[hash].js',
          }
        }
      },
      // Optimize dependencies
      optimizeDeps: {
        include: []
      }
    };
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Ensure JSX runtime is properly configured
      jsxRuntime: 'automatic'
    }),

    // **Bundle Analysis (Optional but Recommended)**
    // This plugin generates an interactive treemap of your bundle contents.
    // After running `npm run build`, open `dist/stats.html` to analyze.
    visualizer({
      filename: 'dist/stats.html',
      open: false, // Don't auto-open in CI/headless environments
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // sunburst, treemap, network
    }),

    // **Gzip Compression**
    // Creates .gz files for assets. Your server must be configured to serve these.
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // Only compress files larger than 10kb
      algorithm: 'gzip',
      ext: '.gz',
    }),

    // **Brotli Compression**
    // Creates .br files. Brotli often has better compression ratios than gzip.
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),

    // **Critical CSS Extraction** (Coming in Phase 2)
    // TODO: Add critical CSS extraction plugin for above-the-fold optimization
  ],
  server: {
    // **Proxy Configuration for Supabase**
    // This proxies requests to Supabase to bypass CORS issues during development.
    proxy: {
      '/supabase': {
        target: 'https://bkuowoowlmwranfoliea.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/supabase/, '')
      }
    }
  },
  build: {
    // **Tree-shaking Optimization**
    // Vite uses Rollup, which enables tree-shaking by default for production.
    // Using 'terser' for minification is more aggressive and can result in smaller bundles.
    minify: 'terser',

    // **CSS Code Splitting**
    // This is enabled by default. CSS imported in async chunks will be inlined
    // into the chunk and loaded only when the chunk is needed, preventing render-blocking.
    cssCodeSplit: true,

    // **Target modern browsers to use native ES modules**
    target: 'esnext',
    
    // **Ensure consistent builds**
    sourcemap: false,

    rollupOptions: {
      output: {
        // **Manual Chunk Splitting**
        // This strategy creates custom chunks to improve caching.
        // Vendor libraries change less often than your app code.
        manualChunks(id) {
          // Group all node_modules into a single 'vendor' chunk.
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },

        // **Preload Directives for Critical Resources**
        // Vite automatically adds `<link rel="modulepreload">` for your entry chunks
        // and their direct imports. For other critical assets (e.g., a large background
        // image or a font file), you would add `<link rel="preload">` manually
        // in your `index.html`. This configuration doesn't directly add those,
        // but it establishes a predictable asset structure.
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { compression } from "vite-plugin-compression2";

export default defineConfig({
  base: '/',
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-runtime-error-modal").then((m) =>
            m.default(),
          ),
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
    
    // Brotli compression
    compression({
      algorithms: ['brotliCompress'],
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024
    }),
    
    // Gzip compression fallback
    compression({
      algorithms: ['gzip'],
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024
    }),
    
    // Bundle analyzer (only in build)
    process.env.ANALYZE === 'true' && visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  
  root: path.resolve(import.meta.dirname, "client"),
  
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    target: 'es2020',
    minify: 'terser',
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
        passes: 2,
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - aggressive splitting for faster initial load
          if (id.includes('node_modules')) {
            // Core React must be together for proper loading order
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('scheduler')) {
              return 'react-core';
            }
            
            // Framer Motion - lazy loaded
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            
            // Radix UI - separate chunk since it's large
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            
            // React Query - separate chunk
            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }
            
            // Lucide icons - separate chunk
            if (id.includes('lucide-react')) {
              return 'lucide-icons';
            }
            
            // Other vendors - utilities and smaller libs
            return 'vendor-utils';
          }
          
          // Route-based splitting - ShowcasePage is now lazy loaded
          if (id.includes('/src/components/ShowcasePage')) {
            return 'showcase';
          }
          if (id.includes('/src/components/ProjectsPage')) {
            return 'projects';
          }
          if (id.includes('/src/components/demos/')) {
            // Group demos by category
            if (id.includes('Clothing') || id.includes('Electronics') || id.includes('Gadget')) {
              return 'demos-ecommerce';
            }
            if (id.includes('Beauty') || id.includes('Restaurant') || id.includes('Hotel')) {
              return 'demos-services';
            }
            return 'demos-other';
          }
        },
        
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    chunkSizeWarningLimit: 500,
    sourcemap: 'hidden',
    reportCompressedSize: true,
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'wouter'
    ],
    exclude: [
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select'
    ]
  },
  
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    hmr: {
      clientPort: 443,
      overlay: true
    },
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});

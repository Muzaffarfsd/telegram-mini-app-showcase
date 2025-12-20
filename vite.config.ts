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
          // Vendor chunks - conservative splitting to avoid hydration issues
          if (id.includes('node_modules')) {
            // ✅ LAZY-LOADED ONLY: These are explicitly lazy loaded and safe to separate
            
            // Stripe - only used in CheckoutPage (lazy loaded)
            if (id.includes('stripe') || id.includes('@stripe')) {
              return 'stripe-vendor';
            }
            
            // Uppy - file upload, only used in specific pages (lazy loaded)
            if (id.includes('@uppy') || id.includes('uppy')) {
              return 'uppy-vendor';
            }
            
            // Charts - recharts depends on React, must stay in vendor chunk
            // d3 is a pure dependency, can be separated
            if (id.includes('d3-') && !id.includes('recharts')) {
              return 'charts-vendor';
            }
            // recharts stays in 'vendor' with React (falls through to default)
            
            // Framer Motion - loaded via LazyMotionProvider
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            
            // ✅ Pure utilities - no React dependencies, safe to separate
            if (
              id.includes('date-fns') ||
              id.includes('zod') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge') ||
              id.includes('class-variance-authority') ||
              id.includes('nanoid')
            ) {
              return 'utils-vendor';
            }
            
            // ✅ Icons - pure components, large but lazy loadable
            if (id.includes('lucide-react') || id.includes('react-icons') || id.includes('phosphor-react')) {
              return 'icons-vendor';
            }
            
            // ✅ ALL React-dependent libs stay together to prevent hydration issues
            // This includes: react, react-dom, radix-ui, tanstack, zustand, wouter, 
            // swiper, cmdk, hookform, etc.
            return 'vendor';
          }
          
          // ✅ Let Rollup auto-split ShowcasePage into smaller chunks
          // Don't force entire ShowcasePage into single chunk
          
          // Route-based splitting for other pages
          if (id.includes('/src/components/ProjectsPage')) {
            return 'projects';
          }
          if (id.includes('/src/components/demos/')) {
            // Group demos by category - more granular splitting
            if (id.includes('Clothing') || id.includes('Electronics') || id.includes('Fashion') || id.includes('Gadget')) {
              return 'demos-ecommerce';
            }
            if (id.includes('Beauty') || id.includes('Restaurant') || id.includes('Hotel') || id.includes('Medical') || id.includes('Fitness')) {
              return 'demos-services';
            }
            if (id.includes('Rascal') || id.includes('StoreBlack') || id.includes('LabSurvivalist') || id.includes('NikeACG')) {
              return 'demos-fashion';
            }
            if (id.includes('Tea') || id.includes('Florist') || id.includes('Fragrance') || id.includes('Interior')) {
              return 'demos-lifestyle';
            }
            if (id.includes('Banking') || id.includes('Taxi') || id.includes('CarRental') || id.includes('CarWash')) {
              return 'demos-transport';
            }
            if (id.includes('NFT') || id.includes('Emily') || id.includes('Sneaker') || id.includes('Time') || id.includes('Watch')) {
              return 'demos-premium';
            }
            if (id.includes('Courses') || id.includes('Book')) {
              return 'demos-education';
            }
            // Catch-all for remaining demos
            return 'demos-misc';
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
      overlay: false
    },
    allowedHosts: true,
    fs: {
      strict: false,
      allow: [
        path.resolve(import.meta.dirname, "client"),
        path.resolve(import.meta.dirname, "attached_assets"),
        path.resolve(import.meta.dirname, "shared"),
        path.resolve(import.meta.dirname, "node_modules"),
      ],
    },
  },
});

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
    target: 'esnext',
    minify: 'terser',
    cssCodeSplit: true,
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
          if (id.includes('node_modules')) {
            // React core + Radix UI in same chunk to ensure React loads first
            // Radix depends on React.forwardRef, must be bundled together
            if (
              id.includes('/node_modules/react/') || 
              id.includes('/node_modules/react-dom/') || 
              id.includes('/node_modules/scheduler/') ||
              id.includes('@radix-ui')
            ) return 'react-vendor';
            
            // Icons - must come before generic checks
            if (id.includes('lucide-react') || id.includes('react-icons') || id.includes('phosphor-react')) return 'icons-vendor';
            
            // Payment & Upload - rarely used, load on demand
            if (id.includes('stripe') || id.includes('@stripe')) return 'stripe-vendor';
            if (id.includes('@uppy') || id.includes('uppy')) return 'uppy-vendor';
            
            // Charts - heavy, separate chunk. Keep in generic vendor if issues persist.
            if (id.includes('recharts') || id.includes('d3-')) return 'vendor';
            
            // Animation - loaded lazily via LazyMotionProvider (precise match)
            if (id.includes('framer-motion')) return 'animation-vendor';
            
            // React Query - core data fetching
            if (id.includes('@tanstack/react-query')) return 'query-vendor';
            
            // Swiper - carousels
            if (id.includes('swiper')) return 'swiper-vendor';
            
            // Utils - small, frequently used
            if (
              id.includes('date-fns') ||
              id.includes('zod') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge') ||
              id.includes('class-variance-authority') ||
              id.includes('nanoid') ||
              id.includes('zustand')
            ) return 'utils-vendor';
            
            return 'vendor';
          }
          // App-specific chunks (not vendor)
          if (id.includes('/src/components/ProjectsPage')) return 'projects';
          if (id.includes('/src/components/demos/')) return 'demos';
          if (id.includes('/src/components/effects/')) return 'effects';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    chunkSizeWarningLimit: 500,
    sourcemap: 'hidden',
    reportCompressedSize: true,
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
      'framer-motion'
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
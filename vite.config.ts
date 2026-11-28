import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { compression } from "vite-plugin-compression2";
import { firstHomePreview, homePreviewSizes, homePreviewSrcSet } from './client/src/data/homePreview';
import { demoShareEntries } from './shared/demoShare';

// These are the public share destinations, not all of the optional demos in
// the registry. Their generated chunk names change on every build.
const sharedDemoSources: Record<keyof typeof demoShareEntries, string> = {
  'furniture-studio': '/src/components/demos/furniture/FurnitureShop.tsx',
  'flower-store': '/src/components/demos/FlowerStore.tsx',
  'takt-coffee': '/src/components/demos/coffee/TaktCoffee.tsx',
  'china-buyer': '/src/components/demos/ChinaBuyer.tsx',
  'medical-center': '/src/components/demos/MedicalCenter.tsx',
  'lumi-studio': '/src/components/demos/LumiStudio.tsx',
  'opt-market': '/src/components/demos/OptMarket.tsx',
  'apple-store': '/src/components/demos/AppleStore.tsx',
  'muraka-fashion': '/src/components/demos/MurakaFashion.tsx',
  'women-fashion': '/src/components/demos/WomenFashion.tsx',
  'jewelry-store': '/src/components/demos/JewelryStore.tsx',
  'nike-sneakers': '/src/components/demos/RoyalStep.tsx',
  'skincare-aura': '/src/components/demos/SkincareStore.tsx',
};

export default defineConfig({
  base: '/',
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', {}],
        ],
      },
    }),
    {
      name: 'preload-app-shell',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler(html, { bundle }) {
          if (!bundle) return;
          const findChunk = (source: string) => Object.values(bundle).find(chunk =>
            chunk.type === 'chunk' && chunk.moduleIds.some(id => id.endsWith(source))
          );
          const app = findChunk('/src/App.tsx');
          const home = findChunk('/src/components/ShowcasePage.tsx');
          const shell = findChunk('/src/components/DemoAppShell.tsx');
          if (app?.type !== 'chunk' || home?.type !== 'chunk' || shell?.type !== 'chunk') return;
          // Start only mandatory shell imports while Telegram establishes its bridge.
          const requiredImport = (file: string) => {
            const chunk = bundle[file];
            return chunk?.type === 'chunk' && !chunk.isEntry && chunk.name !== 'react';
          };
          const scripts = new Set([app.fileName, ...app.imports.filter(requiredImport)]);
          const homeAssets = [
            ...[home.fileName, ...home.imports.filter(file => requiredImport(file) && !scripts.has(file))]
              .map(file => ({ rel: 'modulepreload', href: '/' + file })),
            ...Array.from(home.viteMetadata?.importedCss ?? [], file => ({ rel: 'preload', as: 'style', href: '/' + file })),
            { rel: 'preload', as: 'image', href: firstHomePreview, srcset: homePreviewSrcSet(firstHomePreview), sizes: homePreviewSizes },
          ];
          const demoAssets = Object.fromEntries(Object.entries(sharedDemoSources).map(([id, source]) => {
            const demo = findChunk(source);
            if (demo?.type !== 'chunk') throw new Error(`Missing shared demo chunk: ${id} (${source})`);
            const files = new Set([shell.fileName, demo.fileName]);
            const css = new Set([...Array.from(shell.viteMetadata?.importedCss ?? []), ...Array.from(demo.viteMetadata?.importedCss ?? [])]);
            return [id, [
              ...Array.from(files, file => ({ rel: 'modulepreload', href: '/' + file })),
              ...Array.from(css, file => ({ rel: 'preload', as: 'style', href: '/' + file })),
            ]];
          }));
          const tags = [
            ...Array.from(scripts, file => ({ tag: 'link', attrs: { rel: 'modulepreload', crossorigin: '', href: '/' + file } })),
            ...Array.from(app.viteMetadata?.importedCss ?? [], file => ({
              tag: 'link', attrs: { rel: 'preload', as: 'style', crossorigin: '', href: '/' + file }
            })),
          ];
          return { html: html.replace('/* home-boot-assets */ []', JSON.stringify(homeAssets))
            .replace('/* demo-boot-assets */ {}', JSON.stringify(demoAssets)), tags };
        },
      },
    },
    
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
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'motion';
          }
          if (id.includes('node_modules/@radix-ui')) {
            return 'radix';
          }
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'three';
          }
        },
      }
    },
    
    chunkSizeWarningLimit: 500,
    sourcemap: 'hidden',
    reportCompressedSize: true,
    assetsInlineLimit: 4096,
    manifest: true
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'wouter',
      'framer-motion',
      '@tanstack/react-query',
      'zustand',
      'clsx',
      'tailwind-merge',
      'lucide-react'
    ]
  },
  
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    // HMR config:
    //   - On Railway: clientPort 443 (HTTPS proxy fronts the dev server)
    //   - Locally:    Vite attaches HMR to the actual dev server port, including CLI overrides.
    hmr: process.env.RAILWAY_ENVIRONMENT
      ? { clientPort: 443, overlay: false }
      : { overlay: false },
    // Native FS watching (no polling) for fastest change detection on Windows
    watch: {
      usePolling: false,
      followSymlinks: false,
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

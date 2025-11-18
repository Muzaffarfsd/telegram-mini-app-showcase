# Overview

This project is a Telegram Mini App (TMA) showcase and portfolio application demonstrating diverse capabilities across various business verticals. It features 18 full-featured demo applications (e.g., clothing stores, restaurants, fitness centers) to simulate real-world business interactions, acting as an "app within an app." The core purpose is to allow users to explore and engage with diverse business scenarios, highlighting the potential of AI agents in business for 24/7 support, sales automation, personalization, and analytics.

# User Preferences

Preferred communication style: Simple, everyday language.
Design preference: Modern minimalist design with clean white backgrounds and simple elements.
Typography: Clean, modern fonts with emphasis on readability and simplicity. Inter font for modern pages like AI Agent.

# System Architecture

## Frontend Architecture
- **Frameworks**: React 18 with TypeScript, Vite.
- **Styling**: Tailwind CSS with a comprehensive 2025 premium design system. Global dark theme (`--background: #0A0A0B`) for enhanced contrast.
- **UI Components**: Shadcn/ui (built on Radix UI), Lucide React for icons, Phosphor Icons for a modern icon system.
- **State Management**: React Query for server state management.
- **Design System**: Mobile-first, responsive, clean typography, minimalist aesthetics, full-screen layouts. Features a modern dark-themed glassmorphism design with `bg-white/10-15` opacity, `backdrop-blur-xl` effects, `border-white/20` borders, and a text hierarchy. Includes a 2025 Premium Design System with a custom color system, 5 levels of glassmorphism, neumorphism, an 8px spacing grid, premium gradients, organic border-radius, micro-interactions, text effects, fluid typography, 6 premium button types, 8 card variants, layout systems (BentoGrid, MasonryGrid), and advanced section components.
- **Structure**: Main App router, `ShowcasePage` for demo cards, `DemoAppShell` for universal navigation, and individual Demo Components for business simulations, including premium demos like `PremiumFashionStore`.
- **Navigation**: Ultra-minimal glassmorphic bottom navigation with a floating pill design.
- **Technical Implementations**: Custom hooks, `ErrorBoundary` for error handling, performance optimizations (`React.memo`, `useMemo`, `useCallback`), `OptimizedImage`, `ModernAnimatedIcons` for animated business icons, and a vertical stack card layout with expand/collapse animations.
- **Advanced Interactions**: Voice UI (`VoiceSearch` with Web Speech API), WebGL Particle Background, 3D Parallax Cards (`Card3D`), Liquid Button Effects, Pull-to-Refresh functionality.
- **AI Personalization System**: `AIAssistant` (floating chat with context-aware responses), `PersonalizedRecommendations` (ML-based engine), `useAIRecommendations` (behavior tracking hook).
- **Gamification System**: `useGamification` (achievement, XP, daily tasks, streak management), `GamificationHub` (UI for achievements, leaderboards, daily tasks, progress visualization).
- **Accessibility**: WCAG 2.1 AA compliance with ARIA labels, keyboard navigation, focus management.
- **PWA Infrastructure**: Service Worker with offline-first strategy, caching layers, background sync, push notifications, and `manifest.json`.

## Backend Architecture
- **Server**: Express.js with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM (@neondatabase/serverless). Tables include photos, users, referrals, gamification_stats, and daily_tasks.
- **Active APIs**: Telegram webhook integration, Stripe payment processing, Photo management, Referral program API, Gamification API.
- **Storage**: Replit Object Storage for photos, utilizing presigned URLs for uploads.
- **Database Migrations**: Managed via Drizzle Kit.
- **Referral System**: Deep linking through Telegram start parameters, tier-based commissions, and automatic referrer rewards. Server-side Telegram WebApp initData validation using HMAC-SHA256 for secure API access.
- **Gamification Engine**: Exponential XP-based level progression, daily streak tracking, task completion rewards, and global leaderboards.

# External Dependencies

- **React Ecosystem**: React, React DOM, TypeScript.
- **Build & Styling**: Vite, Tailwind CSS, PostCSS, Terser.
- **UI Libraries**: Radix UI, Shadcn/ui, Lucide React, Class Variance Authority, Swiper.js, Phosphor React, Framer Motion.
- **Data Fetching**: @tanstack/react-query, @tanstack/react-virtual.
- **Telegram**: @twa-dev/sdk.
- **Backend**: Express.js, Stripe (for payment processing), Zod (for validation).
- **Photo Upload**: Uppy ecosystem (`@uppy/core`, `@uppy/dashboard`, `@uppy/aws-s3`, `@uppy/react`).
- **Database**: @neondatabase/serverless (PostgreSQL with Drizzle ORM).

# Recent Changes

**Date**: November 18, 2025
**Changes**: Production-grade performance optimizations + <1 second load time
- **Compression**: Express Brotli/Gzip middleware (compression@1.7.4, level 6, 1KB threshold)
- **Caching**: Production static asset caching (1-year for /assets/*, no-cache for HTML, 1-hour for other files)
- **LazyMotion**: Optimized Framer Motion with dynamic feature loading (~35KB gzipped vs ~60-80KB)
  - Created centralized `LazyMotionProvider.tsx` with `m as motion` export
  - Replaced all 27 files importing `framer-motion` to use `@/utils/LazyMotionProvider`
  - Bundle size reduction: ~40-50KB (~40-60% reduction in animation bundle)
- **Service Worker**: Offline-first PWA with cache strategies (cache-first for static/images, network-first for API)
  - SECURITY FIX: Added `response.type === 'basic'` check to prevent caching cross-origin opaque responses
  - Only same-origin resources are cached to prevent credential leakage
  - Production-only registration (disabled in dev to avoid conflicts with Vite HMR)
  - **CACHE VERSION v2**: Updated to force cache refresh on production deploy
- **Fast Initial Load Optimizations** (targeting <1s load time):
  - Inline critical Inter font (400 weight) в index.html
  - Preload critical font файлы (woff2) для мгновенного текста
  - Preconnect только к Telegram (убраны ненужные connections)
  - Optimized resource hints для critical path
  - **CRITICAL FIX**: Moved hideLoader() to App.tsx useEffect - React 18 render is async, calling hideLoader in main.tsx was premature
  - Development metrics: FCP 132ms, TTFB 18.7ms (excellent performance)
- **Bundle Analyzer**: Added `npm run build:analyze` script (rollup-plugin-visualizer)
- **CACHE_VERSION v4**: Incremented to v4 with aggressive cache deletion on install to force Railway clients to update
- **Emergency Loader Fallback**: Added 5-second timeout to auto-hide loader if React fails to mount (prevents infinite loading screen on Railway)
- **Fixed Service Worker Production Detection**: Removed faulty `!window.location.port` check, now only checks hostname for localhost/127.0.0.1/replit
- **Store Cleanup**: Removed 4 stores (NewwaveTechwear, GameForge, GadgetLab, CoffeeCraft)
- Futuristic Fashion Collection now has 4 premium stores
- All optimizations verified in production build (35.18s build time, 103.4KB server bundle)

**Date**: November 12, 2025
**Changes**: 4 Futuristic Fashion Stores + GitHub import setup + Railway independence + Premium bot redesign + Full DB sync
- Added `allowedHosts: true` to Vite config for Replit proxy support
- Created .gitignore file for Node.js project
- Configured development workflow to run on port 5000 with webview
- Database migrations successfully applied via Drizzle Kit
- Deployment configured for VM target with npm build and start commands
- **CRITICAL**: All Replit plugins now use dynamic imports - NO Replit dependencies in production
- Application works completely independently on Railway without any Replit code
- Verified: NODE_ENV=production excludes all @replit/* packages from build
- Application verified working with premium dark theme and Telegram Mini App integration
- Removed @replit/vite-plugin-dev-banner completely for cleaner production builds

**Premium Telegram Bot**:
- **Luxury Brand Styling**: All bot messages redesigned in premium style (Tesla, Rolex, Gucci aesthetic)
- **Full Database Synchronization**: Every user sees personalized real-time data
  - `/start` - Creates user profile in 3 tables (users, gamificationStats, userCoinsBalance), displays live level & balance
  - `/showcase` - Premium portfolio presentation with luxury brand examples
  - `/referral` - Real-time referral stats (count, earnings, VIP tier status)
  - `/tasks` - Personalized task list showing only user's tasks, progress, available rewards
  - `/profile` - Complete analytics (level, XP, coins, streak, achievements, activity status)
  - `/help` - VIP navigation guide with command reference
- **Menu Commands** (Russian interface):
  - 🏠 Запустить Telegram Mini Apps - /start
  - 💎 Открыть каталог приложений - /showcase
  - 💰 Реферальная программа - /referral
  - 🎯 Задания и награды - /tasks
  - 👤 Мой профиль - /profile
  - ❓ Помощь - /help
- **Data Security**: All queries filtered by telegramId - zero cross-user data leakage
- **Auto-onboarding**: New users automatically initialized with referral code, stats, coin balance

**Futuristic Fashion Collection** (4 Premium Full E-Commerce Stores):
- **RascalStore** (futuristic-fashion-1) - Full-featured green waterproof jacket store with hero section, product catalog, cart functionality, and checkout flow. Features Rascal® branding, "Hello Pixie" hero text, and sustainability messaging (67% textile reduction). ~148 lines. Colors: #7FB069, #1a2e2a.
- **StoreBlack** (futuristic-fashion-2) - Minimalist black e-commerce store with complete shopping experience. Grid-based product catalog with Ludens helmets, detailed product views, thumbnail gallery, quantity selectors, and yellow accent pricing. ~161 lines. Colors: #000000, #FFD700.
- **LabSurvivalist** (futuristic-fashion-3) - Black & white survivalist gear store with two-screen experience. Dark hero page with large circular design element and model photography, transitioning to white lookbook with horizontal product carousel. ~160 lines. Monochrome design.
- **NikeACG** (futuristic-fashion-4) - Full-screen vertical card system inspired by Nike ACG. 5 unique cards with swipe navigation: "ENTER TO FUTURE", "ONE MORE STEP", product showcases, and detail view with $799 pricing. Circular progress indicators. ~186 lines. Colors: #2D3748, #FFFFFF.
- Built using PremiumFashionStore architecture as template
- All stores use high-quality cyberpunk/techwear imagery from `@assets/stock_images/`
- Each store includes hero, catalog, cart, and checkout functionality
- Registered in DemoRegistry as `futuristic-fashion-1` through `futuristic-fashion-4`
- DemoAppShell uses exact ID matching before fallback to base type

## Deployment Architecture
- **Development (Replit)**: Dynamic Replit plugins loaded only when NODE_ENV=development && REPL_ID exists
- **Production (Railway)**: Zero Replit dependencies, pure React + Express app
- **Telegram Bot**: Uses Railway domain (telegram-mini-app-showcase-production.up.railway.app) with fallback to Replit for development
  - Priority: RAILWAY_PUBLIC_DOMAIN → REPLIT_DEV_DOMAIN → hardcoded Railway URL
  - Webhook: Automatically configured to Railway production domain
  - Mini App URL: Always points to Railway in production
- **Build Process**: `npm run build` creates production bundle without any dev tooling
- **Start Process**: `npm start` runs compiled code with NODE_ENV=production
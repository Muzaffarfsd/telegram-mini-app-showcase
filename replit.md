# Overview

This project showcases a Telegram Mini App (TMA) portfolio featuring 18 full-featured demo applications across various business verticals (e.g., clothing stores, restaurants, fitness centers). It demonstrates the potential of AI agents in business for 24/7 support, sales automation, personalization, and analytics, acting as an "app within an app." The project aims to provide an interactive platform for users to explore diverse business scenarios.

# User Preferences

Preferred communication style: Simple, everyday language.
Design preference: Modern minimalist design with clean white backgrounds and simple elements.
Typography: Clean, modern fonts with emphasis on readability and simplicity. Inter font for modern pages like AI Agent.

# System Architecture

## Frontend Architecture
- **Frameworks**: React 18 with TypeScript, Vite.
- **Styling**: Tailwind CSS with a 2025 premium design system, including a global dark theme, glassmorphism, neumorphism, gradients, and micro-interactions.
- **UI Components**: Shadcn/ui (Radix UI), Lucide React, Phosphor Icons.
- **State Management**: React Query for server state.
- **Design System**: Responsive mobile-first design with desktop layout in Telegram (1200px viewport), Apple-style minimalism with premium aesthetics, full-screen layouts, and an 8px spacing grid.
- **Structure**: Main App router, `ShowcasePage` (premium Bento grid layout), `DemoAppShell` for universal navigation, and individual Demo Components for business simulations.
- **ShowcasePage Design (Dec 2024)**: Ultra-premium Apple-style minimalist landing with AIDA headline ("Когда другие обещают — ваши продукты уже [приносят выручку/общаются с клиентами/собирают заявки/масштабируются].") featuring blur animation on word transitions, process timeline (Бриф→Спринт→Запуск→Рост), demo cards with type labels (Retail/Luxury/Services) and metrics, integrations pills (Stripe/ЮKassa/OpenAI/Notion/Airtable/WhatsApp), stats grid (24h TTV/4.9 CSAT/99.9% Uptime), minimal dual CTAs. Color tokens: #000000 background, emerald #10B981 accent. Framer-motion fadeUp/AnimatePresence with blur effects.
- **Navigation**: iOS 26 Liquid Glass bottom navigation with:
  - **Refraction**: SVG feTurbulence + feDisplacementMap filter distorts content behind glass (not just blur)
  - **Adaptive color**: Icons use `text-white/80` with emerald `drop-shadow` glow when active for visibility
  - **Spring physics**: `useSpring` with stiffness=400, damping=25, mass=0.8 for natural bounce on press
  - **Chromatic aberration**: Subtle red/blue color fringing on edges
  - **Prismatic highlights**: Multi-layer gradient overlays for glass caustics
  - **Enhanced blur**: `blur(40px) saturate(180%) brightness(1.1)` for transparency
  - Telegram user avatar integration (`UserAvatar` component with photo_url support, initials fallback)
- **Telegram Integration**: Home screen shortcut support (`homeScreen.add()` with error handling and toast notifications for unsupported versions).
- **Technical Implementations**: Custom hooks, `ErrorBoundary`, performance optimizations (`React.memo`, `useMemo`, `useCallback`), `OptimizedImage`, `ModernAnimatedIcons`, and vertical stack card layouts.
- **Page Transitions**: None (removed for instant navigation - PageTransition, MotionBox, and MotionStagger components return plain div wrappers without animations).
- **Viewport Configuration**: Responsive `width=device-width` viewport for all platforms including Telegram WebApp - ensures correct display on all devices (mobile and desktop).
- **Video Optimization**: Smart lazy loading with `useVideoLazyLoad` hook - videos automatically pause/play based on visibility (IntersectionObserver with intersection state tracking), preload="none" for minimal initial load (videos load only when needed), canplay event listeners with proper cleanup to prevent off-screen playback. Handler refs reset when leaving viewport to enable fresh listeners on re-entry. Component prefetching implemented via `preloadDemo()` function - demo components preload on hover/touch for instant transitions.
- **Layout Philosophy**: Mobile-first responsive design with Tailwind breakpoints (sm:, md:, lg:, xl:). Layout automatically adapts based on device screen size.
- **Performance Metrics**: First Contentful Paint (FCP) optimized through aggressive bundle splitting (77KB initial vs 210KB before), lazy loading all pages, static ShowcaseShell for instant paint, and optimized video playback control. Note: Dev mode FCP ~16s due to HMR/source maps, production expected <1s.
- **Advanced Interactions**: Voice UI (`VoiceSearch`), WebGL Particle Background, 3D Parallax Cards, Liquid Button Effects, Pull-to-Refresh.
- **AI Personalization System**: `AIAssistant` (context-aware chat), `PersonalizedRecommendations` (ML-based engine), `useAIRecommendations` (behavior tracking).
- **Gamification System**: `useGamification` (achievements, XP, daily tasks), `GamificationHub` (UI for leaderboards, progress).
- **Accessibility**: WCAG 2.1 AA compliance, ARIA labels, keyboard navigation.
- **PWA Infrastructure**: Service Worker with offline-first strategy, caching, background sync, and push notifications.

## Backend Architecture (Development - Replit)
- **Server**: Express.js with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM (@neondatabase/serverless). Tables include photos, users, referrals, gamification_stats, and daily_tasks.
- **Active APIs**: Telegram webhook, Stripe payment processing, Photo management, Referral program, Gamification API.
- **Storage**: Replit Object Storage for photos, using presigned URLs.
- **Database Migrations**: Managed via Drizzle Kit.
- **Referral System**: Deep linking via Telegram start parameters, tier-based commissions, server-side Telegram WebApp initData validation.
- **Gamification Engine**: Exponential XP-based level progression, daily streak tracking, task rewards, global leaderboards.

## Deployment Architecture (Production - Railway)
- **Builder**: Railpack (Railway's modern builder, replacing Nixpacks)
- **Server**: Caddy (automatic static file server with SPA routing)
- **Build Process**: `npm run build` → creates optimized `dist/` folder
- **Serving**: Caddy automatically serves `dist/` with proper MIME types and SPA fallback
- **Health Checks**: Configured to check `/` with 100s timeout
- **Configuration**: `railway.json` with Railpack builder and healthcheck settings
- **Environment**: `RAILPACK_SPA_OUTPUT_DIR=dist` tells Railpack where to find built files
- **Nature**: Frontend-only SPA, no backend services on Railway (Telegram bot runs on Replit)
- **Performance**: Optimized chunk splitting with React in main vendor bundle for proper load order
- **URL**: https://w4tg.up.railway.app

### Migration Notes & Performance Fixes (Nov 2024)
Successfully migrated from Replit Agent environment to Railway production with critical performance optimizations:

**Critical Vite Chunk Splitting Fix:**
- Problem: "Cannot read properties of undefined (reading 'useState')" crash on Railway production
- Cause: React-dependent libraries (zustand, @uppy/react, swiper, cmdk) were in `utils-vendor` chunk that loaded BEFORE `vendor` chunk containing React
- Solution: Explicitly whitelist all React-dependent libraries to load in `vendor` chunk, use whitelist-only approach for `utils-vendor` (date-fns, zod, clsx only)
- Result: FCP improved from 22s to 3-4s, zero initialization errors

**Railway SPA Deployment:**
- Removed `"start"` script from package.json to trigger Caddy SPA auto-detection
- Added `RAILPACK_SPA_OUTPUT_DIR=dist` environment variable
- Configured `railway.json` with RAILPACK builder and healthcheck
- Result: Automatic static file serving with proper SPA routing

**Key Learnings:**
- Never use catch-all `return 'utils-vendor'` in manualChunks - causes initialization order issues
- All React ecosystem libraries MUST be in vendor chunk or loaded after it
- Railway auto-deploys on push when properly configured
- Clear build cache if seeing old version after successful deploy

# External Dependencies

- **React Ecosystem**: React, React DOM, TypeScript.
- **Build & Styling**: Vite, Tailwind CSS, PostCSS.
- **UI Libraries**: Radix UI, Shadcn/ui, Lucide React, Swiper.js, Phosphor React, Framer Motion.
- **Data Fetching**: @tanstack/react-query, @tanstack/react-virtual.
- **Telegram**: @twa-dev/sdk.
- **Backend**: Express.js, Stripe (for payment processing), Zod (for validation).
- **Photo Upload**: Uppy ecosystem (`@uppy/core`, `@uppy/dashboard`, `@uppy/aws-s3`, `@uppy/react`).
- **Database**: @neondatabase/serverless (PostgreSQL with Drizzle ORM).
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
- **Design System**: Responsive mobile-first design with desktop layout in Telegram (1200px viewport), minimalist aesthetics, full-screen layouts, and an 8px spacing grid.
- **Structure**: Main App router, `ShowcasePage`, `DemoAppShell` for universal navigation, and individual Demo Components for business simulations.
- **Navigation**: Ultra-minimal glassmorphic bottom navigation.
- **Technical Implementations**: Custom hooks, `ErrorBoundary`, performance optimizations (`React.memo`, `useMemo`, `useCallback`), `OptimizedImage`, `ModernAnimatedIcons`, and vertical stack card layouts.
- **Page Transitions**: None (removed for instant navigation - PageTransition, MotionBox, and MotionStagger components return plain div wrappers without animations).
- **Viewport Configuration**: Dual-mode viewport system - responsive `width=device-width` for Replit/browsers, automatically switches to fixed `width=1200` ONLY in Telegram WebApp via JavaScript detection (`window.Telegram.WebApp.initData`).
- **Video Optimization**: Smart lazy loading with `useVideoLazyLoad` hook - videos automatically pause/play based on visibility (IntersectionObserver), preload="none" for minimal initial load (videos load only when needed), canplay event listener for reliable playback control. Component prefetching implemented via `preloadDemo()` function - demo components preload on hover/touch for instant transitions.
- **Layout Philosophy**: Mobile-first responsive design with Tailwind breakpoints (sm:, md:). In Telegram, JavaScript automatically sets viewport to 1200px, triggering desktop layout via existing breakpoints.
- **Performance Metrics**: First Contentful Paint (FCP) ~1200-2244ms through component memoization, lazy loading, and optimized video playback control.
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

### Migration Notes (Nov 2024)
Successfully migrated from Replit Agent environment to Railway production. Key learnings documented in RAILWAY_DEPLOYMENT.md including:
- Proper Vite chunk configuration to prevent React loading order issues
- Railpack SPA auto-detection setup
- Health check configuration
- Avoiding common pitfalls with manual modulepreload and chunk splitting

# External Dependencies

- **React Ecosystem**: React, React DOM, TypeScript.
- **Build & Styling**: Vite, Tailwind CSS, PostCSS.
- **UI Libraries**: Radix UI, Shadcn/ui, Lucide React, Swiper.js, Phosphor React, Framer Motion.
- **Data Fetching**: @tanstack/react-query, @tanstack/react-virtual.
- **Telegram**: @twa-dev/sdk.
- **Backend**: Express.js, Stripe (for payment processing), Zod (for validation).
- **Photo Upload**: Uppy ecosystem (`@uppy/core`, `@uppy/dashboard`, `@uppy/aws-s3`, `@uppy/react`).
- **Database**: @neondatabase/serverless (PostgreSQL with Drizzle ORM).
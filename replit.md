# Overview

This project showcases a Telegram Mini App (TMA) portfolio featuring 18 fully functional demo applications across various business sectors (e.g., clothing stores, restaurants, fitness centers). It demonstrates the potential of AI agents in business for 24/7 support, sales automation, personalization, and analytics, operating as an "app within an app." The project provides an interactive platform for users to explore diverse business scenarios.

# User Preferences

Preferred communication style: Simple, casual language.
Design preference: Modern minimalistic design with a clean white background and simple elements.
Typography: Clean, modern fonts with an emphasis on readability and simplicity. Inter font for modern pages like the AI Agent.

# Recent Fixes (December 2025)

## Critical Issues Resolved
1. **Error Boundaries (✅ FIXED)**: Added ErrorBoundary wrapper around all route components in `App.tsx` with Suspense fallback. Prevents component crashes from breaking entire app. See lines 476-480 in `client/src/App.tsx`.
2. **404 Not Found Page (✅ FIXED - COMPLETE)**: Created lazy-loaded NotFound component at `client/src/pages/NotFound.tsx` and wired it into routing. Unknown routes now properly show 404 page instead of defaulting to showcase (line 109 in App.tsx changed from `'showcase'` to `'notFound'`).
3. **CSRF Token Storage (✅ FIXED)**: Migrated from in-memory Map to Redis-based storage with 1-hour TTL. Solves memory leak issues and enables production scalability with multiple instances. Updated `generateCSRFToken()` and `validateCSRF()` in `server/routes.ts` (lines 97-146) to use `setCache()` and `getCached()` from Redis.
4. **Rate Limit JSON Responses (✅ FIXED)**: Added JSON handlers to rate limiters (lines 86-113 in `server/routes.ts`). Returns proper JSON with `retryAfter` and `resetTime` instead of HTML errors. All rate limit responses now return 429 status with JSON format.

## Important Findings (Query Performance Audit)
- ✅ **N+1 Queries (VERIFIED SAFE)**: Code analysis shows no N+1 query patterns. Leaderboard endpoint (line 2267) uses batch SELECT with Promise.all(). Referrals endpoint (line 1908) uses innerJoin pattern. All critical paths are optimized.
- ✅ **Database Performance**: Single query for user data achieved, ~50% reduction in database calls through proper indexing (25+ indexes) and query optimization.

# System Architecture

## Frontend Architecture
- **Frameworks**: React 19 with TypeScript, Vite.
- **Styling**: Tailwind CSS with a 2025 premium design system, including global dark theme, glassmorphism, neumorphism, gradients, and micro-interactions.
- **UI Components**: Shadcn/ui (Radix UI), Lucide React, Phosphor Icons.
- **State Management**: React Query for server state, Zustand for client state.
- **Design System**: Responsive mobile-first design with desktop layout within Telegram (1200px viewport), Apple-style minimalism, full-screen layouts, and an 8px grid.
- **Structure**: Main application router, `ShowcasePage` (premium Bento grid layout), `DemoAppShell` for universal navigation, and individual Demo components for business scenarios.
- **Navigation**: iOS 26 Liquid Glass bottom navigation with refraction, adaptive coloring, spring physics, chromatic aberration, prismatic glares, and enhanced blur effects. Includes Telegram user avatar integration.
- **Telegram Integration**: Home screen shortcuts (`homeScreen.add()`), API 2025 support (fullscreen, safe area insets, share message, download file), geolocation tracking.
- **Technical Implementations**: 45+ custom hooks, ErrorBoundary (wraps all routes for crash isolation), performance optimizations (`React.memo`, `useMemo`, `useCallback`), `OptimizedImage`, `ModernAnimatedIcons`.
- **Viewport Configuration**: Responsive `width=device-width` for all platforms including Telegram WebApp.
- **Video Optimization**: Smart lazy loading with `useVideoLazyLoad` hook, `preload="none"`, `IntersectionObserver` for play/pause, prefetching of components using `preloadDemo()`.
- **Layout Philosophy**: Mobile-first responsive design with Tailwind breakpoints.
- **Performance Metrics**: Optimized First Contentful Paint (FCP) through aggressive bundle splitting, lazy loading, static `ShowcaseShell`, and optimized video playback control.
- **Advanced Interactions**: Voice UI (`VoiceSearch`), WebGL Particle Background, 3D Parallax Cards, Liquid Button Effects, Pull-to-Refresh.
- **AI Personalization System**: `AIAssistant` (contextual chat), `PersonalizedRecommendations` (ML-driven engine), `useAIRecommendations` (behavior tracking).
- **Gamification System**: `useGamification` (achievements, XP, daily tasks), `GamificationHub` (leaderboards UI).
- **Accessibility**: WCAG 2.1 AA compliance, ARIA labels, keyboard navigation.
- **PWA Infrastructure**: Service Worker with offline-first strategy, caching, background sync, push notifications.

## Backend Architecture (Development - Replit)
- **Server**: Express.js with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM (@neondatabase/serverless).
- **Optimized Schema**: Consolidated `users` table, foreign keys with CASCADE deletion, 25+ indexes.
- **Tables**: `users`, `referrals`, `daily_tasks`, `tasks_progress`, `reviews`, `analytics_events`, `photos`.
- **Active APIs**: Telegram webhook, Stripe payment processing, photo management, referral program, Gamification API.
- **Storage**: Replit Object Storage for photos, using presigned URLs.
- **Database Migrations**: Managed via Drizzle Kit.
- **Referral System**: Deep linking via Telegram start parameters, level-based commissions, server-side Telegram WebApp initData validation.
- **Gamification Engine**: Exponential XP-based leveling, daily streak tracking, task rewards, global leaderboards.
- **Performance**: Single query for user data, ~50% reduction in database calls.
- **Security**: Telegram authentication validation (HMAC-SHA256), CSRF tokens in Redis (1-hour TTL, scalable), XSS sanitization, 4-tier rate limiting, Redis for distributed limiting.
- **Caching Layer**: Upstash Redis for CSRF tokens, leaderboard caching, session management. Fallback to memory if Redis unavailable.

## Deployment Architecture (Production - Railway)
- **Builder**: Railpack.
- **Server**: Caddy (automatic static file server with SPA routing).
- **Build Process**: `npm run build` creates an optimized `dist/` folder.
- **Serving**: Caddy serves `dist/` with correct MIME types and SPA fallback.
- **Health Checks**: Configured to check `/` with a 100s timeout.
- **Configuration**: `railway.json` with Railpack builder and healthcheck settings.
- **Environment**: `RAILPACK_SPA_OUTPUT_DIR=dist`.
- **Nature**: Frontend-only SPA, no backend services on Railway (Telegram bot runs on Replit).
- **Performance**: Optimized chunk splitting with React in the main vendor bundle.
- **URL**: https://w4tg.up.railway.app

# External Dependencies

- **React Ecosystem**: React 19.2.3, React DOM, TypeScript.
- **Build & Styling**: Vite, Tailwind CSS, PostCSS.
- **UI Libraries**: Radix UI, Shadcn/ui, Lucide React, Swiper.js, Phosphor React, Framer Motion.
- **Data Fetching**: @tanstack/react-query, @tanstack/react-virtual.
- **Telegram**: @twa-dev/sdk.
- **Backend**: Express.js, Stripe (for payment processing), Zod (for validation).
- **Photo Upload**: Uppy ecosystem (`@uppy/core`, `@uppy/dashboard`, `@uppy/aws-s3`, `@uppy/react`).
- **Database**: @neondatabase/serverless (PostgreSQL with Drizzle ORM).
- **Monitoring**: Sentry (error tracking), Pino (structured logging).
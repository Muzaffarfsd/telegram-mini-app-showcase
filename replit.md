# Overview

This project is a Telegram Mini App (TMA) portfolio showcasing 18 functional demo applications across various business sectors. It highlights the potential of AI agents for 24/7 support, sales automation, personalization, and analytics within a Telegram environment. The platform offers an interactive experience for users to explore diverse business scenarios and serves as an "app within an app."

# User Preferences

Preferred communication style: Simple, casual language.
Design preference: Modern minimalistic design with a clean white background and simple elements.
Typography: Clean, modern fonts with an emphasis on readability and simplicity. Inter font for modern pages like the AI Agent.

# System Architecture

## Frontend Architecture
- **Frameworks**: React 19 with TypeScript, Vite.
- **Styling**: Tailwind CSS with a 2025 premium design system, supporting global dark theme, glassmorphism, neumorphism, gradients, and micro-interactions.
- **UI Components**: Shadcn/ui (Radix UI), Lucide React, Phosphor Icons.
- **State Management**: React Query for server state, Zustand for client state.
- **Design System**: Responsive mobile-first with desktop layout within Telegram (1200px viewport), Apple-style minimalism, full-screen layouts, and an 8px grid.
- **Navigation**: iOS 26 Liquid Glass bottom navigation with advanced visual effects and Telegram user avatar integration.
- **Telegram Integration**: Supports Home screen shortcuts, API 2025 (fullscreen, safe area insets, share message, download file), and geolocation tracking. Includes intelligent prefetching for Telegram WebApp Bot API 9.2.
- **Performance**: Optimized FCP (<2s target) via:
  - Deferred initialization: Sentry, providers, and global components loaded after first paint using `requestIdleCallback`
  - Lazy providers: `LazyRewardsProvider`, `LazyXPNotificationProvider`, `LazyMotionProvider` wrapped in Suspense
  - Bundle splitting: Icons, framer-motion, utils, charts in separate chunks (see `vite.config.ts` manualChunks)
  - No duplicate Telegram SDK calls: `ready()`/`expand()` called once in `index.html`
  - CSS animations for nav instead of framer-motion to reduce critical JS
  - iOS 26-style scroll haptics via `useScrollHaptic` hook with Telegram HapticFeedback API
  - Static `ShowcaseShell`, ErrorBoundary for crash isolation, video playback control
- **Advanced Interactions**: Voice UI (`VoiceSearch`), WebGL Particle Background, 3D Parallax Cards, Liquid Button Effects, Pull-to-Refresh.
- **Premium Effects Components** (`client/src/components/effects/`):
  - `GradientMesh` - Animated mesh gradient backgrounds with multiple floating orbs
  - `NoiseOverlay` - Subtle animated grain texture for depth
  - `ParallaxContainer/ParallaxLayer` - Performance-optimized parallax scrolling using refs (no setState per frame)
  - `SkeletonShimmer` - Premium loading skeletons with shimmer animation
  - `Confetti` - Achievement celebration effects with multiple shapes
- **Navigation Components** (`client/src/components/navigation/`):
  - `FloatingRadialMenu` - Expandable FAB with radial menu items
  - `SwipeNavigation/SwipeableCard` - Touch gesture support for cards/navigation
  - `AnimatedBreadcrumbs` - Breadcrumb navigation with animations
  - `StickyBlurHeader/CollapsibleHeader` - Headers with glassmorphism blur effects
- **AI/Gamification**: `AIAssistant` for contextual chat, `PersonalizedRecommendations` (ML-driven), and a gamification system with achievements, XP, daily tasks, and leaderboards.
- **Accessibility**: WCAG 2.1 AA compliance with ARIA labels and keyboard navigation.
- **PWA Infrastructure**: Service Worker for offline-first strategy, multi-tier caching, background sync, and push notifications. Includes `OfflineIndicator` and IndexedDB storage for offline data persistence.
- **Theming**: Dark/light theme toggle (`useTheme` hook) with localStorage persistence and Telegram WebApp color synchronization. Implements an iOS 26-inspired "Air & Glass" light theme and a premium OLED-optimized dark theme with 20+ effects:
  - OLED Black foundation with 5 surface depth levels (surface-1 to surface-5)
  - Premium card styles with gradient backgrounds and luminous borders
  - Glassmorphism 2.0 with blur(24-40px) and saturate effects
  - Gradient glow buttons with animated border effects
  - Spotlight hover effect for cards (radial gradient follows cursor)
  - Shimmer skeleton loading animations
  - Sticky blur headers with backdrop-filter
  - Duotone icon styles with glow effects
  - Micro-animations: float, pulse-glow, gradient-shift
  - Neomorphism dark elements with inset shadows
  - Aurora and mesh gradient backgrounds
  - Holographic animated effects
  - Premium transition curves (cubic-bezier)
- **Core Utilities**: Comprehensive logging system (Sentry integration), unified API client with CSRF and Zod validation, debounce/throttle utilities, and query caching with Zod validation.
- **Virtualization**: `VirtualList` and `VirtualGrid` components for efficient rendering of large lists.
- **Storage**: Telegram CloudStorage (version 6.9+) with localStorage fallback for onboarding persistence, and Bot API 9.2 storage wrappers (`deviceStorage`, `secureStorage`) with TTL-based caching.
- **Favorites System**: `FavoriteButton` and `FavoritesSection` integrated with Telegram DeviceStorage.

## Backend Architecture (Development)
- **Server**: Express.js with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM (@neondatabase/serverless), optimized schema with 25+ indexes.
- **APIs**: Telegram webhook, Stripe payment processing, photo management, referral program, Gamification API.
- **Storage**: Replit Object Storage for photos using presigned URLs.
- **Security**: Telegram authentication validation (HMAC-SHA256), Redis-based CSRF tokens (1-hour TTL), XSS sanitization, 4-tier rate limiting, Redis for distributed limiting.
- **Caching**: Upstash Redis for CSRF tokens, leaderboard caching, and session management.

## Deployment Architecture (Production)
- **Platform**: Railway for frontend-only SPA deployment.
- **Builder**: Railpack with Caddy for static file serving and SPA routing.
- **Nature**: Frontend-only SPA, with the Telegram bot running on Replit.

# External Dependencies

- **React Ecosystem**: React, React DOM, TypeScript.
- **Build & Styling**: Vite, Tailwind CSS, PostCSS.
- **UI Libraries**: Radix UI, Shadcn/ui, Lucide React, Swiper.js, Phosphor React, Framer Motion.
- **Data Fetching**: @tanstack/react-query, @tanstack/react-virtual.
- **Telegram**: @twa-dev/sdk.
- **Backend**: Express.js, Stripe, Zod.
- **Photo Upload**: Uppy (`@uppy/core`, `@uppy/dashboard`, `@uppy/aws-s3`, `@uppy/react`).
- **Database**: @neondatabase/serverless (PostgreSQL with Drizzle ORM).
- **Monitoring**: Sentry, Pino.
- **Caching**: Upstash Redis.
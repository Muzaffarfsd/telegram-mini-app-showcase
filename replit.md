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
- **Design System**: Mobile-first, responsive, minimalist aesthetics, full-screen layouts, and an 8px spacing grid.
- **Structure**: Main App router, `ShowcasePage`, `DemoAppShell` for universal navigation, and individual Demo Components for business simulations.
- **Navigation**: Ultra-minimal glassmorphic bottom navigation.
- **Technical Implementations**: Custom hooks, `ErrorBoundary`, performance optimizations (`React.memo`, `useMemo`, `useCallback`), `OptimizedImage`, `ModernAnimatedIcons`, and vertical stack card layouts.
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
- **Server**: Simple Express.js static server (server.js) serving `dist/public/`.
- **Purpose**: Acts as a universal static file server with SPA fallback routing and caching headers.
- **Nature**: Frontend-only, with no database, Telegram bot, or API endpoints on the production server.

# External Dependencies

- **React Ecosystem**: React, React DOM, TypeScript.
- **Build & Styling**: Vite, Tailwind CSS, PostCSS.
- **UI Libraries**: Radix UI, Shadcn/ui, Lucide React, Swiper.js, Phosphor React, Framer Motion.
- **Data Fetching**: @tanstack/react-query, @tanstack/react-virtual.
- **Telegram**: @twa-dev/sdk.
- **Backend**: Express.js, Stripe (for payment processing), Zod (for validation).
- **Photo Upload**: Uppy ecosystem (`@uppy/core`, `@uppy/dashboard`, `@uppy/aws-s3`, `@uppy/react`).
- **Database**: @neondatabase/serverless (PostgreSQL with Drizzle ORM).
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

**Date**: November 12, 2025
**Changes**: GitHub import setup for Replit environment
- Added `allowedHosts: true` to Vite config for Replit proxy support
- Created .gitignore file for Node.js project
- Configured development workflow to run on port 5000 with webview
- Database migrations successfully applied via Drizzle Kit
- Deployment configured for VM target with npm build and start commands
- Application verified working with premium dark theme and Telegram Mini App integration
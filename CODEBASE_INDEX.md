# CODEBASE_INDEX

> Map of every file in this repo. Lives in repo, version-controlled.
> AI assistants MUST read this file before starting any work.
> Updated when files are added / removed / significantly refactored.

## Stack

- **Frontend**: React 19 + Vite 5 + TypeScript + Wouter (routing) + TanStack Query + Tailwind + Radix UI + Framer Motion + Three.js + Zustand
- **Backend**: Express + tsx + Drizzle ORM + PostgreSQL (Neon/Railway) + Helmet + Redis (Upstash) + Sentry
- **Telegram**: `@twa-dev/sdk` + custom Telegram Bot API webhook handler
- **Deploy**: Railway (prod) — see `.railway.toml`. Build: `vite build && cp -r attached_assets dist/`
- **Dev script (Windows-patched)**: `npx -y cross-env NODE_ENV=development tsx --env-file=.env server/index.ts`

## Top-level

```
.env                           - local secrets (gitignored)
.env.example                   - env template (DATABASE_URL, TELEGRAM_BOT_TOKEN, SENTRY_DSN, Stripe, GCS)
.gitignore                     - + __*.bat / __*.log / __*.done for mcp scratch
package.json                   - 130+ deps. Scripts: dev/build/start/check/db:push
vite.config.ts                 - React Compiler + brotli/gzip + manualChunks (react/motion/radix/three)
                                 HMR: clientPort 443 on Railway, 5000 locally. Native FS watch.
start_dev.bat                  - foreground dev-server launcher (Windows)
restart_dev.bat                - kill+restart on port 5000
```

## client/src/  (frontend root = client/, Vite root)

```
main.tsx                       - createRoot(App). Defer-init webVitals + errorMonitor + Telegram WebApp init.
                                 Service worker registered in production only.
App.tsx                        - Router + 22 lazyWithRetry routes + LiquidGlassNav (bottom nav, 5 tabs:
                                 showcase/aiProcess/projects/constructor/profile) + GlobalSidebar + AIAgentButton.
                                 Cached tabs: showcase/projects/aiProcess/constructor/profile (kept mounted).
index.css                      - 210KB global styles + Tailwind directives + custom utility classes
```

### client/src/pages/

```
analytics.tsx                  - Analytics dashboard (charts of user activity, AB tests)
PhotoGallery.tsx               - Photo gallery viewer page
notifications.tsx              - Notifications list page
NotFound.tsx, not-found.tsx    - 404 pages
```

### client/src/data/

```
demoApps.ts                    - Registry of demo apps with metadata: id, title, description, category, image,
                                 likes, badge, hero/banners/services. ~18 apps.
```

### client/src/contexts/

```
LanguageContext.tsx            - ru/en i18n provider + useLanguage hook
RewardsContext.tsx             - Gamification state (XP, level, coins, streak, daily tasks, achievements)
XPNotificationContext.tsx      - XP gain toaster
```

### client/src/components/  (TOP-LEVEL pages-as-components)

**Main routed pages:**
```
ShowcasePage.tsx               - HOME (/) — main showcase of all demo mini-apps
ProjectsPage.tsx               - /projects — case studies / portfolio
ConstructorPage.tsx            - /constructor — interactive app builder/order form (73KB, very large)
ProfilePage.tsx                - /profile — user profile, settings, stats (55KB)
AIProcessPage.tsx              - /ai-process — AI agent workflow explainer
AIAgentPage.tsx                - /ai-agent — AI assistant chat
AboutPage.tsx                  - /about — about WEB4TG Studio
DemoAppLanding.tsx             - /demos/:id — landing page for a demo
DemoAppShell.tsx               - /demos/:id/app — wrapper that mounts the actual demo from DemoRegistry
CheckoutPage.tsx               - /checkout — Stripe checkout
HelpPage.tsx                   - /help
ReviewPage.tsx                 - /review — testimonials
PremiumAppsPage.tsx            - /premium — premium-tier apps showcase
CoinShopPage.tsx               - /coinshop — in-app currency shop
EarningPage.tsx                - /earning — ways to earn coins
GamificationHub.tsx            - /rewards — gamification dashboard
ReferralProgram.tsx            - /referral — referral system
TasksPage.tsx, TasksEarningPage.tsx, PremiumTasksEarningPage.tsx - tasks UIs
```

**Layout / navigation:**
```
GlobalSidebar.tsx              - Sidebar nav (55KB, very large — many links/sections)
BackHeader.tsx                 - Sticky "back" header
Breadcrumbs.tsx                - Breadcrumb trail
PageTransition.tsx             - Animated route transitions
SkipToContent.tsx              - A11y skip-link
```

**Common UI primitives:**
```
SmartSearch.tsx                - Search bar with predictions
VoiceSearch.tsx                - Mic-based search
UserAvatar.tsx                 - Avatar w/ photoUrl + initials fallback
LanguageToggle.tsx             - ru ↔ en switch
FavoriteButton.tsx, FavoritesSection.tsx - wishlist
ShareButton.tsx                - native share
ClearCacheButton.tsx           - manual cache nuke
LazyVideo.tsx, OptimizedImage.tsx - perf wrappers
PullToRefreshIndicator.tsx     - pull-to-refresh visual
OfflineIndicator.tsx           - network status pill
ProjectCard.tsx                - card for ProjectsPage
EmptyState.tsx                 - empty list placeholder
SEOHelmet.tsx                  - per-page meta tags / OG cards
NotificationTest.tsx           - dev tool: trigger Telegram notifications
GeolocationDemo.tsx, HapticComponentsDemo.tsx - feature demos
ObjectUploader.tsx             - GCS pre-signed upload widget
InlineValidation.tsx           - form field validation
OnboardingFlow.tsx, OnboardingTutorial.tsx - first-time UX
XPNotification.tsx             - XP-earned toaster
DailyRewards.tsx               - daily reward modal
Stories.tsx, CreateStoryModal.tsx - Stories carousel (Telegram-style)
Card3D.tsx                     - 3D-tilt card effect
NFTCarousel.tsx                - NFT-themed carousel
ParticleBackground.tsx         - tsparticles wallpaper
CultSymbol.tsx, ExpressPayment.tsx, ModernAnimatedIcons.tsx, AnimatedBusinessIcons.tsx,
AnimatedProgress.tsx, BusinessCards.tsx, PremiumBusinessIcons.tsx, ModernDrawerDemo.tsx,
IPhoneMockupShowcase.tsx, MotionWrapper.tsx, React19Features.tsx, PageLoadingFallback.tsx,
ErrorBoundary.tsx
```

### components/demos/  ←  THE 18 DEMO MINI-APPS

```
DemoRegistry.ts                - Map demoId → lazy() component. Critical demos pre-fetched.
DemoSidebar.tsx                - Sidebar shown inside each demo

clothing-store/premium-fashion  → PremiumFashionStore.tsx (183 KB) — luxury fashion store
electronics                     → Electronics.tsx (91 KB) — phones/laptops/gadgets
beauty                          → Beauty.tsx (115 KB) — GlowSpa beauty salon
restaurant                      → Restaurant.tsx (71 KB) — menu + reservations
fitness                         → Fitness.tsx (32 KB) — workouts/progress
banking                         → Banking.tsx (24 KB) — wallet, cards, crypto
bookstore                       → Bookstore.tsx (31 KB)
car-rental                      → CarRental.tsx (21 KB)
taxi                            → Taxi.tsx (32 KB)
medical                         → Medical.tsx (18 KB) — appointments/doctors
courses                         → Courses.tsx (35 KB) — online courses
car-wash                        → CarWash.tsx (31 KB)
florist                         → Florist.tsx (119 KB)
sneaker-vault / sneaker-store   → SneakerVault.tsx (118 KB) — sneaker collectibles
fragrance-royale / luxury-perfume → FragranceRoyale.tsx (153 KB) — premium fragrance
time-elite / luxury-watches     → TimeElite.tsx (146 KB) — luxury watches
futuristic-fashion-1            → RascalStore.tsx (53 KB)
futuristic-fashion-2            → StoreBlack.tsx (61 KB)
futuristic-fashion-3            → LabSurvivalist.tsx (53 KB)
futuristic-fashion-4            → NikeACG.tsx (55 KB) — Nike performance
oxyz-nft                        → OxyzNFT.tsx (63 KB) — NFT marketplace
emily-carter-ai                 → EmilyCarterAI.tsx (56 KB) — AI personal shopper
```

### components/ui/  (shadcn-style primitives — ~55 files)

`accordion alert alert-dialog aspect-ratio avatar badge breadcrumb button calendar card card-stack
carousel chart checkbox collapsible command context-menu dialog drawer dropdown-menu form
haptic-button haptic-card hover-card input input-otp label menubar navigation-menu page pagination
popover progress radio-group resizable scroll-area select separator sheet sidebar skeleton slider
switch table tabs textarea toast toaster toggle toggle-group tooltip
+ custom: CoinButton GlassCard PremiumGreenLoader ProgressiveImage SimpleLoader Ultimate2026Loader
          StickyGlassHeader VirtualizedList virtual-list vertical-image-stack pricing-module
          entropy etheral-shadow liquid-home-button neon-flow neon-raymarcher spline-scene
          spotlight sparkles`

### components/shared/  (reusable business widgets)

`AdaptiveNavigation AutoplayVideo BottomSheet CheckoutDrawer DemoShell DemoThemeProvider
EdgeSwipeDrawer EmptyState FiltersBar FunnelModules LazyImage MobileTapTarget ProductCard
ProductSkeleton QuickViewModal TrustBadges UrgencyIndicator VirtualizedProductGrid`

### components/2025/

`AdvancedEffects AIChatbot AnimatedElements OptimizedImage PremiumButtons PremiumCards
PremiumLayouts PremiumSections` — premium 2025-style elements

### components/AIAgent/

`AIAgentButton AIAgentInput AIAgentMessage AIAgentPanel AIGuidedTour AISessionSummary`
— floating AI assistant (in-app helper). Backed by hooks/useAIAgent.ts + server/routes/ai.ts.

### components/apple-ui/  (Apple HIG-style)

`Badge Button Card ExpandableSection LoadingProgress`

### components/effects/

`Confetti GradientMesh NoiseOverlay ParallaxContainer SkeletonShimmer WebGLBackground`

### components/icons/  +  components/icons.ts

`GamificationIcons.tsx` + central `icons.ts` re-export.

### components/navigation/

`AnimatedBreadcrumbs FloatingRadialMenu StickyBlurHeader SwipeNavigation`

### client/src/hooks/  (~60 hooks)

**Telegram** (7): `useTelegram` (main), useTelegramBackButtonHandler, useTelegramButtons, useTelegramNotifications, useTelegramPrefetch, useTelegramStorage, useTelegramViewport

**Performance** (15): useFrameBudget, useImagePreloader, useINPOptimizer, useIntersectionObserver, useLazyVideo, useListVirtualization, useMemoryMonitor, usePerformanceClass, usePerformanceMode, usePredictivePrefetch, usePrefetch, usePreloadImages, useVideoLazyLoad, useVideoPreload, useWebVitals

**Gamification** (3): useGamification, useXPSystem, useActivity

**Haptic** (4): useHaptic, useHapticManager, useHapticPatterns, useScrollHaptic

**A11y** (3): useAccessibility, useContrastChecker, useReducedMotion

**State / data** (11): useCart, useCleanup, useFavorites, useFilter, useModal, useOfflineData, usePersistentCart, usePersistentFavorites, usePersistentOrders, useRecommendations, useRouting (Wouter-based)

**Misc** (17): useABTest, useAIAgent, useAIInteractions, useAIRecommendations, useAnalytics, useAppInitialization, useBackButton, useCriticalCSS, useGeolocation, useGestures, usePullToRefresh, useRAFCallback, useScrollAnimation, useScrollDepthEffect, useScrollToTop, useTheme, use-toast

### client/src/lib/

```
abTesting.ts                   - variant assignment + tracking
accessibility.ts               - WCAG contrast + ARIA helpers
analytics.ts                   - event batching → /api/analytics
apiClient.ts                   - fetch wrapper w/ Telegram init data header
debounce.ts
deepLinks.ts                   - parse tg:// deep links
experiments.ts                 - feature flags
i18n.ts                        - i18n setup (ru/en)
logger.ts                      - leveled logger
offlineStorage.ts              - IndexedDB persistence
queryClient.ts                 - TanStack Query config
telegram.ts                    - Telegram WebApp SDK wrapper
telegramApi.ts                 - direct Bot API
telegramPrefetch.ts            - prefetch on Telegram viewport ready
telegramStorage.ts             - CloudStorage API wrapper
translations.ts                - 148 KB of ru/en strings (the big localization dict)
utils.ts                       - cn() helper (clsx + tailwind-merge)
```

### client/src/utils/

```
cacheBuster.ts errorMonitoring.ts imageUtils.ts LazyMotionProvider.tsx motionConfig.ts
performanceMonitor.ts vitals.ts webVitals.ts
```

### client/src/stores/

```
favoritesStore.ts              - Zustand store for favorites
```

### client/src/design-system/

```
glassmorphism.ts               - glass effect utilities
index.ts                       - re-export
motion.ts                      - Framer Motion presets
themes.ts                      - theme tokens (per-demo themes)
typography.ts                  - font scales
```

### client/src/design-tokens.ts
- Tailwind tokens + CSS vars

### client/src/styles/apple.css
- iOS Apple-style typography classes (`ios-title`, `ios-body`, `ios-button-filled`, …)

### client/public/

```
icons/icon.svg                 - app icon
manifest.json                  - PWA manifest
offline.html                   - offline fallback page
sw.js                          - service worker (cache + offline)
```

---

## server/

```
index.ts                       - Express bootstrap: helmet, CORS, compression, rate-limit,
                                 trust-proxy. Listens on PORT (default 5000).
                                 [PATCH] reusePort skipped on Windows.
                                 [PATCH] frameguard off in development (lets iPhone widget iframe it).
routes.ts                      - mounts all routers under /api/. CSRF + sanitization middleware.
                                 + GET /api/health, /api/csrf-token
db.ts                          - Drizzle init w/ node-postgres pool (max 5 dev / 20 prod)
storage.ts                     - File persistence abstraction
errorHandler.ts                - global error responder
logger.ts                      - pino w/ pretty in dev
apiUtils.ts                    - pagination, response wrappers, DB timeouts
rateLimiter.ts                 - Redis-backed rate limiters (sensitive/burst/analytics)
redis.ts                       - Upstash Redis client (optional)
objectStorage.ts               - GCS pre-signed upload URLs
objectAcl.ts                   - GCS ACL policy management
telegramAuth.ts                - validate Telegram initData HMAC signature
swagger.ts                     - auto-generated /api/docs
vite.ts                        - dev-mode Vite middleware integration (setupVite/serveStatic)
types/api.ts                   - shared TS types for API contracts
```

### server/lib/

```
gemini.ts (52 KB)              - Google GenAI integration: streaming chat, fn-calling, personas, contexts.
                                 The brain of the AI Agent feature.
elevenlabs.ts                  - TTS API integration
```

### server/routes/  (each is an Express router mounted in routes.ts)

```
ai.ts (15 KB)                  - POST /api/ai/chat (streaming SSE), /api/ai/tts, /api/ai/followup,
                                 GET /api/ai/voices, /api/ai/personas
analytics.ts (18 KB)           - /api/analytics/* (AB events, summary, dashboard), /api/vitals, /api/error
coinshop.ts                    - /api/coinshop/{tiers,redeem,balance}
gamification.ts                - /api/gamification/{stats,award-xp,daily-tasks,complete-task,leaderboard}
notifications.ts               - /api/notifications/{send,broadcast,interactive}
payments.ts                    - /api/{create-payment-intent,payment-success,payment-status} (Stripe)
photos.ts                      - /api/photos/{upload-url,*} (GCS-backed)
projects.ts                    - /api/{user-projects,create-project,update-project-status,init-demo-projects}
referrals.ts                   - /api/referrals/{user/init,stats,referrals}, /api/referral/apply
reviews.ts                     - /api/reviews (GET/POST), /api/commercial-proposal.pdf
shared.ts                      - sanitization/CSRF middleware + Zod schemas + tier calc + ref-code gen
stories.ts                     - /api/user-stories/* (CRUD + reactions: like/fire/clap/heart_eyes/rocket)
tasks.ts (19 KB)               - /api/tasks/{verify-telegram-subscription,complete,start,verify}, balance, progress
telegram.ts (30 KB)            - POST /api/telegram/webhook (7 callbacks + 6 commands), setup-webhook,
                                 webhook-info, bot-info, setup-commands, setup-menu-button
```

---

## shared/schema.ts  (Drizzle PG schema — 9 tables)

```
users                          - telegramId(unique), username, firstName, lastName,
                                 referralCode(unique), referredByCode, totalReferrals, activeReferrals,
                                 totalEarnings, pendingRewards, tier (Bronze/Silver/Gold/Platinum),
                                 level, xp, totalXp, currentStreak, bestStreak, lastVisitDate,
                                 completedTasks, achievements(jsonb), totalCoins, availableCoins, spentCoins
referrals                      - referrer/referred telegramId (FK), bonusAmount, status, createdAt
dailyTasks                     - telegramId(FK), taskId, taskName, description, xpReward, progress, maxProgress
tasksProgress                  - telegramId(FK), taskId, platform, taskType, coinsReward, verificationStatus
reviews                        - name, company, logoUrl, rating, text, telegramId, isApproved, isFeatured
analyticsEvents                - eventType, eventName, telegramId, metadata(jsonb)
userStories                    - telegramId(FK), title, mediaType, mediaUrl, category, hashtags(array),
                                 reactions (like/fire/clap/heart_eyes/rocket counts)
storyReactions                 - storyId(FK), telegramId, reactionType
photos                         - title, objectPath, thumbnailPath, userId
```

---

## artifacts/, attached_assets/, docs/, scripts/

- `attached_assets/`            - 77 media files (videos / hero images / demo screenshots) served via Express static
- `artifacts/mockup-sandbox/`   - Separate sub-project (mockup playground, has own package.json)
- `docs/`                       - 6 deployment/migration markdown files
- `scripts/`                    - 14 utility scripts (deploy, seed, migrate)
- DEPLOYMENT_GUIDE.md, RAILWAY_DEPLOYMENT.md, etc. — deploy how-tos

---

## How to use this index

1. **Looking for a feature** → scan section headers, find the file, then `Read` exact lines.
2. **Adding a new page** → register in App.tsx lazy imports + NonCachedRoute or cached-tabs.
3. **Adding a new demo** → drop into `components/demos/`, register in `DemoRegistry.ts` + `demoApps.ts`.
4. **New API endpoint** → add to existing or new `server/routes/*.ts`, mount in `server/routes.ts`.
5. **DB change** → edit `shared/schema.ts`, then `npm run db:push` (drizzle-kit).
6. **i18n** → keys in `client/src/lib/translations.ts`, accessed via `useLanguage().t`.

This file is updated when files are added/removed. **EDIT_LOG.md** tracks per-change diffs.

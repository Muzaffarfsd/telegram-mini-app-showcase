# Overview

This project is a Telegram Mini App (TMA) portfolio showcasing 18 functional demo applications across various business sectors. It highlights the potential of AI agents for 24/7 support, sales automation, personalization, and analytics within a Telegram environment. The platform offers an interactive experience for users to explore diverse business scenarios and serves as an "app within an app."

## 2026 Q1 Updates (March 2026)
- **ShowcasePage Cinematic Redesign**: Complete rewrite — Syne (800wt geometric display) + Instrument Serif (italic accents) + Inter (body). OLED #050505. Sections: Cinematic Hero (rotating words with 3D flip), Marquee ticker, **Animated Card Stack** (spring physics, stacked cards with real app screenshots from /screenshots/*, click→openDemo), Big Numbers (outlined stroke), Feature Grid (emoji), Editorial Testimonial (giant italic quote), Process Timeline (01-03), CTA (radial glow). Cards: FragranceRoyale, Bloom, SneakerVault, Radiance, TimeElite — cycle with "Листать" button. Accessibility: reduced-motion for marquee/counters/reveals, WCAG AA contrast (>0.4 alpha), focus-visible on all interactives, semantic HTML5. LazyMotion strict mode: only m.* from @/utils/LazyMotionProvider.
- **TimeElite Premium Rewrite** (2429 lines): Full editorial redesign matching FragranceRoyale quality — parallax hero 70vh, sticky glass header, 3-tab product detail (Характеристики/Наследие/Отзывы), mockWatchReviews, marquee strip, recommended carousel, service strip, editorial home/cart/profile with tier system (ELITE GOLD/PLATINUM). Theme: `DemoThemeProvider themeId="timeElite"`, accent `#D4AF37`, font `Playfair Display`.
- **SneakerVault Premium Rewrite** (1996 lines): Same quality overhaul — parallax hero, sticky glass header, 3-tab product detail (Кроссовки/Технологии/Отзывы), mockSneakerReviews, marquee strip, recommended carousel, service strip, editorial pages with tier system (VAULT GOLD/PLATINUM). Theme: `DemoThemeProvider themeId="sneakerVault"`, accent `#f97316`, font `Montserrat`.
- **Shared Premium Patterns**: productPageVariants, contentStagger/contentItem animations, heroImageRef parallax, productScrollRef, handleProductBack with exit animation, animated tab underline with layoutId.

## 2026 Q1 Updates (January 2026)
- **React 19.2**: New `<Activity>` component, `useEffectEvent` hook, improved DevTools performance tracking
- **framer-motion 12**: Rebranded to `motion`, new animation APIs
- **drizzle-orm 0.45.1**: Latest stable with improved query performance
- **lucide-react 0.562**: Latest icon set with new icons
- **Dependencies**: Stripe 20.x, optimized bundle with ES2022 target
- **Database**: Unique composite indexes on `dailyTasks` and `tasksProgress` to prevent duplicates
- **PWA**: Service Worker v7 with Navigation Preload and stale-while-revalidate API caching (5min TTL)
- **Build**: Vite 5.4 with ES2022 target for modern Telegram WebView v117+
- **Internationalization**: Automatic language detection based on Telegram user region (CIS -> Russian, others -> English)
- **Activity API**: `useActivity` hook and `<Activity>` component for preserving state during navigation
- **Share API**: `ShareButton` component with Telegram `shareMessage()` integration and haptic feedback
- **View Transitions**: CSS View Transitions API (60ms fade, no scale) for instant page transitions
- **INP Optimization**: `useTransition` in filters for non-blocking category changes; INP measured at 40ms
- **Performance Detection**: `usePerformanceClass` hook for adaptive animations based on device capability
- **Tab Caching**: 5 main tabs (showcase, projects, aiProcess, constructor, profile) stay mounted via CSS `display:none` — instant tab switching, preserved scroll position
- **Eager Critical Components**: GlobalSidebar and PageTransition loaded eagerly (not lazy) for faster first paint
- **CSS Performance**: All `transition: all` replaced with specific properties (transform, opacity, box-shadow); durations reduced to 100-200ms
- **Touch Response**: Global `button:active` scale(0.97) at 60ms; `touch-action: manipulation` on all interactive elements
- **Blur Budget**: Max blur(16-20px) on key elements; blur(40-60px) eliminated from navigation, sidebar, cards
- **User-Generated Stories**: Users can create and upload stories with 8 content types: My Business, App Idea, Review, Before/After, Looking For Partner, Lifehack, Achievement, Question. Stories require moderation before public display. Features include:
  - **Reactions System**: 5 reaction types (like, fire, clap, heart_eyes, rocket) with optimistic UI updates
  - **Hashtags**: Up to 10 hashtags per story for discoverability
  - **Demo Linking**: Stories can be linked to specific demo applications
  - **Location Tags**: Optional city/location tagging
  - **View Counter**: Tracks story view counts
  - **Share Integration**: Telegram shareMessage() API integration

# User Preferences

Preferred communication style: Simple, casual language.
Design preference: Modern minimalistic design with a clean white background and simple elements.
Typography: Clean, modern fonts with an emphasis on readability and simplicity. Inter font for modern pages like the AI Agent.

# System Architecture

## Frontend Architecture
- **Frameworks**: React 19.2 with TypeScript, Vite 5.4, framer-motion 12.
- **Styling**: Tailwind CSS with a 2025 premium design system, supporting global dark theme, glassmorphism, neumorphism, gradients, and micro-interactions.
- **UI Components**: Shadcn/ui (Radix UI), Lucide React, Phosphor Icons.
- **State Management**: React Query for server state, Zustand for client state.
- **Design System**: Responsive mobile-first with desktop layout within Telegram (1200px viewport), Apple-style minimalism, full-screen layouts, and an 8px grid.
- **Navigation**: iOS 26 Liquid Glass bottom navigation with advanced visual effects and Telegram user avatar integration.
- **Telegram Integration**: Supports Home screen shortcuts, API 2025 (fullscreen, safe area insets, share message, download file), and geolocation tracking. Includes intelligent prefetching for Telegram WebApp Bot API 9.2.
- **Performance**: Optimized FCP (<2s target) via:
  - Deferred initialization: Sentry, providers, and global components loaded after first paint using `requestIdleCallback`
  - Lazy providers: `LazyRewardsProvider`, `LazyXPNotificationProvider`, `LazyMotionProvider` wrapped in Suspense
  - Bundle splitting: 11 vendor chunks (react, query, radix, charts, animation, swiper, stripe, uppy, utils, icons, vendor) + 3 app-specific chunks (demos, projects, effects)
  - `LazyImage` component with IntersectionObserver (500px rootMargin), Unsplash auto-optimization, shimmer skeleton
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
- **PWA Infrastructure**: Service Worker v7 with Navigation Preload, offline-first strategy, multi-tier caching (static, dynamic, data, API), stale-while-revalidate API caching with 5min TTL, background sync, and push notifications. Includes `OfflineIndicator` and IndexedDB storage for offline data persistence.
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
- **Internationalization (i18n)**: Bilingual support (Russian/English) via `LanguageContext` and `useLanguage` hook. Premium fonts for English (Playfair Display headings + Montserrat body), Inter for Russian. Language toggle in bottom navigation.

## Backend Architecture (Development)
- **Server**: Express.js with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM (@neondatabase/serverless), optimized schema with 25+ indexes.
- **APIs**: Telegram webhook, Stripe payment processing, photo management, referral program, Gamification API, User Stories API (CRUD with moderation).
- **Storage**: Replit Object Storage for photos using presigned URLs.
- **Security**: Telegram authentication validation (HMAC-SHA256), Redis-based CSRF tokens (1-hour TTL), XSS sanitization, 4-tier rate limiting, Redis for distributed limiting.
- **Caching**: Upstash Redis for CSRF tokens, leaderboard caching, and session management.

## Radiance Fashion Demo — March 2026 Editorial Audit (PremiumFashionStore.tsx)
- **QuickView redesign**: Both HOME and CATALOG QuickView drawers rebuilt as editorial left-aligned layouts — product name in Cormorant Garamond italic, brand label + star rating + price (with discount badge) in side-by-side image/info layout matching product detail design language
- **The Edit hero card**: Product name font changed from `fontWeight:800` to Cormorant Garamond 26px light italic for editorial consistency
- **Lookbook grid**: Added ❤️ heart/favorite button + Eye quick-view button (stacked column) to all 4 lookbook cards, matching Just Dropped card behavior
- **Cart — Promo code**: Working promo code field with codes RADIANCE10 (10%), STYLE20 (20%), SS26 (15%); applied state shows badge with removal; activates on Enter key
- **Cart — Savings row**: "Вы экономите X ₽" green highlight row appears when promoApplied OR items have oldPrice; `finalTotal` used throughout (button, CheckoutDrawer)
- **Profile avatar**: Generic User icon replaced with "АП" initials in dark circle with white border
- **Profile tier progress bar**: Progress bar below membership tier text shows "N из 2/5 заказов до следующего тира" with percentage; hidden at Gold (shows "Максимальный статус достигнут")
- **Rating stars**: Characteristics tab renders visual ★ stars via `Star` component instead of text placeholder `'__stars__'`
- **Gallery dots**: Dots indicator hidden when only 1 unique image; dark pill style (no frosted glass)

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

# Telegram Mini App Configuration

## Custom Loading Screen (BotFather)
To configure a branded loading screen for the Mini App:
1. Open @BotFather in Telegram
2. Send `/mybots` and select your bot
3. Go to `Bot Settings` → `Configure Mini App`
4. Set custom icon (256x256 PNG) and brand colors for light/dark themes
5. The loading screen appears while the Mini App loads

## Bot API 9.2 Features Used
- `shareMessage()` - Share content to Telegram chats
- `downloadFile()` - Native file download popup
- `requestFullscreen()` - Fullscreen mode for immersive experience
- `DeviceStorage` / `SecureStorage` - Persistent local storage
- `BiometricManager` - Biometric authentication
- `HapticFeedback` - Tactile feedback for interactions
# Fragrance Royale Perfume Demo — March 2026 Full Redesign

## Product Detail Page — World-Class Editorial Architecture
- **Background**: Category-matched atmospheric dark: Oriental `#0D0812`, Fresh `#070F0D`, Floral `#0D080A`, Woody `#0A0805`, Amber `#0D0A06`
- **Sticky Glass Header**: Appears on scroll >60px — brand + italic name + price in gold-tinted frosted glass pill; back button + cart badge
- **Animation system**: Same as Radiance — `productExiting`, `handleProductBack` (340ms), `productPageVariants`, `contentStagger`, `contentItem`

## Unique Perfume-Specific Blocks
- **Fragrance Notes Pyramid**: Three-tier visual (Top/Heart/Base) with gradient color coding per category, connector lines, Cormorant Garamond italic notes
- **Longevity + Sillage meters**: 8-segment time bar + 3-dot sillage indicator in side-by-side cards
- **Tab system** (Аромат / Детали / Отзывы):
  - *Аромат*: Full pyramid + longevity/sillage + occasion chips + perfumer's editorial note
  - *Детали*: 10-row characteristics table with star rating and category metadata
  - *Отзывы*: 3 perfume-specific reviews with initials avatar, verified badge, Cormorant italic text
- **Category Family icons**: Wind (Fresh), Flame (Oriental), Flower2 (Floral), Leaf (Woody), Gem (Amber)
- **Concentration pills**: Color-coded gradient buttons per concentration with category-specific hues
- **Occasion chips**: День / Вечер / Ночь / Романтик / Деловой / Сезон in pill UI
- **Perfumer's Note**: editorial block in Cormorant Garamond italic with accent-colored border

## Home Page — Editorial 2026
- Centred wordmark `FRAGRANCE ROYALE · PARFUMS`
- Video editorial hero with `SS'26 Exclusive` badge + Cormorant italic headline
- Scent Family chips (5 categories with colored icons)
- `Just Arrived` horizontal scroll + `Bestsellers` 2-col grid
- Gender filter (Все/Женские/Мужские/Унисекс) correctly applied to Just Arrived, Bestsellers, and Catalog sections

## Exhaustive Audit Fixes (March 2026)
- **Gender filter wired to data**: `selectedGender` now filters Just Arrived, Bestsellers (home), and full Catalog page
- **`activeProductTab` reset**: clicking a recommended perfume resets to 'fragrance' tab + smooth-scrolls to top via `productScrollRef`
- **Product description**: `selectedPerfume.description` shown as editorial excerpt with accent-colored left border, between price and concentration selector
- **Service strip icons**: Replaced emoji (🚚↩✦) with lucide-react SVG icons `Truck`, `RotateCcw`, `ShieldCheck` in accent color
- **Hero editorial badge**: `НОВИНКА · SS'26` gold pill displayed at bottom-left of product detail hero when `isNew === true`
- **Stock pulse**: Pulsing dot animation on low-stock pill in hero
- **Cart/Profile backgrounds**: Fixed from hardcoded `#0A0A0A` to `var(--theme-background)` (all 3 occurrences: cart, cart checkout gradient, profile)

## Comprehensive World-Class Audit — Wave 2 (March 2026)
### Product Detail
- **Content sheet gradient background**: Changed from flat `#0C0C0E` to `linear-gradient(180deg, ${bgColor}EE 0%, #07070A 110px)` — per-category color seeps into content sheet, creating seamless visual from hero into content
- **Tab AnimatePresence cross-fade**: Each tab (Аромат/Детали/Отзывы) wrapped in `<AnimatePresence mode="wait"><m.div key={activeProductTab}>` — smooth opacity+y transition on tab switch

### Catalog Page
- **Inline search toggle**: Search button (🔍) toggles an animated expanding input (AnimatePresence height 0→44px); searches by name/brand in real-time; button turns gold when active
- **Gender filter row**: Все/Женские/Мужские/Унисекс pill row visible directly in catalog header — no need to go to home page
- **Category chips with icons**: Catalog chips now show category icon (Wind/Flame/Flower2/Leaf/Gem) + colored background + colored border matching category, same as home page
- **Empty state**: When filtered results = 0, animated empty state with Search icon, message, and "Сбросить фильтры" gold button
- **Filter button cycles gender**: Clicking Filter button in header cycles through gender filters; turns gold when active

### Home Page
- **Scent family chips colored**: Each chip uses `cfg.color` as background (`${color}18`) and border (`${color}35`) — visually distinct per category
- **Home search → catalog**: Typing in home search + pressing Enter or clicking "Найти →" sets catalogSearch, opens search bar in catalog, and navigates there
- **Just Arrived star ratings**: Small 5-dot rating indicator (gold/grey 5px dots) below price on each Just Arrived card
- **Bestsellers star ratings**: Star icon row (Star from lucide) below price on each Bestsellers card; price displayed in `fontWeight: 800` for hierarchy

### Cart Page — Complete Luxury Redesign
- **Luxury header**: "FRAGRANCE ROYALE" supertitle + italic Cormorant "Корзина" + live count "— N ароматов"
- **Brand in cart items**: Shows perfume brand supertitle (e.g., "TOM FORD") above product name in Cormorant italic
- **Category color dot**: Category color circle badge overlaid on product image corner (e.g., orange for Oriental)
- **Animated item removal**: AnimatePresence with `exit={{ opacity: 0, x: -24, scale: 0.97 }}` + `layout` prop for smooth reflow
- **Inline quantity stepper**: Pill-shaped stepper with rounded-full border (no separate circle buttons), compact unified control
- **Order summary card**: Separated card showing: Товары (N) / Доставка: Бесплатно (green) / Итого (26px bold) — full breakdown
- **Premium checkout CTA**: Gradient gold button (`linear-gradient(135deg, #D4BC3E, #C9B037, #B8A02E)`) with glow shadow; shows both label and price inline

### Volume Selector with Per-Size Pricing — Complete
- **`sizePrices: Record<string, number>`** added to Perfume interface + all 8 products (e.g. Black Orchid: 50ml=29 500₽ / 100ml=52 000₽; Creed Aventus: 50ml=44 500₽ / 100ml=78 000₽ / 250ml=165 000₽)
- **`displayPrice`** computed as `sizePrices[selectedVolume] ?? price` — main price display + sticky header CTA both use `displayPrice`
- **Volume button redesign**: 2-row cards (ml size bold + price in accent color); when selected: white bg + dark text
- **Savings badge**: For non-smallest volumes, a gold pill badge "−N%/мл" appears above the button showing per-ml savings vs smallest bottle
- **`addToCart`** uses `cartPrice = sizePrices[selectedVolume] ?? price` — cart shows correct volume-adjusted price
- **`discountPct`** recomputed from `displayPrice` so discount badge is always volume-accurate

### Hero Parallax — Zero Re-Render Implementation
- **`heroImageRef = useRef<HTMLDivElement>(null)`** added to component
- **`onScroll`** handler extended: `heroImageRef.current.style.transform = \`translateY(${st * 0.32}px)\`` — direct DOM mutation, zero React re-renders
- **`willChange: 'transform'`** on hero image div — GPU-composited layer, 60fps smooth
- **`openPerfume`** resets parallax: `heroImageRef.current.style.transform = ''` + `productScrollRef.current.scrollTop = 0` — clean slate per product

### Profile Page — Complete Luxury Redesign
- **Gold gradient hero section**: Subtle `rgba(201,176,55,0.07)` corner glow + hairline gold horizontal gradient at top
- **Initials avatar**: "АС" monogram on gold-to-dark gradient circle with double ring glow (`box-shadow: 0 0 0 3px rgba(201,176,55,0.2), 0 0 0 6px rgba(201,176,55,0.07)`)
- **Membership tier badge**: Dynamic tier — ROYALE MEMBER → ROYALE GOLD (≥30K₽ spent) → ROYALE PLATINUM (≥100K₽); Sparkles icon + gold/silver color
- **3-column stats**: Заказы / Избранное / Потрачено (in thousands, e.g., "29К") — gold numerals on dark cards
- **Recent orders section**: Shows up to 3 most recent orders with Package icon, order #, item count + total, colored status badge (Delivered=green, Shipped=amber, etc.)
- **Menu items with icon containers**: Each item has a 36px rounded square icon container + badge counter in gold for Избранное/Заказы
- **Logout with icon container**: Red tinted background + red-tinted square icon container for LogOut icon

# Radiance Fashion Demo — March 2026 Cinematic Animation Audit

## Page-Level Transitions (Product Detail)
- **Outer page**: `productPageVariants` — enter: `opacity 0→1, y 28→0, scale 0.985→1` (ease [0.22,1,0.36,1] 350ms); exit: `opacity 1→0, y 0→40, scale 1→0.975` (ease [0.32,0,0.67,0] 320ms)
- **`productExiting` state**: triggers exit animation, then `setSelectedProduct(null)` after 340ms via `handleProductBack()`
- **Hero image**: scale 1.06→1 + brightness 0.72→1 (650ms); on exit: scales back to 1.04 + dims to 0.65
- **Scale on inner flex container** (not overflow wrapper) — avoids clipping artifacts

## Content Stagger System
- **`contentStagger`**: staggerChildren 0.065, delayChildren 0.22
- **`contentItem`**: opacity 0→1, y 18→0 (420ms spring ease [0.22,1,0.36,1])
- Sections staggered: title/price → color → sizes → service strip → tabs tablist → tab content → recommended carousel
- Exit: stagger container snaps to `hidden` immediately (no out-stagger delay)

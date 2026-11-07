import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import * as Sentry from '@sentry/node';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { logRequest, logInfo, logError, redactSensitiveText } from "./logger";
import { errorHandler } from "./errorHandler";
import { setupSwagger } from "./swagger";
import { pool } from "./db";
import { initializeEmptyDatabase } from "./initializeDatabase";
import { apiAccessPolicy, apiOriginPolicy, contentSecurityDirectives, protectStaticFiles, railwayClientAddress, safeBodyPolicy } from './security';
import { redactMonitoringEvent } from './redaction';
import { secureExistingTelegramWebhook } from './webhookProvisioning';

// Initialize Sentry for error tracking
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    sendDefaultPii: false,
    beforeSend(event) {
      if (event.request) {
        delete event.request.data;
        delete event.request.cookies;
        if (event.request.url) event.request.url = event.request.url.split('?')[0];
        for (const name of Object.keys(event.request.headers || {})) {
          if (/authorization|cookie|telegram|csrf|token|secret/i.test(name)) delete event.request.headers![name];
        }
      }
      for (const item of event.exception?.values || []) if (item.value) item.value = redactSensitiveText(item.value);
      if (event.message) event.message = redactSensitiveText(event.message);
      return redactMonitoringEvent(event);
    },
    beforeSendTransaction: event => redactMonitoringEvent(event),
  });
}

const app = express();

// Trust proxy for proper IP detection behind reverse proxy (Replit/Railway)
const proxyHops = Number(process.env.TRUST_PROXY_HOPS ?? (process.env.RAILWAY_PUBLIC_DOMAIN ? '1' : '0'));
app.set('trust proxy', Number.isInteger(proxyHops) && proxyHops >= 0 && proxyHops <= 5 ? proxyHops : 0);
app.use(railwayClientAddress);
app.disable('x-powered-by');
app.set('query parser', 'simple');

// Security: Helmet for HTTP headers protection
app.use(helmet({
  contentSecurityPolicy: { directives: contentSecurityDirectives(path.resolve(import.meta.dirname, '..', 'dist', 'index.html')), useDefaults: false },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  // Allow iframe embedding from Telegram + our local widget in development.
  frameguard: false, // CSP frame-ancestors allows Telegram Web and our own origin.
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  strictTransportSecurity: process.env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
}));
app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), payment=(self "https://js.stripe.com"), microphone=(self)');
  next();
});
app.use(protectStaticFiles);

// Cache control for Telegram Mini App - force refresh
app.use((req, res, next) => {
  // Disable caching for HTML and API to ensure Telegram gets fresh content
  if (req.path === '/' || req.path.endsWith('.html') || req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    // Add Vary header to ensure caching works correctly with proxies/CDN from different countries
    res.setHeader('Vary', 'Accept-Encoding, Origin, Accept-Language, User-Agent');
  }
  next();
});

// Exact origin matching, never substring matching or credentialed wildcards.
app.use('/api', apiOriginPolicy);

// Security: Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 300, // A coarse perimeter budget; stricter per-route and burst budgets apply below.
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health', // Mounted at /api: req.path is already relative.
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute for sensitive endpoints
  message: { error: 'Rate limit exceeded' },
});

app.use('/api', apiLimiter);
app.use('/api/referral', strictLimiter);
app.use('/api/coins', strictLimiter);
app.use('/api/ai', strictLimiter);
app.use('/api', apiAccessPolicy);

let earlyHintLinks: string[] = [];
if (process.env.NODE_ENV === 'production') {
  try {
    const manifestPath = path.resolve(import.meta.dirname, '..', 'dist', '.vite', 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const entry = manifest['src/main.tsx'] || manifest['index.html'];
      if (entry) {
        if (entry.css) {
          entry.css.forEach((css: string) => earlyHintLinks.push(`</${css}>; rel=preload; as=style`));
        }
        if (entry.file) {
          earlyHintLinks.push(`</${entry.file}>; rel=modulepreload`);
        }
      }
    }
  } catch {}

  if (earlyHintLinks.length > 0) {
    app.use((req, res, next) => {
      if (req.path === '/' || req.path.endsWith('.html')) {
        const rawRes = res as any;
        if (typeof rawRes.writeEarlyHints === 'function') {
          rawRes.writeEarlyHints({ link: earlyHintLinks });
        }
      }
      next();
    });
  }
}

logInfo('Server starting', { env: process.env.NODE_ENV });

// CDN-like caching for static assets in production
const staticCacheOptions = {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '1d', // 1 year in production
  etag: true,
  lastModified: true,
  immutable: process.env.NODE_ENV === 'production', // Immutable for hashed assets
  setHeaders: (res: Response, filePath: string) => {
    // Set CDN-friendly headers
    if (process.env.NODE_ENV === 'production') {
      // Immutable caching for hashed assets (JS, CSS with content hashes)
      if (filePath.match(/\.[a-f0-9]{8,}\.(js|css|woff2?|ttf|eot)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
      // Standard long cache for images
      else if (filePath.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
      }
      // Long cache for video files
      else if (filePath.match(/\.(mp4|webm|ogg)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
      }
      // Add Vary header for CDN compatibility
      res.setHeader('Vary', 'Accept-Encoding');
    }
  }
};

// Serve attached_assets folder for uploaded videos/images
app.use('/attached_assets', express.static(path.resolve(import.meta.dirname, '..', 'attached_assets'), staticCacheOptions));

// Brotli/Gzip compression for all responses
app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress files > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression filter function
    return compression.filter(req, res);
  }
}));

// Bound memory/CPU before route validation. Images have a separate, bounded budget.
app.use('/api/ai/chat', express.json({ limit: '6mb', strict: true, inflate: false }));
app.use(express.json({ limit: '128kb', strict: true, inflate: false }));
app.use(express.urlencoded({ extended: false, limit: '32kb', parameterLimit: 100, inflate: false }));
app.use(safeBodyPolicy);

// Disable caching ONLY in development to ensure fresh content
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    // Add Vary headers for development to handle VPN/geolocation changes
    res.setHeader('Vary', 'Accept-Encoding, Origin, Accept-Language, User-Agent');
    next();
  });
}

app.use((req, res, next) => {
  const start = Date.now();
  const pathname = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathname.startsWith("/api")) {
      logRequest(req.method, pathname, res.statusCode, duration, {
        userId: (req as any).telegramUser?.id,
      });

      let logLine = `${req.method} ${pathname} ${res.statusCode} in ${duration}ms`;

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  if (process.env.NODE_ENV === 'production') {
    try {
      const result = await initializeEmptyDatabase(pool);
      if (result === 'created') console.info('[Database] Initialized new empty database.');
      else if (result === 'nonempty_database' || result === 'unexpected_schema') {
        console.warn(`[Database] Initialization skipped: ${result}. Existing data was not changed.`);
      }
    } catch (error) {
      const code = (error as { code?: string }).code || 'unknown';
      console.error(`[Database] Initialization failed (${code}); check database configuration and logs.`);
    }
  }
  const server = await registerRoutes(app);

  if (process.env.NODE_ENV === 'production') {
    const webhookStatus = await secureExistingTelegramWebhook();
    logInfo('Telegram webhook security provisioning', { status: webhookStatus });
  }

  // Setup Swagger API documentation
  if (process.env.NODE_ENV !== 'production') setupSwagger(app);

  // Custom error handler (also sends to Sentry via errorHandler)
  app.use(errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.requestTimeout = 30_000;
  server.headersTimeout = 15_000;
  server.keepAliveTimeout = 5_000;
  server.maxHeadersCount = 100;
  server.listen({
    port,
    host: "0.0.0.0",
    // reusePort is Linux-only; on Windows it triggers ENOTSUP.
    ...(process.platform === 'linux' ? { reusePort: true } : {}),
    backlog: 511,
  }, () => {
    log(`serving on port ${port}`);
  });
})();

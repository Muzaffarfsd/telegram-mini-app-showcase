import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import * as Sentry from '@sentry/node';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { logRequest, logInfo, logError } from "./logger";
import { errorHandler } from "./errorHandler";
import { setupSwagger } from "./swagger";

// Initialize Sentry for error tracking
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  });
}

const app = express();

// Trust proxy for proper IP detection behind reverse proxy (Replit/Railway)
app.set('trust proxy', 1);

// Security: Helmet for HTTP headers protection
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for Telegram WebApp compatibility
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

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

// Security: CORS configuration
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Allow Telegram domains and local development
  const allowedOrigins = [
    'https://web.telegram.org',
    'https://telegram.org',
    'https://t.me',
  ];
  
  if (origin && (allowedOrigins.some(o => origin.includes(o)) || process.env.NODE_ENV === 'development')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    // In development, allow all origins for VPN/geolocation testing
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Telegram-Init-Data, X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  // Add Access-Control-Max-Age for better performance
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Security: Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.path.startsWith('/api'), // Only limit API routes
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute for sensitive endpoints
  message: { error: 'Rate limit exceeded' },
});

app.use('/api', apiLimiter);
app.use('/api/referral', strictLimiter);
app.use('/api/coins', strictLimiter);

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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (pathname.startsWith("/api")) {
      logRequest(req.method, pathname, res.statusCode, duration, {
        userId: (req as any).telegramUser?.id,
      });

      let logLine = `${req.method} ${pathname} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Setup Swagger API documentation
  setupSwagger(app);

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
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
    backlog: 511,
  }, () => {
    log(`serving on port ${port}`);
  });
})();

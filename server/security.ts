import crypto from 'node:crypto';
import fs from 'node:fs';
import { isIP } from 'node:net';
import type { Request, Response, NextFunction } from 'express';
import { verifyTelegramUser } from './routes/shared';

const canonicalOrigin = 'https://w4tg.up.railway.app';

export function railwayClientAddress(req: Request, _res: Response, next: NextFunction) {
  // Railway's edge supplies X-Real-IP. Never honor this caller-controlled header on a direct/local server.
  if (process.env.NODE_ENV === 'production' && process.env.RAILWAY_PUBLIC_DOMAIN) {
    const address = req.get('x-real-ip');
    if (address && isIP(address)) Object.defineProperty(req, 'ip', { value: address, configurable: true });
  }
  next();
}

export function allowedOrigins(env: NodeJS.ProcessEnv = process.env): Set<string> {
  const values = [canonicalOrigin, env.WEBAPP_URL, env.RAILWAY_PUBLIC_DOMAIN && `https://${env.RAILWAY_PUBLIC_DOMAIN}`, ...(env.ALLOWED_ORIGINS || '').split(',')];
  const origins = new Set<string>();
  for (const value of values) {
    if (!value) continue;
    try {
      const url = new URL(value.trim());
      if (url.username || url.password) continue;
      if (url.protocol === 'https:' || (env.NODE_ENV !== 'production' && url.protocol === 'http:')) origins.add(url.origin);
    } catch { /* Invalid configured origins never grant access. */ }
  }
  if (env.NODE_ENV !== 'production') {
    for (const port of [5000, 4173, 5173]) {
      origins.add(`http://localhost:${port}`);
      origins.add(`http://127.0.0.1:${port}`);
    }
  }
  return origins;
}

export function apiOriginPolicy(req: Request, res: Response, next: NextFunction) {
  res.vary('Origin');
  const origin = req.get('origin');
  if (origin && !allowedOrigins().has(origin)) return res.status(403).json({ error: 'Origin is not allowed' });
  if (req.get('sec-fetch-site') === 'cross-site' && !origin) return res.status(403).json({ error: 'Cross-site request is not allowed' });
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Telegram-Init-Data, X-CSRF-Token');
  res.setHeader('Access-Control-Max-Age', '600');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}

// Every newly registered API is private by default, including new demo APIs.
// Public exceptions require a deliberate, reviewed entry here AND route-level validation.
const publicReads = new Set(['/health', '/csrf-token', '/payment-status', '/coinshop/tiers', '/reviews', '/photos', '/user-stories', '/gamification/leaderboard', '/commercial-proposal.pdf', '/ai/personas', '/exchange-rates/nbkr']);
const publicTelemetry = new Set(['/vitals', '/error', '/user-action', '/analytics/ab-event', '/analytics/events', '/analytics/track']);
const disabledAi = new Set(['/ai/chat', '/ai/tts', '/ai/voices', '/ai/followup', '/ai/followup/cancel']);
export function apiAccessPolicy(req: Request, res: Response, next: NextFunction) {
  const route = req.path.replace(/\/$/, '') || '/';
  if ((req.method === 'GET' || req.method === 'HEAD') && (publicReads.has(route) || /^\/photos\/\d+$/.test(route) || /^\/user-stories\/\d+\/reactions$/.test(route))) return next();
  if (req.method === 'POST' && (publicTelemetry.has(route) || route === '/telegram/webhook' || /^\/user-stories\/\d+\/view$/.test(route))) return next();
  if (process.env.WEB4TG_AI_PROVIDER_ENABLED !== 'true' && disabledAi.has(route)) return next();
  verifyTelegramUser(req, res, next);
}

// Reject ambiguous/prototype-polluting input before any route can use it.
export function safeBodyPolicy(req: Request, res: Response, next: NextFunction) {
  let nodes = 0;
  const valid = (value: unknown, depth = 0): boolean => {
    if (++nodes > 20000 || depth > 24) return false;
    if (!value || typeof value !== 'object') return true;
    if (Array.isArray(value)) return value.every(item => valid(item, depth + 1));
    return Object.entries(value).every(([key, item]) => !['__proto__', 'constructor', 'prototype'].includes(key) && valid(item, depth + 1));
  };
  if (!valid(req.body)) return res.status(400).json({ error: 'Invalid request structure' });
  next();
}

export function isPrivateStaticPath(pathname: string): boolean {
  let decoded: string;
  try { decoded = decodeURIComponent(pathname); } catch { return true; }
  // Public URLs are not a source archive or a place for credentials, backups or source maps.
  return decoded.includes('\\') || decoded.split('/').some(part => part.startsWith('.') && part !== '.well-known') || /(?:^|\/)(?:node_modules|server|shared|tests|docs|\.git)(?:\/|$)/i.test(decoded) || /(?:FULL_PROJECT_CODE|package(?:-lock)?\.json|(?:^|\/)AGENTS\.md|\.env(?:\.|$)|\.(?:map|sql|sqlite|bak|backup|pem|key|p12|pfx|log)$)/i.test(decoded);
}

export function protectStaticFiles(req: Request, res: Response, next: NextFunction) {
  if (isPrivateStaticPath(req.path)) return res.status(404).type('text/plain').send('Not found');
  next();
}

export function inlineScriptHashes(html: string): string[] {
  const hashes = new Set<string>();
  for (const match of Array.from(html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi))) {
    if (/\bsrc\s*=/i.test(match[1]) || !match[2].trim()) continue;
    hashes.add(`'sha256-${crypto.createHash('sha256').update(match[2]).digest('base64')}'`);
  }
  return Array.from(hashes);
}

export function contentSecurityDirectives(indexPath: string, production = process.env.NODE_ENV === 'production') {
  // Hash only the trusted build's exact bootstrap scripts; arbitrary inline JS remains blocked.
  const hashes = fs.existsSync(indexPath) ? inlineScriptHashes(fs.readFileSync(indexPath, 'utf8')) : [];
  return {
    defaultSrc: ["'self'"],
    scriptSrc: production ? ["'self'", 'https://telegram.org', 'https://js.stripe.com', ...hashes] : ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://telegram.org', 'https://js.stripe.com'],
    scriptSrcAttr: ["'none'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
    imgSrc: ["'self'", 'https:', 'data:', 'blob:'],
    mediaSrc: ["'self'", 'https:', 'blob:', 'data:'],
    connectSrc: production ? ["'self'", 'https://*.ingest.sentry.io', 'https://*.ingest.us.sentry.io', 'https://*.ingest.de.sentry.io', 'https://prod.spline.design', 'https://api.stripe.com', 'https://m.stripe.network'] : ["'self'", 'https:', 'ws:', 'wss:'],
    frameSrc: ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com', 'https://prod.spline.design', 'https://my.spline.design', 'https://js.stripe.com', 'https://hooks.stripe.com'],
    frameAncestors: production ? ["'self'", 'https://web.telegram.org', 'https://*.telegram.org'] : ["'self'", 'http://localhost:*', 'http://127.0.0.1:*'],
    workerSrc: ["'self'", 'blob:'],
    objectSrc: ["'none'"],
    baseUri: ["'none'"],
    formAction: ["'self'"],
    ...(production ? { upgradeInsecureRequests: [] } : {}),
  };
}

import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import rateLimit from 'express-rate-limit';
import {
  createSensitiveRateLimitMiddleware,
  createBurstRateLimitMiddleware,
  createAnalyticsRateLimitMiddleware,
} from './rateLimiter';
import type { TelegramUserData } from './types/api';
import {
  sanitizeBodyMiddleware,
  validateCSRF,
  generateCSRFToken,
} from './routes/shared';

import telegramRouter from './routes/telegram';
import paymentsRouter from './routes/payments';
import projectsRouter from './routes/projects';
import photosRouter from './routes/photos';
import storiesRouter from './routes/stories';
import tasksRouter from './routes/tasks';
import referralsRouter from './routes/referrals';
import gamificationRouter from './routes/gamification';
import reviewsRouter from './routes/reviews';
import notificationsRouter from './routes/notifications';
import analyticsRouter from './routes/analytics';
import coinshopRouter from './routes/coinshop';

declare module 'express-serve-static-core' {
  interface Request {
    rateLimit?: {
      limit: number;
      current: number;
      remaining: number;
      resetTime: number;
    };
    telegramUser?: TelegramUserData;
    telegramAuthDate?: number;
  }
}

const globalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = req.rateLimit?.resetTime 
      ? Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
      : 60;
    res.status(429).json({
      error: 'Too many requests, please try again later.',
      retryAfter,
      resetTime: req.rateLimit?.resetTime,
    });
  },
});

const sensitiveEndpointLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const retryAfter = req.rateLimit?.resetTime 
      ? Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
      : 60;
    res.status(429).json({
      error: 'Too many requests to sensitive endpoint, please try again later.',
      retryAfter,
      resetTime: req.rateLimit?.resetTime,
    });
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use('/api/', globalApiLimiter);
  
  app.use('/api/stripe/', sensitiveEndpointLimiter);
  app.use('/api/referrals/', sensitiveEndpointLimiter);
  app.use('/api/referral/', sensitiveEndpointLimiter);
  app.use('/api/tasks/complete', sensitiveEndpointLimiter);
  app.use('/api/notifications/', sensitiveEndpointLimiter);
  
  app.use('/api/gamification/', createSensitiveRateLimitMiddleware());
  app.use('/api/payment/', createSensitiveRateLimitMiddleware());
  
  app.use('/api/stripe/', createBurstRateLimitMiddleware());
  app.use('/api/referral/', createBurstRateLimitMiddleware());
  
  app.use('/api/analytics/', createAnalyticsRateLimitMiddleware());
  
  app.use('/api/', validateCSRF);
  
  app.use('/api/', sanitizeBodyMiddleware);
  
  app.get("/api/csrf-token", async (req, res) => {
    const sessionId = req.headers['x-telegram-init-data'] as string || req.ip || 'anonymous';
    const token = await generateCSRFToken(sessionId);
    res.json({ csrfToken: token });
  });

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  });

  app.use(telegramRouter);
  app.use(paymentsRouter);
  app.use(projectsRouter);
  app.use(photosRouter);
  app.use(storiesRouter);
  app.use(tasksRouter);
  app.use(referralsRouter);
  app.use(gamificationRouter);
  app.use(reviewsRouter);
  app.use(notificationsRouter);
  app.use(analyticsRouter);
  app.use(coinshopRouter);

  const httpServer = createServer(app);

  return httpServer;
}

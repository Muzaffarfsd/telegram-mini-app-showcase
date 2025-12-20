import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { db } from "./db";
import { photos, insertPhotoSchema, users, referrals, gamificationStats, dailyTasks, tasksProgress, userCoinsBalance, reviews, insertReviewSchema } from "../shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { desc, eq, and, sql } from "drizzle-orm";
import { getCached, setCache, invalidateCache, cacheKeys, CACHE_TTL } from './redis';

// ============ XSS SANITIZATION (Context-aware) ============
// Only sanitize specific user-generated text fields, not paths/URLs
const XSS_SANITIZE_FIELDS = new Set(['text', 'comment', 'message', 'description', 'bio', 'content']);

function sanitizeHtmlString(input: string): string {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

function sanitizeUserInput(obj: any, parentKey?: string): any {
  if (typeof obj === 'string') {
    // Only sanitize known text fields, leave paths/URLs intact
    if (parentKey && XSS_SANITIZE_FIELDS.has(parentKey.toLowerCase())) {
      return sanitizeHtmlString(obj);
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item, i) => sanitizeUserInput(item, parentKey));
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeUserInput(obj[key], key);
    }
    return sanitized;
  }
  return obj;
}

function sanitizeBodyMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeUserInput(req.body);
  }
  next();
}

// ============ RATE LIMITING ============
const globalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const sensitiveEndpointLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests to sensitive endpoint, please try again later.' },
});

// ============ CSRF PROTECTION ============
const csrfTokens: Map<string, { token: string; expires: number }> = new Map();

function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 60 * 60 * 1000;
  csrfTokens.set(sessionId, { token, expires });
  
  Array.from(csrfTokens.entries()).forEach(([key, value]) => {
    if (value.expires < Date.now()) {
      csrfTokens.delete(key);
    }
  });
  
  return token;
}

function validateCSRF(req: Request, res: Response, next: NextFunction) {
  const excludedPaths = [
    '/api/telegram/webhook',
    '/api/vitals',
    '/api/stripe/webhook',
  ];
  
  if (excludedPaths.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  if (!['POST', 'PATCH', 'DELETE', 'PUT'].includes(req.method)) {
    return next();
  }
  
  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionId = req.headers['x-telegram-init-data'] as string || req.ip || 'anonymous';
  
  if (!csrfToken) {
    return res.status(403).json({ error: 'Missing CSRF token' });
  }
  
  const storedData = csrfTokens.get(sessionId);
  if (!storedData || storedData.token !== csrfToken || storedData.expires < Date.now()) {
    return res.status(403).json({ error: 'Invalid or expired CSRF token' });
  }
  
  next();
}

// ============ ZOD VALIDATION SCHEMAS ============
const referralApplySchema = z.object({
  referralCode: z.string().min(1),
  userId: z.number().optional(),
});

const awardXpSchema = z.object({
  telegramId: z.number(),
  xpAmount: z.number(),
  action: z.string(),
});

const uploadUrlSchema = z.object({
  fileSize: z.number().optional(),
  fileType: z.string().optional(),
});

// ============ OBJECT STORAGE LIMITS ============
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Initialize Stripe only if secret key is available
let stripe: any = null;
if (process.env.STRIPE_SECRET_KEY) {
  const Stripe = require('stripe');
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

// Validate Telegram WebApp initData
function validateTelegramInitData(initData: string, botToken: string): any {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return null;

    // Remove hash from params for validation
    urlParams.delete('hash');

    // Create data-check string (sorted keys)
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Calculate secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Verify hash
    if (calculatedHash !== hash) {
      return null;
    }

    // Parse user data
    const userParam = urlParams.get('user');
    if (!userParam) return null;

    const user = JSON.parse(userParam);
    return user;
  } catch (error) {
    console.error('Error validating Telegram initData:', error);
    return null;
  }
}

// Middleware to verify Telegram user
function verifyTelegramUser(req: any, res: any, next: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return res.status(503).json({ error: 'Telegram bot not configured' });
  }

  const initData = req.headers['x-telegram-init-data'] || req.body.initData;
  if (!initData) {
    return res.status(401).json({ error: 'Missing Telegram init data' });
  }

  const user = validateTelegramInitData(initData, botToken);
  if (!user) {
    return res.status(401).json({ error: 'Invalid Telegram init data' });
  }

  // Attach verified user to request
  req.telegramUser = user;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ============ APPLY SECURITY MIDDLEWARE ============
  
  // Apply global rate limiter to all /api/ routes
  app.use('/api/', globalApiLimiter);
  
  // Apply stricter rate limiter to sensitive endpoints
  app.use('/api/stripe/', sensitiveEndpointLimiter);
  app.use('/api/referrals/', sensitiveEndpointLimiter);
  app.use('/api/referral/', sensitiveEndpointLimiter);
  app.use('/api/tasks/complete', sensitiveEndpointLimiter);
  app.use('/api/notifications/', sensitiveEndpointLimiter);
  
  // Apply CSRF validation middleware to all /api/ routes
  app.use('/api/', validateCSRF);
  
  // Apply XSS sanitization to all POST/PUT/PATCH request bodies
  app.use('/api/', sanitizeBodyMiddleware);
  
  // CSRF token endpoint - generates token for client
  app.get("/api/csrf-token", (req, res) => {
    const sessionId = req.headers['x-telegram-init-data'] as string || req.ip || 'anonymous';
    const token = generateCSRFToken(sessionId);
    res.json({ csrfToken: token });
  });

  // Health check endpoint for Railway
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  });

  // Telegram Mini App routes
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  // Telegram webhook endpoint
  app.post("/api/telegram/webhook", async (req, res) => {
    if (!TELEGRAM_BOT_TOKEN) {
      return res.status(503).json({ error: "Telegram bot not configured" });
    }

    try {
      const update = req.body;
      console.log('Telegram webhook:', JSON.stringify(update, null, 2));
      
      const webAppUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : 'https://telegram-mini-app-showcase-production.up.railway.app';
      
      // Premium Welcome Message Helper
      const sendPremiumMessage = async (chatId: number, text: string, extraButtons: any[] = []) => {
        const keyboard = [
          [{ text: '💎 Launch Premium Suite', web_app: { url: webAppUrl } }],
          ...extraButtons
        ];
        
        return await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: keyboard }
          })
        });
      };
      
      // Handle callback queries from inline buttons
      if (update.callback_query) {
        const callbackQuery = update.callback_query;
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;
        
        // Answer callback query immediately
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id,
            text: '✨ Loading...'
          })
        });
        
        // Handle different callback actions
        if (data === 'showcase') {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `💎 <b>ПОРТФОЛИО ЭКСКЛЮЗИВНЫХ РЕШЕНИЙ</b>\n\n` +
                    `<i>Авторские приложения премиум-класса</i>\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `🏆 <b>FASHION & LUXURY</b>\n` +
                    `Gucci • Nike • Adidas • Premium Brands\n` +
                    `Индивидуальный дизайн для каждого бренда\n\n` +
                    `🍾 <b>HOSPITALITY & WELLNESS</b>\n` +
                    `Рестораны мирового уровня • Spa • Fitness\n` +
                    `Безупречный пользовательский опыт\n\n` +
                    `🤖 <b>AI-POWERED SOLUTIONS</b>\n` +
                    `Умные агенты • Персонализация • Аналитика\n` +
                    `Технологии завтрашнего дня — сегодня\n\n` +
                    `🏡 <b>REAL ESTATE & FINTECH</b>\n` +
                    `Недвижимость премиум-класса • Инвестиции\n` +
                    `Элитный сервис для элитных клиентов\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `<i>Откройте приложение для полного погружения</i>`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🚀 Открыть приложение', web_app: { url: webAppUrl } }],
                  [
                    { text: '💰 Рефералы', callback_data: 'referral' },
                    { text: '🎯 Задания', callback_data: 'tasks' }
                  ],
                  [{ text: '🏠 Главное меню', callback_data: 'start' }]
                ]
              }
            })
          });
        } else if (data === 'referral') {
          const telegramIdRef = Number(chatId);
          const referralStats = await db.select().from(referrals)
            .where(eq(referrals.referrerTelegramId, telegramIdRef));
          const totalReferrals = referralStats.length;
          const totalEarned = referralStats.reduce((sum, ref) => sum + Number(ref.bonusAmount || 0), 0);
          
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `🎁 <b>ПАРТНЁРСКАЯ ПРОГРАММА</b>\n\n` +
                    `<i>Эксклюзивные условия для наших партнёров</i>\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `💰 <b>ВАША СТАТИСТИКА</b>\n` +
                    `Приглашено: ${totalReferrals} чел.\n` +
                    `Заработано: ${totalEarned.toFixed(2)} RUB\n\n` +
                    `💎 <b>ПРЕМИАЛЬНЫЕ УСЛОВИЯ</b>\n` +
                    `• 20% от первого заказа партнёра\n` +
                    `• 10% пожизненные отчисления\n` +
                    `• Безлимитная партнёрская сеть\n` +
                    `• Моментальные выплаты\n\n` +
                    `🏆 <b>VIP СТАТУСЫ</b>\n` +
                    `Bronze: 5+ партнёров → +2% бонус\n` +
                    `Silver: 20+ партнёров → +5% бонус\n` +
                    `Gold: 50+ партнёров → +10% бонус\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `<i>Откройте приложение для вашей реферальной ссылки</i>`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🚀 Открыть приложение', web_app: { url: webAppUrl } }],
                  [
                    { text: '💎 Портфолио', callback_data: 'showcase' },
                    { text: '🎯 Задания', callback_data: 'tasks' }
                  ],
                  [{ text: '🏠 Главное меню', callback_data: 'start' }]
                ]
              }
            })
          });
        } else if (data === 'tasks') {
          const telegramIdTasks = Number(chatId);
          const [userData] = await db.select().from(users)
            .where(eq(users.telegramId, telegramIdTasks)).limit(1);
          const completedTasks = await db.select().from(tasksProgress)
            .where(and(
              eq(tasksProgress.telegramId, telegramIdTasks),
              eq(tasksProgress.completed, true)
            ));
          const availableTasks = await db.select().from(dailyTasks)
            .where(and(
              eq(dailyTasks.telegramId, telegramIdTasks),
              eq(dailyTasks.completed, false)
            ));
          
          const coins = userData?.availableCoins || 0;
          const level = userData?.level || 1;
          const streak = userData?.currentStreak || 0;
          
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `🎯 <b>ЗАДАНИЯ & ВОЗНАГРАЖДЕНИЯ</b>\n\n` +
                    `<i>Эксклюзивная система лояльности</i>\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `💎 <b>ВАШ БАЛАНС</b>\n` +
                    `${coins} монет • Уровень ${level}\n` +
                    `Серия: ${streak} дней 🔥\n\n` +
                    `✅ <b>ПРОГРЕСС</b>\n` +
                    `Выполнено: ${completedTasks.length} заданий\n` +
                    `Доступно: ${availableTasks.length} новых\n\n` +
                    `🏆 <b>КАТЕГОРИИ ЗАДАНИЙ</b>\n` +
                    `• Социальные сети — до 100 монет\n` +
                    `• Ежедневные миссии — до 250 монет\n` +
                    `• Партнёрская программа — до 500 монет\n` +
                    `• Эксклюзивные задания — до 1000 монет\n\n` +
                    `💰 <b>МОНЕТЫ → РАЗРАБОТКА</b>\n` +
                    `Используйте монеты для заказа вашего\n` +
                    `собственного Telegram приложения!\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `<i>Откройте приложение для выполнения заданий</i>`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🚀 Открыть приложение', web_app: { url: webAppUrl } }],
                  [
                    { text: '💰 Рефералы', callback_data: 'referral' },
                    { text: '👤 Профиль', callback_data: 'profile' }
                  ],
                  [{ text: '🏠 Главное меню', callback_data: 'start' }]
                ]
              }
            })
          });
        } else if (data === 'profile') {
          const telegramIdProfile = Number(chatId);
          const [profileUser] = await db.select().from(users)
            .where(eq(users.telegramId, telegramIdProfile)).limit(1);
          const profileReferrals = await db.select().from(referrals)
            .where(eq(referrals.referrerTelegramId, telegramIdProfile));
          const profileTasks = await db.select().from(tasksProgress)
            .where(and(
              eq(tasksProgress.telegramId, telegramIdProfile),
              eq(tasksProgress.completed, true)
            ));
          
          const userName = profileUser?.firstName || 'Пользователь';
          const userCoinsProfile = profileUser?.availableCoins || 0;
          const userLevelProfile = profileUser?.level || 1;
          const userXP = profileUser?.xp || 0;
          const userStreak = profileUser?.currentStreak || 0;
          const totalReferralsProfile = profileReferrals.length;
          const totalTasksProfile = profileTasks.length;
          
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `👤 <b>ЛИЧНЫЙ КАБИНЕТ VIP</b>\n\n` +
                    `<i>Добро пожаловать, ${userName}</i>\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `💎 <b>СТАТУС & ДОСТИЖЕНИЯ</b>\n` +
                    `Уровень: ${userLevelProfile} ⭐\n` +
                    `Опыт: ${userXP} XP\n` +
                    `Баланс: ${userCoinsProfile} монет\n` +
                    `Серия: ${userStreak} дней подряд 🔥\n\n` +
                    `📊 <b>СТАТИСТИКА</b>\n` +
                    `Выполнено заданий: ${totalTasksProfile}\n` +
                    `Приглашено партнёров: ${totalReferralsProfile}\n` +
                    `Активность: ${userStreak > 7 ? 'Высокая 🚀' : userStreak > 3 ? 'Средняя 📈' : 'Начальная 🌱'}\n\n` +
                    `🏆 <b>ВАШИ ПРИВИЛЕГИИ</b>\n` +
                    `• Доступ к эксклюзивным заданиям\n` +
                    `• Приоритетная поддержка 24/7\n` +
                    `• Персональные скидки на разработку\n` +
                    `• VIP-статус в партнёрской программе\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `<i>Откройте приложение для полной аналитики</i>`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🚀 Открыть приложение', web_app: { url: webAppUrl } }],
                  [
                    { text: '💰 Рефералы', callback_data: 'referral' },
                    { text: '🎯 Задания', callback_data: 'tasks' }
                  ],
                  [{ text: '🏠 Главное меню', callback_data: 'start' }]
                ]
              }
            })
          });
        } else if (data === 'help') {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `❓ <b>РУКОВОДСТВО VIP</b>\n\n` +
                    `<i>Навигация по эксклюзивной платформе</i>\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `🎯 <b>БЫСТРЫЙ СТАРТ</b>\n` +
                    `1. Откройте приложение через меню\n` +
                    `2. Изучите 18+ премиум решений\n` +
                    `3. Выполняйте задания → зарабатывайте\n` +
                    `4. Делитесь ссылкой → получайте бонусы\n` +
                    `5. Тратьте монеты на разработку\n\n` +
                    `💎 <b>КОМАНДЫ ПЛАТФОРМЫ</b>\n` +
                    `/start — Главное меню\n` +
                    `/showcase — Портфолио решений\n` +
                    `/referral — Партнёрская программа\n` +
                    `/tasks — Задания & награды\n` +
                    `/profile — Личный кабинет\n` +
                    `/help — Это руководство\n\n` +
                    `🏆 <b>VIP ПОДДЕРЖКА 24/7</b>\n` +
                    `Telegram: @YourSupportBot\n` +
                    `Приоритетное обслуживание\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `<i>Создано для амбициозных предпринимателей</i>`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🚀 Открыть приложение', web_app: { url: webAppUrl } }],
                  [
                    { text: '💎 Портфолио', callback_data: 'showcase' },
                    { text: '👤 Профиль', callback_data: 'profile' }
                  ],
                  [{ text: '🏠 Главное меню', callback_data: 'start' }]
                ]
              }
            })
          });
        } else if (data === 'start') {
          // Back to main menu
          const telegramIdNum = Number(chatId);
          const [userData] = await db.select().from(users).where(eq(users.telegramId, telegramIdNum)).limit(1);
          const userCoins = userData?.availableCoins || 0;
          const userLevel = userData?.level || 1;
          
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✨ <b>ЭКСКЛЮЗИВНАЯ СТУДИЯ</b>\n` +
                    `<b>TELEGRAM APPLICATIONS</b>\n\n` +
                    `<i>Создаём будущее вашего бизнеса</i>\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `🎨 <b>АВТОРСКИЙ ВИЗУАЛЬНЫЙ ДИЗАЙН</b>\n` +
                    `Уникальная эстетика, которой нет ни у кого.\n` +
                    `Каждый пиксель создан для превосходства.\n\n` +
                    `💼 <b>18+ ПРЕМИУМ РЕШЕНИЙ</b>\n` +
                    `Fashion • E-commerce • Wellness • AI\n` +
                    `Недвижимость • Рестораны • Финтех\n\n` +
                    `💎 <b>ВАШ СТАТУС</b>\n` +
                    `Уровень: ${userLevel} | Баланс: ${userCoins} монет\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n\n` +
                    `<i>Эксклюзивный доступ. Безупречное исполнение.</i>`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '🚀 Открыть приложение', web_app: { url: webAppUrl } }],
                  [
                    { text: '💎 Портфолио', callback_data: 'showcase' },
                    { text: '🎯 Задания', callback_data: 'tasks' }
                  ],
                  [
                    { text: '💰 Рефералы', callback_data: 'referral' },
                    { text: '👤 Профиль', callback_data: 'profile' }
                  ],
                  [{ text: '❓ Помощь', callback_data: 'help' }]
                ]
              }
            })
          });
        }
      }
      
      // Handle text messages and commands
      if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const command = update.message.text.split(' ')[0];
        
        switch(command) {
          case '/start':
            // Get or create user in database
            const telegramIdNum = Number(chatId);
            let user = await db.select().from(users).where(eq(users.telegramId, telegramIdNum)).limit(1);
            
            if (user.length === 0) {
              // Generate unique referral code
              const referralCode = `REF${telegramIdNum}`;
              
              // Create new user (all gamification and coins fields are now in users table)
              await db.insert(users).values({
                telegramId: telegramIdNum,
                username: update.message?.from?.username || null,
                firstName: update.message?.from?.first_name || null,
                lastName: update.message?.from?.last_name || null,
                referralCode
              });
              
              // Refresh user data after insert
              user = await db.select().from(users).where(eq(users.telegramId, telegramIdNum)).limit(1);
            }
            
            // Get user stats from users table (unified)
            const userCoins = user[0]?.availableCoins || 0;
            const userLevel = user[0]?.level || 1;
            
            // Send message with navigation buttons
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: `✨ <b>ЭКСКЛЮЗИВНАЯ СТУДИЯ</b>\n` +
                      `<b>TELEGRAM APPLICATIONS</b>\n\n` +
                      `<i>Создаём будущее вашего бизнеса</i>\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n\n` +
                      `🎨 <b>АВТОРСКИЙ ВИЗУАЛЬНЫЙ ДИЗАЙН</b>\n` +
                      `Уникальная эстетика, которой нет ни у кого.\n` +
                      `Каждый пиксель создан для превосходства.\n\n` +
                      `💼 <b>18+ ПРЕМИУМ РЕШЕНИЙ</b>\n` +
                      `Fashion • E-commerce • Wellness • AI\n` +
                      `Недвижимость • Рестораны • Финтех\n\n` +
                      `💎 <b>ВАШ СТАТУС</b>\n` +
                      `Уровень: ${userLevel} | Баланс: ${userCoins} монет\n\n` +
                      `━━━━━━━━━━━━━━━━━━━━\n\n` +
                      `<i>Эксклюзивный доступ. Безупречное исполнение.</i>`,
                parse_mode: 'HTML',
                reply_markup: {
                  inline_keyboard: [
                    [
                      { text: '🚀 Открыть приложение', web_app: { url: webAppUrl } }
                    ],
                    [
                      { text: '💎 Портфолио', callback_data: 'showcase' },
                      { text: '🎯 Задания', callback_data: 'tasks' }
                    ],
                    [
                      { text: '💰 Рефералы', callback_data: 'referral' },
                      { text: '👤 Профиль', callback_data: 'profile' }
                    ],
                    [
                      { text: '❓ Помощь', callback_data: 'help' }
                    ]
                  ]
                }
              })
            });
            break;
            
          case '/showcase':
            await sendPremiumMessage(
              chatId,
              `💎 <b>ПОРТФОЛИО ЭКСКЛЮЗИВНЫХ РЕШЕНИЙ</b>\n\n` +
              `<i>Авторские приложения премиум-класса</i>\n\n` +
              `━━━━━━━━━━━━━━━━━━━━\n\n` +
              `🏆 <b>FASHION & LUXURY</b>\n` +
              `Gucci • Nike • Adidas • Premium Brands\n` +
              `Индивидуальный дизайн для каждого бренда\n\n` +
              `🍾 <b>HOSPITALITY & WELLNESS</b>\n` +
              `Рестораны мирового уровня • Spa • Fitness\n` +
              `Безупречный пользовательский опыт\n\n` +
              `🤖 <b>AI-POWERED SOLUTIONS</b>\n` +
              `Умные агенты • Персонализация • Аналитика\n` +
              `Технологии завтрашнего дня — сегодня\n\n` +
              `🏡 <b>REAL ESTATE & FINTECH</b>\n` +
              `Недвижимость премиум-класса • Инвестиции\n` +
              `Элитный сервис для элитных клиентов\n\n` +
              `━━━━━━━━━━━━━━━━━━━━\n\n` +
              `<i>Откройте приложение для полного погружения</i>`
            );
            break;
            
          case '/referral':
            // Get referral stats
            const telegramIdRef = Number(chatId);
            const referralStats = await db.select().from(referrals)
              .where(eq(referrals.referrerTelegramId, telegramIdRef));
            const totalReferrals = referralStats.length;
            const totalEarned = referralStats.reduce((sum, ref) => sum + Number(ref.bonusAmount || 0), 0);
            
            await sendPremiumMessage(
              chatId,
              `🎁 <b>ПАРТНЁРСКАЯ ПРОГРАММА</b>\n\n` +
              `<i>Эксклюзивные условия для наших партнёров</i>\n\n` +
              `━━━━━━━━━━━━━━━━━━━━\n\n` +
              `💰 <b>ВАША СТАТИСТИКА</b>\n` +
              `Приглашено: ${totalReferrals} чел.\n` +
              `Заработано: ${totalEarned.toFixed(2)} RUB\n\n` +
              `💎 <b>ПРЕМИАЛЬНЫЕ УСЛОВИЯ</b>\n` +
              `• 20% от первого заказа партнёра\n` +
              `• 10% пожизненные отчисления\n` +
              `• Безлимитная партнёрская сеть\n` +
              `• Моментальные выплаты\n\n` +
              `🏆 <b>VIP СТАТУСЫ</b>\n` +
              `Bronze: 5+ партнёров → +2% бонус\n` +
              `Silver: 20+ партнёров → +5% бонус\n` +
              `Gold: 50+ партнёров → +10% бонус\n\n` +
              `━━━━━━━━━━━━━━━━━━━━\n\n` +
              `<i>Откройте приложение для вашей реферальной ссылки</i>`
            );
            break;
            
          case '/tasks':
            // Get user tasks stats (теперь из объединенной таблицы users)
            const telegramIdTasks = Number(chatId);
            const [tasksUserData] = await db.select().from(users)
              .where(eq(users.telegramId, telegramIdTasks)).limit(1);
            const completedTasks = await db.select().from(tasksProgress)
              .where(and(
                eq(tasksProgress.telegramId, telegramIdTasks),
                eq(tasksProgress.completed, true)
              ));
            // Get available tasks for THIS user only
            const availableTasks = await db.select().from(dailyTasks)
              .where(and(
                eq(dailyTasks.telegramId, telegramIdTasks),
                eq(dailyTasks.completed, false)
              ));
            
            const coins = tasksUserData?.availableCoins || 0;
            const level = tasksUserData?.level || 1;
            const streak = tasksUserData?.currentStreak || 0;
            
            await sendPremiumMessage(
              chatId,
              `🎯 <b>ЗАДАНИЯ & ВОЗНАГРАЖДЕНИЯ</b>\n\n` +
              `<i>Эксклюзивная система лояльности</i>\n\n` +
              `━━━━━━━━━━━━━━━━━━━━\n\n` +
              `💎 <b>ВАШ БАЛАНС</b>\n` +
              `${coins} монет • Уровень ${level}\n` +
              `Серия: ${streak} дней 🔥\n\n` +
              `✅ <b>ПРОГРЕСС</b>\n` +
              `Выполнено: ${completedTasks.length} заданий\n` +
              `Доступно: ${availableTasks.length} новых\n\n` +
              `🏆 <b>КАТЕГОРИИ ЗАДАНИЙ</b>\n` +
              `• Социальные сети — до 100 монет\n` +
              `• Ежедневные миссии — до 250 монет\n` +
              `• Партнёрская программа — до 500 монет\n` +
              `• Эксклюзивные задания — до 1000 монет\n\n` +
              `💰 <b>МОНЕТЫ → РАЗРАБОТКА</b>\n` +
              `Используйте монеты для заказа вашего\n` +
              `собственного Telegram приложения!\n\n` +
              `━━━━━━━━━━━━━━━━━━━━\n\n` +
              `<i>Откройте приложение для выполнения заданий</i>`
            );
            break;
            
          case '/profile':
            // Get full user profile (теперь из объединенной таблицы users)
            const telegramIdProfile = Number(chatId);
            const [profileUserData] = await db.select().from(users)
              .where(eq(users.telegramId, telegramIdProfile)).limit(1);
            const profileReferrals = await db.select().from(referrals)
              .where(eq(referrals.referrerTelegramId, telegramIdProfile));
            const profileTasks = await db.select().from(tasksProgress)
              .where(and(
                eq(tasksProgress.telegramId, telegramIdProfile),
                eq(tasksProgress.completed, true)
              ));
            
            const userName = profileUserData?.firstName || 'Пользователь';
            const userCoinsProfile = profileUserData?.availableCoins || 0;
            const userLevelProfile = profileUserData?.level || 1;
            const userXP = profileUserData?.xp || 0;
            const userStreak = profileUserData?.currentStreak || 0;
            const totalReferralsProfile = profileReferrals.length;
            const totalTasksProfile = profileTasks.length;
            
            await sendPremiumMessage(
              chatId,
              `👤 <b>ЛИЧНЫЙ КАБИНЕТ VIP</b>\n\n` +
              `<i>Добро пожаловать, ${userName}</i>\n\n` +
              `━━━━━━━━━━━━━━━━━━━━\n\n` +
              `💎 <b>СТАТУС & ДОСТИЖЕНИЯ</b>\n` +
              `Уровень: ${userLevelProfile} ⭐\n` +
              `Опыт: ${userXP} XP\n` +
              `Баланс: ${userCoinsProfile} монет\n` +
              `Серия: ${userStreak} дней подряд 🔥\n\n` +
              `📊 <b>СТАТИСТИКА</b>\n` +
              `Выполнено заданий: ${totalTasksProfile}\n` +
              `Приглашено партнёров: ${totalReferralsProfile}\n` +
              `Активность: ${userStreak > 7 ? 'Высокая 🚀' : userStreak > 3 ? 'Средняя 📈' : 'Начальная 🌱'}\n\n` +
              `🏆 <b>ВАШИ ПРИВИЛЕГИИ</b>\n` +
              `• Доступ к эксклюзивным заданиям\n` +
              `• Приоритетная поддержка 24/7\n` +
              `• Персональные скидки на разработку\n` +
              `• VIP-статус в партнёрской программе\n\n` +
              `━━━━━━━━━━━━━━━━━━━━\n\n` +
              `<i>Откройте приложение для полной аналитики</i>`
            );
            break;
            
          case '/help':
            await sendPremiumMessage(
              chatId,
              `❓ <b>РУКОВОДСТВО VIP</b>\n\n` +
              `<i>Навигация по эксклюзивной платформе</i>\n\n` +
              `━━━━━━━━━━━━━━━━━━━━\n\n` +
              `🎯 <b>БЫСТРЫЙ СТАРТ</b>\n` +
              `1. Откройте приложение через меню\n` +
              `2. Изучите 18+ премиум решений\n` +
              `3. Выполняйте задания → зарабатывайте\n` +
              `4. Делитесь ссылкой → получайте бонусы\n` +
              `5. Тратьте монеты на разработку\n\n` +
              `💎 <b>КОМАНДЫ ПЛАТФОРМЫ</b>\n` +
              `/start — Главное меню\n` +
              `/showcase — Портфолио решений\n` +
              `/referral — Партнёрская программа\n` +
              `/tasks — Задания & награды\n` +
              `/profile — Личный кабинет\n` +
              `/help — Это руководство\n\n` +
              `🏆 <b>VIP ПОДДЕРЖКА 24/7</b>\n` +
              `Telegram: @YourSupportBot\n` +
              `Приоритетное обслуживание\n\n` +
              `━━━━━━━━━━━━━━━━━━━━\n\n` +
              `<i>Создано для амбициозных предпринимателей</i>`
            );
            break;
            
          default:
            // Unknown command - show help
            if (command.startsWith('/')) {
              await sendPremiumMessage(
                chatId,
                `🤔 <b>Неизвестная команда</b>\n\n` +
                `Извините, я не понимаю эту команду.\n\n` +
                `Попробуйте одну из этих:\n` +
                `/start - Главное меню\n` +
                `/showcase - Каталог приложений\n` +
                `/help - Помощь`
              );
            }
        }
      }
      
      res.json({ ok: true });
    } catch (error: any) {
      console.error('Telegram webhook error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Set Telegram bot commands
  app.post("/api/telegram/setup", async (req, res) => {
    if (!TELEGRAM_BOT_TOKEN) {
      return res.status(503).json({ error: "Telegram bot not configured" });
    }

    try {
      const webAppUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : 'https://telegram-mini-app-showcase-production.up.railway.app';
      
      // Set bot menu commands
      const commandsResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commands: [
            { command: 'start', description: '🏠 Запустить Telegram Mini Apps' },
            { command: 'showcase', description: '💎 Открыть каталог приложений' },
            { command: 'referral', description: '💰 Реферальная программа' },
            { command: 'tasks', description: '🎯 Задания и награды' },
            { command: 'profile', description: '👤 Мой профиль' },
            { command: 'help', description: '❓ Помощь' }
          ]
        })
      });

      // Set webhook
      const webhookUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/telegram/webhook`
        : process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}/api/telegram/webhook`
        : 'https://telegram-mini-app-showcase-production.up.railway.app/api/telegram/webhook';
      const webhookResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl
        })
      });

      const commandsResult = await commandsResponse.json();
      const webhookResult = await webhookResponse.json();
      
      res.json({
        success: true,
        webAppUrl,
        webhookUrl,
        commands: commandsResult,
        webhook: webhookResult
      });
    } catch (error: any) {
      console.error('Telegram setup error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Service Worker Reset Endpoint - CRITICAL for Railway black screen fix
  // This endpoint is served with headers that prevent SW caching
  // It helps users escape from stuck service workers
  app.get("/sw-reset", (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Clear-Site-Data', '"cache", "storage"');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Resetting...</title>
  <meta charset="UTF-8">
  <style>
    body { 
      background: #0A0A0B; 
      color: #10B981; 
      font-family: system-ui; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      margin: 0; 
    }
    .container { text-align: center; }
    .spinner { 
      border: 4px solid rgba(16, 185, 129, 0.3);
      border-top: 4px solid #10B981;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Clearing cache and reloading...</h2>
    <p>Please wait a moment</p>
  </div>
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        Promise.all(regs.map(reg => reg.unregister()))
          .then(() => console.log('[SW-Reset] Unregistered all workers'));
      });
      
      if ('caches' in window) {
        caches.keys().then(names => {
          Promise.all(names.map(name => caches.delete(name)))
            .then(() => console.log('[SW-Reset] Cleared all caches'));
        });
      }
    }
    
    // Redirect to home after 2 seconds
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  </script>
</body>
</html>
    `);
  });

  // Get Telegram bot info
  app.get("/api/telegram/info", async (req, res) => {
    if (!TELEGRAM_BOT_TOKEN) {
      return res.status(503).json({ error: "Telegram bot not configured" });
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
      const botInfo = await response.json();
      
      const webAppUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : 'https://telegram-mini-app-showcase-production.up.railway.app';
      
      res.json({
        bot: botInfo.result,
        webAppUrl,
        configured: true
      });
    } catch (error: any) {
      console.error('Telegram info error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", verifyTelegramUser, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ 
        error: "Payment processing is not available. Stripe not configured." 
      });
    }

    try {
      const { amount, project_name, features } = req.body;
      
      // Convert amount to cents (Stripe expects cents)
      const amountInCents = Math.round(amount * 100);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "rub", // Russian Ruble
        metadata: {
          project_name: project_name || 'WEB4TG Project',
          features: JSON.stringify(features || []),
          service: 'WEB4TG Development'
        },
        description: `WEB4TG Development: ${project_name}`,
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error('Stripe payment intent creation error:', error);
      res.status(500).json({ 
        error: "Error creating payment intent: " + error.message 
      });
    }
  });

  // Payment success webhook (for future use)
  app.post("/api/payment-success", verifyTelegramUser, async (req: any, res) => {
    try {
      const { paymentIntentId, projectName, features } = req.body;
      
      // Here you would typically:
      // 1. Verify payment with Stripe
      // 2. Create project record in database
      // 3. Send confirmation email
      // 4. Trigger development workflow
      
      console.log('Payment successful for project:', projectName);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Payment success handling error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Health check for payment system
  app.get("/api/payment-status", (req, res) => {
    res.json({ 
      stripe_available: !!stripe,
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // In-memory storage for user projects (in production use database)
  const userProjects = new Map<string, any[]>();

  // Получение проектов пользователя по Telegram ID
  app.get("/api/user-projects/:telegramId", (req, res) => {
    try {
      const { telegramId } = req.params;
      
      // Получаем проекты пользователя из памяти
      const projects = userProjects.get(telegramId) || [];
      
      res.json(projects);
    } catch (error) {
      console.error('Error fetching user projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  // Создание нового проекта после оплаты
  app.post("/api/create-project", (req, res) => {
    try {
      const { telegramId, projectName, projectType, features, paymentIntentId } = req.body;
      
      // Создаем новый проект
      const newProject = {
        id: Date.now(),
        name: projectName || 'Новый проект',
        type: projectType || 'basic',
        status: 'Оплачено',
        progress: 10,
        createdAt: new Date().toISOString(),
        features: features || [],
        paymentIntentId,
        telegramUserId: telegramId
      };
      
      // Сохраняем проект
      const existingProjects = userProjects.get(telegramId) || [];
      existingProjects.push(newProject);
      userProjects.set(telegramId, existingProjects);
      
      console.log(`Created project for user ${telegramId}:`, projectName);
      res.json({ success: true, project: newProject });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  // Обновление статуса проекта (для имитации прогресса разработки)
  app.post("/api/update-project-status", (req, res) => {
    try {
      const { telegramId, projectId, status, progress } = req.body;
      
      const projects = userProjects.get(telegramId) || [];
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex !== -1) {
        projects[projectIndex].status = status || projects[projectIndex].status;
        projects[projectIndex].progress = progress !== undefined ? progress : projects[projectIndex].progress;
        projects[projectIndex].updatedAt = new Date().toISOString();
        
        userProjects.set(telegramId, projects);
        
        res.json({ success: true, project: projects[projectIndex] });
      } else {
        res.status(404).json({ error: 'Project not found' });
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  });

  // Добавление тестовых данных (для демонстрации)
  app.post("/api/init-demo-projects/:telegramId", (req, res) => {
    try {
      const { telegramId } = req.params;
      
      const demoProjects = [
        {
          id: 1001,
          name: 'Магазин одежды',
          type: 'ecommerce',
          status: 'В разработке',
          progress: 75,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          features: ['catalog', 'cart', 'payment'],
          telegramUserId: telegramId
        },
        {
          id: 1002,
          name: 'Ресторан доставки',
          type: 'restaurant',
          status: 'Готово',
          progress: 100,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          features: ['menu', 'orders', 'delivery'],
          telegramUserId: telegramId
        },
        {
          id: 1003,
          name: 'Фитнес-клуб',
          type: 'fitness',
          status: 'Планирование',
          progress: 25,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          features: ['booking', 'memberships'],
          telegramUserId: telegramId
        }
      ];
      
      userProjects.set(telegramId, demoProjects);
      
      res.json({ success: true, projects: demoProjects });
    } catch (error) {
      console.error('Error initializing demo projects:', error);
      res.status(500).json({ error: 'Failed to initialize demo projects' });
    }
  });

  // ============ PHOTO GALLERY API ============
  // Referenced from javascript_object_storage blueprint

  // Endpoint для получения presigned URL для загрузки фотографии
  app.post("/api/photos/upload-url", verifyTelegramUser, async (req: any, res) => {
    try {
      // Validate file size and type if provided
      const validationResult = uploadUrlSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: 'Invalid request body', details: validationResult.error.errors });
      }
      
      const { fileSize, fileType } = validationResult.data;
      
      // Validate file size
      if (fileSize !== undefined && fileSize > MAX_FILE_SIZE) {
        return res.status(400).json({ 
          error: 'File too large', 
          message: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
          maxSize: MAX_FILE_SIZE
        });
      }
      
      // Validate file type
      if (fileType !== undefined && !ALLOWED_TYPES.includes(fileType)) {
        return res.status(400).json({ 
          error: 'Invalid file type', 
          message: `Allowed types: ${ALLOWED_TYPES.join(', ')}`,
          allowedTypes: ALLOWED_TYPES
        });
      }
      
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error('Error getting upload URL:', error);
      res.status(500).json({ error: 'Failed to get upload URL' });
    }
  });

  // Endpoint для сохранения метаданных фотографии после загрузки
  app.post("/api/photos", verifyTelegramUser, async (req: any, res) => {
    try {
      const validatedData = insertPhotoSchema.parse(req.body);
      
      // Normalize the object path from the upload URL
      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(validatedData.objectPath);
      
      // Устанавливаем ACL политику (публичный доступ для фотографий)
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        validatedData.objectPath,
        {
          owner: validatedData.userId || "anonymous",
          visibility: "public",
        }
      );

      // Сохраняем метаданные в БД
      const [photo] = await db.insert(photos).values({
        ...validatedData,
        objectPath: objectPath,
      }).returning();

      res.json(photo);
    } catch (error) {
      console.error('Error creating photo:', error);
      res.status(500).json({ error: 'Failed to create photo' });
    }
  });

  // Endpoint для получения всех фотографий
  app.get("/api/photos", async (req, res) => {
    try {
      const allPhotos = await db.select().from(photos).orderBy(desc(photos.uploadedAt));
      res.json(allPhotos);
    } catch (error) {
      console.error('Error fetching photos:', error);
      res.status(500).json({ error: 'Failed to fetch photos' });
    }
  });

  // Endpoint для получения конкретной фотографии по ID
  app.get("/api/photos/:id", async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const [photo] = await db.select().from(photos).where(eq(photos.id, photoId));
      
      if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
      }
      
      res.json(photo);
    } catch (error) {
      console.error('Error fetching photo:', error);
      res.status(500).json({ error: 'Failed to fetch photo' });
    }
  });

  // Endpoint для скачивания фотографии (публичный доступ)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error downloading object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Endpoint для удаления фотографии
  app.delete("/api/photos/:id", verifyTelegramUser, async (req: any, res) => {
    try {
      const photoId = parseInt(req.params.id);
      const [deletedPhoto] = await db.delete(photos).where(eq(photos.id, photoId)).returning();
      
      if (!deletedPhoto) {
        return res.status(404).json({ error: 'Photo not found' });
      }
      
      res.json({ success: true, photo: deletedPhoto });
    } catch (error) {
      console.error('Error deleting photo:', error);
      res.status(500).json({ error: 'Failed to delete photo' });
    }
  });

  // ============ TASKS VERIFICATION API ============

  // Endpoint для проверки подписки на Telegram канал
  app.post("/api/tasks/verify-telegram-subscription", verifyTelegramUser, async (req: any, res) => {
    try {
      if (!TELEGRAM_BOT_TOKEN) {
        return res.status(503).json({ error: 'Telegram bot not configured' });
      }

      const { telegramId, channelUsername } = req.body;
      const authTelegramId = req.telegramUser.id;

      // Security: if telegramId is provided in body, it must match authenticated user
      if (telegramId !== undefined && Number(telegramId) !== authTelegramId) {
        console.log(`[Tasks] Security violation: body telegramId ${telegramId} does not match auth ${authTelegramId}`);
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Cannot verify subscription for another user'
        });
      }

      const userTelegramId = authTelegramId;

      if (!channelUsername) {
        return res.status(400).json({ error: 'channelUsername is required' });
      }

      // Normalize channel username (add @ if not present)
      const normalizedChannel = channelUsername.startsWith('@') ? channelUsername : `@${channelUsername}`;

      console.log(`[Tasks] Verifying subscription: user ${userTelegramId} to channel ${normalizedChannel}`);

      // Call Telegram Bot API getChatMember
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMember`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: normalizedChannel,
          user_id: userTelegramId
        })
      });

      const result = await response.json();

      if (!result.ok) {
        console.log(`[Tasks] Telegram API error:`, result.description);
        const errorDesc = result.description || '';
        
        // If user is not found or not a member
        if (errorDesc.includes('user not found') || 
            errorDesc.includes('USER_NOT_PARTICIPANT') ||
            errorDesc.includes('PARTICIPANT_NOT_FOUND')) {
          return res.json({
            subscribed: false,
            status: 'not_member',
            message: 'Вы не подписаны на канал. Пожалуйста, подпишитесь и попробуйте снова.'
          });
        }

        // If bot doesn't have admin rights
        if (errorDesc.includes('CHAT_ADMIN_REQUIRED') || 
            errorDesc.includes('member list is inaccessible')) {
          console.error(`[Tasks] Bot is not admin in channel ${normalizedChannel}`);
          return res.status(400).json({
            error: 'bot_not_admin',
            message: 'Не удалось проверить подписку. Бот не имеет прав администратора в канале.'
          });
        }

        // If channel doesn't exist
        if (errorDesc.includes('chat not found') || errorDesc.includes('CHAT_NOT_FOUND')) {
          return res.status(400).json({
            error: 'channel_not_found',
            message: 'Канал не найден. Проверьте правильность имени канала.'
          });
        }

        // Other errors
        return res.status(400).json({
          error: 'telegram_api_error',
          message: 'Ошибка проверки подписки. Попробуйте позже.'
        });
      }

      const memberStatus = result.result?.status;
      const isSubscribed = ['creator', 'administrator', 'member'].includes(memberStatus);

      console.log(`[Tasks] Subscription check result: user ${userTelegramId}, channel ${normalizedChannel}, status: ${memberStatus}, subscribed: ${isSubscribed}`);

      res.json({
        subscribed: isSubscribed,
        status: memberStatus,
        message: isSubscribed ? 'Подписка подтверждена!' : 'Вы не подписаны на канал'
      });

    } catch (error) {
      console.error('[Tasks] Error verifying telegram subscription:', error);
      res.status(500).json({ error: 'Failed to verify subscription' });
    }
  });

  // Endpoint для выполнения задания и начисления монет
  app.post("/api/tasks/complete", verifyTelegramUser, async (req: any, res) => {
    try {
      const authTelegramId = req.telegramUser.id;
      const { telegramId: bodyTelegramId, task_id, platform, coins_reward, channelUsername } = req.body;

      // Security: if telegramId is provided in body, it must match authenticated user
      if (bodyTelegramId !== undefined && Number(bodyTelegramId) !== authTelegramId) {
        console.log(`[Tasks] Security violation: body telegramId ${bodyTelegramId} does not match auth ${authTelegramId}`);
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Cannot complete task for another user'
        });
      }

      const telegramId = authTelegramId;

      if (!task_id || !platform || coins_reward === undefined) {
        return res.status(400).json({ error: 'task_id, platform, and coins_reward are required' });
      }

      console.log(`[Tasks] Completing task: user ${telegramId}, task ${task_id}, platform ${platform}, reward ${coins_reward}`);

      const today = new Date().toISOString().split('T')[0];
      
      // Check if task was already completed
      const [existingProgress] = await db.select().from(tasksProgress)
        .where(and(
          eq(tasksProgress.telegramId, telegramId),
          eq(tasksProgress.taskId, task_id),
          eq(tasksProgress.completed, true)
        ));

      if (existingProgress) {
        // For daily tasks, check if completed today
        if (platform.toLowerCase() === 'daily') {
          const completedDate = existingProgress.completedAt?.toISOString().split('T')[0];
          if (completedDate === today) {
            console.log(`[Tasks] Daily task ${task_id} already completed today by user ${telegramId}`);
            return res.status(400).json({ 
              error: 'Daily task already completed today',
              message: 'This daily task was already completed today. Try again tomorrow!'
            });
          }
          // If completed on a different day, allow re-completion
          console.log(`[Tasks] Daily task ${task_id} completed on ${completedDate}, allowing new completion for today`);
        } else {
          // For regular tasks, don't allow re-completion
          console.log(`[Tasks] Task ${task_id} already completed by user ${telegramId}`);
          return res.status(400).json({ 
            error: 'Task already completed',
            message: 'This task has already been completed'
          });
        }
      }

      // For Telegram tasks, verify subscription automatically
      if (platform.toLowerCase() === 'telegram' && channelUsername) {
        if (!TELEGRAM_BOT_TOKEN) {
          return res.status(503).json({ error: 'Telegram bot not configured' });
        }

        const normalizedChannel = channelUsername.startsWith('@') ? channelUsername : `@${channelUsername}`;
        
        console.log(`[Tasks] Auto-verifying subscription for task ${task_id}: user ${telegramId} to channel ${normalizedChannel}`);

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMember`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: normalizedChannel,
            user_id: telegramId
          })
        });

        const result = await response.json();

        if (!result.ok) {
          console.log(`[Tasks] Telegram verification failed:`, result.description);
          const errorDesc = result.description || '';
          
          // Handle USER_NOT_PARTICIPANT explicitly
          if (errorDesc.includes('USER_NOT_PARTICIPANT') || 
              errorDesc.includes('PARTICIPANT_NOT_FOUND') ||
              errorDesc.includes('user not found')) {
            return res.status(400).json({
              error: 'not_subscribed',
              subscribed: false,
              message: 'Вы не подписаны на канал. Пожалуйста, подпишитесь и попробуйте снова.'
            });
          }
          
          // Handle bot not admin
          if (errorDesc.includes('CHAT_ADMIN_REQUIRED') || 
              errorDesc.includes('member list is inaccessible')) {
            console.error(`[Tasks] Bot is not admin in channel ${normalizedChannel}`);
            return res.status(400).json({
              error: 'bot_not_admin',
              subscribed: false,
              message: 'Не удалось проверить подписку. Бот не имеет прав администратора в канале.'
            });
          }
          
          // Handle channel not found
          if (errorDesc.includes('chat not found') || errorDesc.includes('CHAT_NOT_FOUND')) {
            return res.status(400).json({
              error: 'channel_not_found',
              subscribed: false,
              message: 'Канал не найден. Проверьте правильность имени канала.'
            });
          }
          
          return res.status(400).json({
            error: 'telegram_api_error',
            subscribed: false,
            message: 'Ошибка проверки подписки. Попробуйте позже.'
          });
        }

        const memberStatus = result.result?.status;
        const isSubscribed = ['creator', 'administrator', 'member'].includes(memberStatus);

        if (!isSubscribed) {
          console.log(`[Tasks] User ${telegramId} is not subscribed to ${normalizedChannel} (status: ${memberStatus})`);
          return res.status(400).json({
            error: 'not_subscribed',
            subscribed: false,
            status: memberStatus,
            message: 'Пожалуйста, сначала подпишитесь на канал'
          });
        }

        console.log(`[Tasks] Subscription verified: user ${telegramId} is ${memberStatus} of ${normalizedChannel}`);
      }

      // Save task progress as completed using upsert to avoid duplicates
      const [taskProgress] = await db.insert(tasksProgress).values({
        telegramId: telegramId,
        taskId: task_id,
        platform: platform,
        taskType: platform.toLowerCase() === 'telegram' ? 'subscription' : 'social',
        coinsReward: coins_reward,
        completed: true,
        verificationStatus: 'verified',
        attempts: 1,
        lastAttemptAt: new Date(),
        startedAt: new Date(),
        completedAt: new Date(),
        verificationData: { platform, channelUsername }
      })
      .onConflictDoUpdate({
        target: [tasksProgress.telegramId, tasksProgress.taskId],
        set: {
          completed: true,
          verificationStatus: 'verified',
          completedAt: new Date(),
          lastAttemptAt: new Date(),
          attempts: sql`${tasksProgress.attempts} + 1`,
          verificationData: { platform, channelUsername }
        }
      })
      .returning();

      console.log(`[Tasks] Task progress saved (upsert): id ${taskProgress.id}`);

      // Update user coins balance (now in users table)
      let [userData] = await db.select().from(users)
        .where(eq(users.telegramId, telegramId));

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update existing user balance
      const [updatedUser] = await db.update(users)
        .set({
          totalCoins: (userData.totalCoins || 0) + coins_reward,
          availableCoins: (userData.availableCoins || 0) + coins_reward,
          completedTasks: (userData.completedTasks || 0) + 1,
          updatedAt: new Date()
        })
        .where(eq(users.telegramId, telegramId))
        .returning();

      console.log(`[Tasks] Updated balance for user ${telegramId}: +${coins_reward} coins, total: ${updatedUser.availableCoins}`);

      // Handle streak for daily tasks
      let streakValue = updatedUser.currentStreak || 0;
      const todayForStreak = new Date().toISOString().split('T')[0];
      
      if (platform.toLowerCase() === 'daily') {
        // Get lastVisitDate - handle both Date objects and strings
        let lastActivityStr: string | null = null;
        if (updatedUser.lastVisitDate) {
          if (typeof updatedUser.lastVisitDate === 'string') {
            lastActivityStr = updatedUser.lastVisitDate;
          } else if (updatedUser.lastVisitDate && typeof (updatedUser.lastVisitDate as any).toISOString === 'function') {
            lastActivityStr = (updatedUser.lastVisitDate as Date).toISOString().split('T')[0];
          } else {
            lastActivityStr = String(updatedUser.lastVisitDate);
          }
        }
        
        // Check if last activity was yesterday - continue streak
        if (lastActivityStr) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (lastActivityStr === yesterdayStr) {
            // Last activity was yesterday - increment streak
            streakValue += 1;
            console.log(`[Tasks] Streak incremented: yesterday was ${yesterdayStr}, new streak: ${streakValue}`);
          } else if (lastActivityStr === todayForStreak) {
            // Already updated today, keep current streak
            console.log(`[Tasks] Already completed daily task today, keeping streak: ${streakValue}`);
          } else {
            // More than a day gap - reset streak
            streakValue = 1;
            console.log(`[Tasks] Streak reset: last activity was ${lastActivityStr}, more than 1 day ago`);
          }
        } else {
          // First daily task ever
          streakValue = 1;
          console.log(`[Tasks] First daily task, starting streak: 1`);
        }
        
        // Update streak in database (now in users table)
        await db.update(users)
          .set({ 
            currentStreak: streakValue,
            bestStreak: Math.max(updatedUser.bestStreak || 1, streakValue),
            lastVisitDate: todayForStreak
          })
          .where(eq(users.telegramId, telegramId));
        
        console.log(`[Tasks] Streak updated for user ${telegramId}: ${streakValue} days`);
      }

      res.json({
        success: true,
        coins_awarded: coins_reward,
        task_id: task_id,
        new_balance: updatedUser.availableCoins,
        total_tasks_completed: updatedUser.completedTasks,
        streak: streakValue
      });

    } catch (error) {
      console.error('[Tasks] Error completing task:', error);
      res.status(500).json({ error: 'Failed to complete task' });
    }
  });

  // Endpoint для получения прогресса заданий пользователя
  app.get("/api/user/:telegramId/tasks-progress", verifyTelegramUser, async (req: any, res) => {
    try {
      const telegramId = parseInt(req.params.telegramId);
      const authTelegramId = req.telegramUser.id;

      // Security: only allow users to fetch their own progress
      if (telegramId !== authTelegramId) {
        return res.status(403).json({ error: 'Not authorized to view this user\'s progress' });
      }

      // Get completed tasks
      const completedTasksProgress = await db.select()
        .from(tasksProgress)
        .where(and(
          eq(tasksProgress.telegramId, telegramId),
          eq(tasksProgress.completed, true)
        ));

      const completedTaskIds = completedTasksProgress.map(t => t.taskId);

      // Get user data for streak info (now from users table)
      const [userData] = await db.select()
        .from(users)
        .where(eq(users.telegramId, telegramId));

      console.log(`[Tasks] Loaded progress for user ${telegramId}: ${completedTaskIds.length} completed tasks, streak: ${userData?.currentStreak || 0}`);

      res.json({
        completedTasks: completedTaskIds,
        totalCoins: userData?.availableCoins || 0,
        streak: userData?.currentStreak || 0,
        tasksCompleted: userData?.completedTasks || 0
      });

    } catch (error) {
      console.error('[Tasks] Error loading tasks progress:', error);
      res.status(500).json({ error: 'Failed to load progress' });
    }
  });

  // ===== REFERRAL PROGRAM API =====

  // Генерация уникального реферального кода
  function generateReferralCode(): string {
    return 'WEB4TG' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Определение уровня по количеству рефералов
  function calculateTier(totalReferrals: number): string {
    if (totalReferrals >= 100) return 'Platinum';
    if (totalReferrals >= 30) return 'Gold';
    if (totalReferrals >= 10) return 'Silver';
    return 'Bronze';
  }

  // Рассчитать XP для следующего уровня
  function calculateXpToNextLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  // Инициализация пользователя (создание или получение)
  app.post("/api/referrals/user/init", verifyTelegramUser, async (req: any, res) => {
    try {
      const telegram_id = req.telegramUser.id;
      const username = req.telegramUser.username;
      const first_name = req.telegramUser.first_name;
      const last_name = req.telegramUser.last_name;
      const { referred_by_code } = req.body;

      if (!telegram_id) {
        return res.status(400).json({ error: 'telegram_id is required' });
      }

      // Проверить, существует ли пользователь
      const [existingUser] = await db.select().from(users).where(eq(users.telegramId, telegram_id));

      if (existingUser) {
        return res.json(existingUser);
      }

      // Создать нового пользователя
      const referralCode = generateReferralCode();
      
      const [newUser] = await db.insert(users).values({
        telegramId: telegram_id,
        username,
        firstName: first_name,
        lastName: last_name,
        referralCode: referralCode,
        referredByCode: referred_by_code || null,
      }).returning();

      // Если пользователь был приглашен, создать запись в referrals
      if (referred_by_code) {
        const [referrer] = await db.select().from(users).where(eq(users.referralCode, referred_by_code));

        if (referrer) {
          // Создать запись реферала
          await db.insert(referrals).values({
            referrerTelegramId: referrer.telegramId,
            referredTelegramId: telegram_id,
            bonusAmount: "100",
            status: 'active',
          });

          // Обновить статистику реферера
          const newTotalReferrals = (referrer.totalReferrals || 0) + 1;
          await db.update(users)
            .set({
              totalReferrals: newTotalReferrals,
              activeReferrals: (referrer.activeReferrals || 0) + 1,
              totalEarnings: sql`${users.totalEarnings} + 100`,
              tier: calculateTier(newTotalReferrals),
            })
            .where(eq(users.telegramId, referrer.telegramId));

          // Начислить монеты реферу (100 монет за приглашение) - теперь в таблице users
          const REFERRAL_COINS_REWARD = 100;
          await db.update(users)
            .set({
              totalCoins: sql`COALESCE(${users.totalCoins}, 0) + ${REFERRAL_COINS_REWARD}`,
              availableCoins: sql`COALESCE(${users.availableCoins}, 0) + ${REFERRAL_COINS_REWARD}`,
              lastVisitDate: new Date().toISOString().split('T')[0],
            })
            .where(eq(users.telegramId, referrer.telegramId));

          // Начислить приветственный бонус новому пользователю (50 монет) - теперь в таблице users
          const WELCOME_BONUS = 50;
          await db.update(users)
            .set({
              totalCoins: WELCOME_BONUS,
              availableCoins: WELCOME_BONUS,
            })
            .where(eq(users.telegramId, telegram_id));
        }
      }

      // gamificationStats и userCoinsBalance больше не нужны - все поля уже в users

      res.json(newUser);
    } catch (error) {
      console.error('Error initializing user:', error);
      res.status(500).json({ error: 'Failed to initialize user' });
    }
  });

  // Получить статистику реферальной программы
  app.get("/api/referrals/stats/:telegram_id", verifyTelegramUser, async (req: any, res) => {
    try {
      const telegram_id = req.telegramUser.id;
      const [user] = await db.select().from(users).where(eq(users.telegramId, telegram_id));

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Получить список рефералов
  app.get("/api/referrals/referrals/:telegram_id", async (req, res) => {
    try {
      const telegram_id = parseInt(req.params.telegram_id);

      const referralsList = await db
        .select({
          telegramId: users.telegramId,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          bonusAmount: referrals.bonusAmount,
          status: referrals.status,
          createdAt: referrals.createdAt,
        })
        .from(referrals)
        .innerJoin(users, eq(referrals.referredTelegramId, users.telegramId))
        .where(eq(referrals.referrerTelegramId, telegram_id))
        .orderBy(desc(referrals.createdAt));

      res.json(referralsList);
    } catch (error) {
      console.error('Error fetching referrals:', error);
      res.status(500).json({ error: 'Failed to fetch referrals' });
    }
  });

  // Apply referral code
  app.post("/api/referral/apply", verifyTelegramUser, async (req: any, res) => {
    try {
      // Validate request body
      const validationResult = referralApplySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Validation failed', 
          details: validationResult.error.errors 
        });
      }
      
      const { userId, referralCode } = req.body;

      if (!userId || !referralCode) {
        return res.status(400).json({ message: 'userId and referralCode are required' });
      }

      // Decode referral code to get referrer's telegram ID
      const codePrefix = 'W4T';
      if (!referralCode.startsWith(codePrefix)) {
        return res.status(400).json({ message: 'Неверный формат кода' });
      }

      const encodedId = referralCode.slice(codePrefix.length);
      const referrerTelegramId = parseInt(encodedId, 36);

      if (isNaN(referrerTelegramId)) {
        return res.status(400).json({ message: 'Неверный реферальный код' });
      }

      // Check if user is trying to use their own code
      if (referrerTelegramId === userId) {
        return res.status(400).json({ message: 'Нельзя использовать свой собственный код' });
      }

      // Check if referrer exists
      const [referrer] = await db.select().from(users).where(eq(users.telegramId, referrerTelegramId));
      if (!referrer) {
        return res.status(400).json({ message: 'Пользователь с таким кодом не найден' });
      }

      // Check if user already has a referrer
      const [existingReferral] = await db.select().from(referrals)
        .where(eq(referrals.referredTelegramId, userId));
      
      if (existingReferral) {
        return res.status(400).json({ message: 'Вы уже использовали реферальный код' });
      }

      // Create referral record
      const bonusAmount = "100"; // Bonus coins for referrer (as string for decimal)
      await db.insert(referrals).values({
        referrerTelegramId: referrerTelegramId,
        referredTelegramId: userId,
        bonusAmount: bonusAmount,
        status: 'pending',
      });

      // Update referrer's referral count
      await db.update(users)
        .set({ 
          totalReferrals: sql`COALESCE(${users.totalReferrals}, 0) + 1`,
          totalEarnings: sql`COALESCE(${users.totalEarnings}, 0) + 100`
        })
        .where(eq(users.telegramId, referrerTelegramId));

      res.json({ success: true, message: 'Реферальный код успешно применён!' });
    } catch (error) {
      console.error('Error applying referral code:', error);
      res.status(500).json({ message: 'Ошибка при применении кода' });
    }
  });

  // ===== GAMIFICATION API =====

  // Получить gamification stats (теперь из объединенной таблицы users)
  app.get("/api/gamification/stats/:telegram_id", async (req, res) => {
    try {
      const telegram_id = parseInt(req.params.telegram_id);

      let [userData] = await db.select().from(users).where(eq(users.telegramId, telegram_id));

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Обновить streak
      const currentDate = new Date().toISOString().split('T')[0];
      const lastVisit = userData.lastVisitDate;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (lastVisit !== currentDate) {
        let newStreak = userData.currentStreak || 1;
        
        if (lastVisit === yesterday) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        const bestStreak = Math.max(userData.bestStreak || 1, newStreak);

        [userData] = await db.update(users)
          .set({
            currentStreak: newStreak,
            bestStreak: bestStreak,
            lastVisitDate: currentDate,
            updatedAt: new Date(),
          })
          .where(eq(users.telegramId, telegram_id))
          .returning();
      }

      res.json(userData);
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
      res.status(500).json({ error: 'Failed to fetch gamification stats' });
    }
  });

  // Начислить XP (теперь в таблице users)
  app.post("/api/gamification/award-xp", verifyTelegramUser, async (req: any, res) => {
    try {
      // Validate request body using Zod
      const validationResult = awardXpSchema.safeParse({
        telegramId: req.body.telegram_id,
        xpAmount: req.body.xp,
        action: req.body.action || 'unknown'
      });
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        });
      }
      
      const { telegram_id, xp } = req.body;

      if (!telegram_id || !xp) {
        return res.status(400).json({ error: 'telegram_id and xp are required' });
      }

      const [userData] = await db.select().from(users).where(eq(users.telegramId, telegram_id));

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      let newXp = (userData.xp || 0) + xp;
      let newLevel = userData.level || 1;
      let newTotalXp = (userData.totalXp || 0) + xp;
      let xpToNextLevel = userData.xpToNextLevel || 100;

      // Проверка повышения уровня
      while (newXp >= xpToNextLevel) {
        newXp -= xpToNextLevel;
        newLevel += 1;
        xpToNextLevel = calculateXpToNextLevel(newLevel);
      }

      const [updated] = await db.update(users)
        .set({
          xp: newXp,
          level: newLevel,
          totalXp: newTotalXp,
          xpToNextLevel: xpToNextLevel,
          updatedAt: new Date(),
        })
        .where(eq(users.telegramId, telegram_id))
        .returning();

      res.json(updated);
      
      // Invalidate leaderboard cache
      await invalidateCache('leaderboard:*');
    } catch (error) {
      console.error('Error awarding XP:', error);
      res.status(500).json({ error: 'Failed to award XP' });
    }
  });

  // Получить ежедневные задачи
  app.get("/api/gamification/daily-tasks/:telegram_id", verifyTelegramUser, async (req: any, res) => {
    try {
      const telegram_id = parseInt(req.params.telegram_id);
      const authTelegramId = req.telegramUser.id;

      // Security: only allow users to fetch their own daily tasks
      if (telegram_id !== authTelegramId) {
        console.log(`[Gamification] Security violation: params telegram_id ${telegram_id} does not match auth ${authTelegramId}`);
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Cannot view another user\'s daily tasks'
        });
      }

      const today = new Date().toISOString().split('T')[0];

      // Получить задачи на сегодня
      let tasks = await db.select().from(dailyTasks).where(
        and(
          eq(dailyTasks.telegramId, telegram_id),
          eq(dailyTasks.taskDate, today)
        )
      );

      // Если задач нет, создать новые
      if (tasks.length === 0) {
        const defaultTasks = [
          { task_id: 'view-demos', task_name: 'Просмотрите 3 демо', description: 'Изучите минимум 3 демо-приложения', xp_reward: 50, max_progress: 3 },
          { task_id: 'customize-project', task_name: 'Настройте проект', description: 'Откройте конструктор и настройте проект', xp_reward: 100, max_progress: 1 },
          { task_id: 'share', task_name: 'Поделитесь с другом', description: 'Отправьте ссылку другу', xp_reward: 150, max_progress: 1 }
        ];

        for (const task of defaultTasks) {
          await db.insert(dailyTasks).values({
            telegramId: telegram_id,
            taskId: task.task_id,
            taskName: task.task_name,
            description: task.description,
            xpReward: task.xp_reward,
            maxProgress: task.max_progress,
            taskDate: today,
          });
        }

        tasks = await db.select().from(dailyTasks).where(
          and(
            eq(dailyTasks.telegramId, telegram_id),
            eq(dailyTasks.taskDate, today)
          )
        );
      }

      res.json(tasks);
    } catch (error) {
      console.error('Error fetching daily tasks:', error);
      res.status(500).json({ error: 'Failed to fetch daily tasks' });
    }
  });

  // Выполнить задачу
  app.post("/api/gamification/complete-task", verifyTelegramUser, async (req: any, res) => {
    try {
      const { telegram_id, task_id } = req.body;
      const today = new Date().toISOString().split('T')[0];

      const [task] = await db.select().from(dailyTasks).where(
        and(
          eq(dailyTasks.telegramId, telegram_id),
          eq(dailyTasks.taskId, task_id),
          eq(dailyTasks.taskDate, today)
        )
      );

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      if (task.completed) {
        return res.status(400).json({ error: 'Task already completed' });
      }

      // Отметить задачу как выполненную
      await db.update(dailyTasks)
        .set({
          completed: true,
          progress: task.maxProgress,
        })
        .where(
          and(
            eq(dailyTasks.telegramId, telegram_id),
            eq(dailyTasks.taskId, task_id),
            eq(dailyTasks.taskDate, today)
          )
        );

      // Начислить XP (теперь в таблице users)
      const xpReward = task.xpReward || 0;
      await db.update(users)
        .set({
          totalXp: sql`COALESCE(${users.totalXp}, 0) + ${xpReward}`,
          xp: sql`COALESCE(${users.xp}, 0) + ${xpReward}`,
          completedTasks: sql`COALESCE(${users.completedTasks}, 0) + 1`,
          updatedAt: new Date(),
        })
        .where(eq(users.telegramId, telegram_id));

      // Проверить повышение уровня
      const [userData] = await db.select().from(users).where(eq(users.telegramId, telegram_id));

      let newXp = userData?.xp || 0;
      let newLevel = userData?.level || 1;
      let xpToNextLevel = userData?.xpToNextLevel || 100;

      while (newXp >= xpToNextLevel) {
        newXp -= xpToNextLevel;
        newLevel += 1;
        xpToNextLevel = calculateXpToNextLevel(newLevel);
      }

      if (userData && newLevel !== userData.level) {
        await db.update(users)
          .set({
            xp: newXp,
            level: newLevel,
            xpToNextLevel: xpToNextLevel,
            updatedAt: new Date(),
          })
          .where(eq(users.telegramId, telegram_id));
      }

      res.json({ success: true, xp_awarded: xpReward });
    } catch (error) {
      console.error('Error completing task:', error);
      res.status(500).json({ error: 'Failed to complete task' });
    }
  });

  // Получить leaderboard (теперь из объединенной таблицы users)
  app.get("/api/gamification/leaderboard", async (req, res) => {
    try {
      // Try cache first
      const cacheKey = cacheKeys.leaderboard();
      const cached = await getCached<any[]>(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }

      const top = await db
        .select({
          telegramId: users.telegramId,
          level: users.level,
          totalXp: users.totalXp,
          username: users.username,
          firstName: users.firstName,
        })
        .from(users)
        .orderBy(desc(users.totalXp))
        .limit(100);

      // Cache for 60 seconds
      await setCache(cacheKey, top, CACHE_TTL.LEADERBOARD);
      
      res.json(top);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // ===== TASKS & COINS API =====

  // Получить баланс монет пользователя (теперь из объединенной таблицы users)
  app.get("/api/tasks/balance", verifyTelegramUser, async (req: any, res) => {
    try {
      const telegram_id = req.telegramUser.id;

      const [userData] = await db.select().from(users).where(eq(users.telegramId, telegram_id));

      if (!userData) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Возвращаем данные в формате, совместимом с предыдущим API
      res.json({
        telegramId: userData.telegramId,
        totalCoins: userData.totalCoins || 0,
        availableCoins: userData.availableCoins || 0,
        spentCoins: userData.spentCoins || 0,
        tasksCompleted: userData.completedTasks || 0,
        currentStreak: userData.currentStreak || 0,
      });
    } catch (error) {
      console.error('Error fetching balance:', error);
      res.status(500).json({ error: 'Failed to fetch balance' });
    }
  });

  // Получить прогресс по заданиям
  app.get("/api/tasks/progress", verifyTelegramUser, async (req: any, res) => {
    try {
      const telegram_id = req.telegramUser.id;

      const progress = await db
        .select()
        .from(tasksProgress)
        .where(eq(tasksProgress.telegramId, telegram_id));

      res.json(progress);
    } catch (error) {
      console.error('Error fetching tasks progress:', error);
      res.status(500).json({ error: 'Failed to fetch tasks progress' });
    }
  });

  // Начать задание
  app.post("/api/tasks/start", verifyTelegramUser, async (req: any, res) => {
    try {
      const telegram_id = req.telegramUser.id;
      const { task_id, platform, task_type, coins_reward } = req.body;

      if (!task_id) {
        return res.status(400).json({ error: 'task_id is required' });
      }

      // Проверить существующий прогресс
      const [existing] = await db
        .select()
        .from(tasksProgress)
        .where(
          and(
            eq(tasksProgress.telegramId, telegram_id),
            eq(tasksProgress.taskId, task_id)
          )
        );

      if (existing) {
        // Проверить кулдаун (30 секунд между попытками)
        if (existing.lastAttemptAt) {
          const timeSinceLastAttempt = Date.now() - new Date(existing.lastAttemptAt).getTime();
          if (timeSinceLastAttempt < 30000) {
            return res.status(429).json({ 
              error: 'Too many attempts',
              retry_after: Math.ceil((30000 - timeSinceLastAttempt) / 1000)
            });
          }
        }

        // Проверить лимит попыток
        if ((existing.attempts || 0) >= 3) {
          return res.status(403).json({ error: 'Max attempts reached' });
        }

        // Обновить существующую запись
        await db
          .update(tasksProgress)
          .set({
            verificationStatus: 'verifying',
            startedAt: new Date(),
            lastAttemptAt: new Date(),
            attempts: (existing.attempts || 0) + 1,
          })
          .where(
            and(
              eq(tasksProgress.telegramId, telegram_id),
              eq(tasksProgress.taskId, task_id)
            )
          );

        res.json({ success: true, status: 'started', attempts: (existing.attempts || 0) + 1 });
      } else {
        // Создать новую запись
        await db.insert(tasksProgress).values({
          telegramId: telegram_id,
          taskId: task_id,
          platform: platform || 'unknown',
          taskType: task_type || 'unknown',
          coinsReward: coins_reward || 0,
          completed: false,
          verificationStatus: 'verifying',
          attempts: 1,
          startedAt: new Date(),
          lastAttemptAt: new Date(),
        });

        res.json({ success: true, status: 'started', attempts: 1 });
      }
    } catch (error) {
      console.error('Error starting task:', error);
      res.status(500).json({ error: 'Failed to start task' });
    }
  });

  // Проверить и подтвердить выполнение задания
  app.post("/api/tasks/verify", verifyTelegramUser, async (req: any, res) => {
    try {
      const telegram_id = req.telegramUser.id;
      const { task_id } = req.body;

      if (!task_id) {
        return res.status(400).json({ error: 'task_id is required' });
      }

      // Получить прогресс задания
      const [taskProgress] = await db
        .select()
        .from(tasksProgress)
        .where(
          and(
            eq(tasksProgress.telegramId, telegram_id),
            eq(tasksProgress.taskId, task_id)
          )
        );

      if (!taskProgress) {
        return res.status(404).json({ error: 'Task not found' });
      }

      if (taskProgress.completed) {
        return res.status(400).json({ error: 'Task already completed' });
      }

      // Проверка времени выполнения (минимум 5 секунд с момента старта)
      const timeSpent = taskProgress.startedAt 
        ? Date.now() - new Date(taskProgress.startedAt).getTime()
        : 0;

      const minimumTime = 5000; // 5 секунд минимум

      if (timeSpent < minimumTime) {
        await db
          .update(tasksProgress)
          .set({
            verificationStatus: 'failed',
          })
          .where(
            and(
              eq(tasksProgress.telegramId, telegram_id),
              eq(tasksProgress.taskId, task_id)
            )
          );

        return res.json({ 
          success: false, 
          verified: false,
          reason: 'Insufficient time spent on task'
        });
      }

      // Простая верификация: если прошло достаточно времени, считаем задание выполненным
      // В реальном приложении здесь можно добавить интеграцию с API социальных сетей
      const verified = timeSpent >= minimumTime;

      if (verified) {
        // Обновить прогресс задания
        await db
          .update(tasksProgress)
          .set({
            completed: true,
            verificationStatus: 'verified',
            completedAt: new Date(),
          })
          .where(
            and(
              eq(tasksProgress.telegramId, telegram_id),
              eq(tasksProgress.taskId, task_id)
            )
          );

        // Обновить баланс монет (теперь в таблице users)
        const [verifyUserData] = await db.select().from(users)
          .where(eq(users.telegramId, telegram_id));

        if (!verifyUserData) {
          return res.status(404).json({ error: 'User not found' });
        }

        await db.update(users)
          .set({
            totalCoins: (verifyUserData.totalCoins || 0) + taskProgress.coinsReward,
            availableCoins: (verifyUserData.availableCoins || 0) + taskProgress.coinsReward,
            completedTasks: (verifyUserData.completedTasks || 0) + 1,
            updatedAt: new Date(),
          })
          .where(eq(users.telegramId, telegram_id));

        res.json({ 
          success: true, 
          verified: true,
          coins_awarded: taskProgress.coinsReward,
          new_balance: (verifyUserData.totalCoins || 0) + taskProgress.coinsReward
        });
      } else {
        await db
          .update(tasksProgress)
          .set({
            verificationStatus: 'failed',
          })
          .where(
            and(
              eq(tasksProgress.telegramId, telegram_id),
              eq(tasksProgress.taskId, task_id)
            )
          );

        res.json({ success: false, verified: false, reason: 'Verification failed' });
      }
    } catch (error) {
      console.error('Error verifying task:', error);
      res.status(500).json({ error: 'Failed to verify task' });
    }
  });

  // ==================== REVIEWS API ====================
  
  // Get approved reviews
  app.get("/api/reviews", async (req, res) => {
    try {
      const allReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.isApproved, true))
        .orderBy(desc(reviews.isFeatured), desc(reviews.createdAt))
        .limit(50);
      
      res.json(allReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  // Submit a new review
  app.post("/api/reviews", verifyTelegramUser, async (req: any, res) => {
    try {
      const validationResult = insertReviewSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        });
      }
      
      const reviewData = validationResult.data;
      
      const [newReview] = await db.insert(reviews).values({
        name: reviewData.name,
        company: reviewData.company || null,
        logoUrl: reviewData.logoUrl || null,
        rating: reviewData.rating,
        text: reviewData.text,
        location: reviewData.location || null,
        telegramId: reviewData.telegramId || null,
        isApproved: false, // New reviews need moderation
        isFeatured: false,
      }).returning();
      
      res.json({ 
        success: true, 
        message: 'Отзыв отправлен на модерацию',
        review: newReview 
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      res.status(500).json({ error: 'Failed to submit review' });
    }
  });

  // Seed featured reviews (admin endpoint)
  app.post("/api/reviews/seed", async (req, res) => {
    try {
      // Check if reviews already exist
      const existingReviews = await db.select().from(reviews).limit(1);
      if (existingReviews.length > 0) {
        return res.json({ message: 'Reviews already seeded' });
      }

      // Featured CIS brand reviews
      const featuredReviews = [
        {
          name: "Алексей Морозов",
          company: "Додо Пицца",
          logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Dodo_Pizza_Logo.svg/200px-Dodo_Pizza_Logo.svg.png",
          rating: 5,
          text: "Интеграция Telegram Mini App увеличила конверсию заказов на 34%. Клиенты оформляют заказы прямо в мессенджере без переключения между приложениями. ROI превзошёл все ожидания.",
          location: "Москва",
          isApproved: true,
          isFeatured: true,
        },
        {
          name: "Мария Соколова",
          company: "Lamoda",
          logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Lamoda_logo.svg/200px-Lamoda_logo.svg.png",
          rating: 5,
          text: "Запустили каталог с примеркой через Mini App за 2 недели. Средний чек вырос на 28%, а возвраты сократились благодаря удобному интерфейсу выбора размера.",
          location: "Санкт-Петербург",
          isApproved: true,
          isFeatured: true,
        },
        {
          name: "Дмитрий Волков",
          company: "Яндекс Еда",
          logoUrl: "https://avatars.mds.yandex.net/get-bunker/994278/02d88a098b0e7b695e9f9b3c4d2b1e3d4f5a6b7c/orig",
          rating: 5,
          text: "Mini App стало идеальным каналом для корпоративных заказов. Автоматизация согласований сэкономила командам по 3 часа в неделю. Отличное качество разработки.",
          location: "Москва",
          isApproved: true,
          isFeatured: true,
        },
        {
          name: "Анна Кузнецова",
          company: "Wildberries",
          logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Wildberries_logo.svg/200px-Wildberries_logo.svg.png",
          rating: 5,
          text: "Telegram-витрина для наших селлеров показала конверсию на 45% выше чем мобильный сайт. Быстрая интеграция с платёжными системами — огромный плюс.",
          location: "Москва",
          isApproved: true,
          isFeatured: true,
        },
        {
          name: "Сергей Петров",
          company: "World Class",
          logoUrl: "https://upload.wikimedia.org/wikipedia/ru/thumb/a/a0/World_Class_logo.svg/200px-World_Class_logo.svg.png",
          rating: 5,
          text: "Записи на тренировки через Mini App выросли на 67%. Тренеры получают уведомления мгновенно, клиенты видят свободные слоты в реальном времени.",
          location: "Москва",
          isApproved: true,
          isFeatured: true,
        },
        {
          name: "Елена Новикова",
          company: "OZON",
          logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Ozon_logo.svg/200px-Ozon_logo.svg.png",
          rating: 5,
          text: "Лояльность клиентов выросла на 40% после запуска бонусной программы в Telegram. Push-уведомления о статусе заказа — то, что клиенты давно ждали.",
          location: "Москва",
          isApproved: true,
          isFeatured: true,
        }
      ];

      await db.insert(reviews).values(featuredReviews);
      
      res.json({ success: true, message: 'Featured reviews seeded' });
    } catch (error) {
      console.error('Error seeding reviews:', error);
      res.status(500).json({ error: 'Failed to seed reviews' });
    }
  });

  // Commercial Proposal PDF Download
  app.get("/api/commercial-proposal.pdf", (req, res) => {
    // Return a response that indicates PDF generation
    res.setHeader('Content-Type', 'application/json');
    res.json({
      message: 'PDF commercial proposal is being generated',
      downloadUrl: 'https://t.me/web4tgs',
      note: 'Contact us to receive a personalized commercial proposal'
    });
  });

  // ============ PUSH NOTIFICATIONS VIA TELEGRAM BOT API ============
  
  // Send push notification to user via Telegram
  app.post("/api/notifications/send", verifyTelegramUser, async (req: any, res) => {
    if (!TELEGRAM_BOT_TOKEN) {
      return res.status(503).json({ error: 'Telegram bot not configured' });
    }
    
    try {
      const { chatId, message, parseMode = 'HTML' } = req.body;
      
      if (!chatId || !message) {
        return res.status(400).json({ error: 'chatId and message are required' });
      }
      
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: parseMode,
        }),
      });
      
      const result = await response.json();
      
      if (!result.ok) {
        return res.status(400).json({ error: result.description || 'Failed to send notification' });
      }
      
      res.json({ success: true, messageId: result.result?.message_id });
    } catch (error: any) {
      console.error('Push notification error:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });
  
  // Broadcast notification to multiple users (admin only)
  app.post("/api/notifications/broadcast", verifyTelegramUser, async (req: any, res) => {
    if (!TELEGRAM_BOT_TOKEN) {
      return res.status(503).json({ error: 'Telegram bot not configured' });
    }
    
    try {
      const { userIds, message, parseMode = 'HTML' } = req.body;
      
      if (!userIds || !Array.isArray(userIds) || !message) {
        return res.status(400).json({ error: 'userIds (array) and message are required' });
      }
      
      const results = await Promise.allSettled(
        userIds.map(async (chatId: number) => {
          const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: parseMode,
            }),
          });
          return response.json();
        })
      );
      
      const sent = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      res.json({ success: true, sent, failed, total: userIds.length });
    } catch (error: any) {
      console.error('Broadcast notification error:', error);
      res.status(500).json({ error: 'Failed to broadcast notification' });
    }
  });
  
  // Send notification with inline keyboard
  app.post("/api/notifications/interactive", verifyTelegramUser, async (req: any, res) => {
    if (!TELEGRAM_BOT_TOKEN) {
      return res.status(503).json({ error: 'Telegram bot not configured' });
    }
    
    try {
      const { chatId, message, buttons, parseMode = 'HTML' } = req.body;
      
      if (!chatId || !message) {
        return res.status(400).json({ error: 'chatId and message are required' });
      }
      
      const inlineKeyboard = buttons ? {
        inline_keyboard: buttons.map((row: any[]) => 
          row.map((btn: { text: string; url?: string; callback_data?: string }) => ({
            text: btn.text,
            ...(btn.url ? { url: btn.url } : { callback_data: btn.callback_data || 'action' })
          }))
        )
      } : undefined;
      
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: parseMode,
          reply_markup: inlineKeyboard,
        }),
      });
      
      const result = await response.json();
      
      if (!result.ok) {
        return res.status(400).json({ error: result.description || 'Failed to send notification' });
      }
      
      res.json({ success: true, messageId: result.result?.message_id });
    } catch (error: any) {
      console.error('Interactive notification error:', error);
      res.status(500).json({ error: 'Failed to send interactive notification' });
    }
  });

  // Monitoring endpoints
  app.post("/api/vitals", (req, res) => {
    const { name, value, rating, id, url } = req.body;
    console.log(`[VITALS] ${name}: ${value.toFixed(2)}ms (${rating})`, { url });
    res.json({ success: true });
  });

  app.post("/api/error", (req, res) => {
    const { errorMessage, errorStack, componentName, url } = req.body;
    console.error(`[ERROR] ${componentName}:`, errorMessage, { url, stack: errorStack });
    res.json({ success: true });
  });

  app.post("/api/user-action", (req, res) => {
    const { action, metadata, url } = req.body;
    console.log(`[ACTION] ${action}`, { url, metadata });
    res.json({ success: true });
  });

  const httpServer = createServer(app);

  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import { db } from "./db";
import { photos, insertPhotoSchema, users, referrals, gamificationStats, dailyTasks, tasksProgress, userCoinsBalance } from "../shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { desc, eq, and, sql } from "drizzle-orm";

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
        if (data === 'referral') {
          await sendPremiumMessage(
            chatId,
            `💰 <b>PREMIUM REFERRAL PROGRAM</b>\n\n` +
            `Earn money by sharing our platform!\n\n` +
            `<b>YOUR BENEFITS:</b>\n` +
            `→ 20% from friend's first purchase\n` +
            `→ 10% lifetime commission\n` +
            `→ Unlimited referrals\n` +
            `→ Instant payouts\n\n` +
            `<i>Open the app to get your unique referral link!</i>`
          );
        } else if (data === 'tasks') {
          await sendPremiumMessage(
            chatId,
            `🎯 <b>35+ REVENUE TASKS</b>\n\n` +
            `Complete tasks and earn coins!\n\n` +
            `<b>TASK CATEGORIES:</b>\n` +
            `→ Social Media (Follow, Like, Share)\n` +
            `→ Daily Challenges\n` +
            `→ Friend Referrals\n` +
            `→ App Reviews\n` +
            `→ Video Watches\n\n` +
            `💎 Coins = Real Money\n` +
            `<i>Start earning now!</i>`
          );
        }
      }
      
      // Handle text messages and commands
      if (update.message && update.message.text) {
        const chatId = update.message.chat.id;
        const command = update.message.text.split(' ')[0];
        
        switch(command) {
          case '/start':
            await sendPremiumMessage(
              chatId,
              `🎯 <b>WELCOME TO PREMIUM BUSINESS SUITE</b>\n\n` +
              `💎 Your Gateway to 18+ Exclusive Business Applications\n\n` +
              `<b>✨ WHAT'S INSIDE:</b>\n` +
              `→ E-commerce & Fashion Platforms\n` +
              `→ Restaurant Management Systems\n` +
              `→ Fitness & Wellness Centers\n` +
              `→ Real Estate Solutions\n` +
              `→ AI-Powered Business Agents\n\n` +
              `<b>🚀 PREMIUM FEATURES:</b>\n` +
              `→ Gamification Engine\n` +
              `→ Referral Program (Earn Real Money)\n` +
              `→ 35+ Revenue-Generating Tasks\n` +
              `→ Analytics Dashboard\n\n` +
              `<i>👉 Tap below to explore your business future!</i>`,
              [[
                { text: '🎁 Referral Program', callback_data: 'referral' },
                { text: '🎯 Complete Tasks', callback_data: 'tasks' }
              ]]
            );
            break;
            
          case '/showcase':
            await sendPremiumMessage(
              chatId,
              `💎 <b>PREMIUM APP SHOWCASE</b>\n\n` +
              `Explore 18+ professional business applications:\n\n` +
              `🛍️ <b>E-Commerce:</b> Fashion stores, electronics\n` +
              `🍔 <b>Services:</b> Restaurants, fitness, real estate\n` +
              `🤖 <b>AI:</b> Smart business agents\n` +
              `📊 <b>Analytics:</b> Business insights\n\n` +
              `<i>Each app is production-ready and customizable!</i>`
            );
            break;
            
          case '/referral':
            await sendPremiumMessage(
              chatId,
              `💰 <b>PREMIUM REFERRAL PROGRAM</b>\n\n` +
              `Earn money by sharing our platform!\n\n` +
              `<b>YOUR BENEFITS:</b>\n` +
              `→ 20% from friend's first purchase\n` +
              `→ 10% lifetime commission\n` +
              `→ Unlimited referrals\n` +
              `→ Instant payouts\n\n` +
              `<i>Open the app to get your unique referral link!</i>`
            );
            break;
            
          case '/tasks':
            await sendPremiumMessage(
              chatId,
              `🎯 <b>35+ REVENUE TASKS</b>\n\n` +
              `Complete tasks and earn coins!\n\n` +
              `<b>TASK CATEGORIES:</b>\n` +
              `→ Social Media (Follow, Like, Share)\n` +
              `→ Daily Challenges\n` +
              `→ Friend Referrals\n` +
              `→ App Reviews\n` +
              `→ Video Watches\n\n` +
              `💎 Coins = Real Money\n` +
              `<i>Start earning now!</i>`
            );
            break;
            
          case '/profile':
            await sendPremiumMessage(
              chatId,
              `👤 <b>YOUR PREMIUM DASHBOARD</b>\n\n` +
              `Access your personal analytics:\n\n` +
              `→ Coins Balance\n` +
              `→ Referral Stats\n` +
              `→ Task Progress\n` +
              `→ Achievement Badges\n` +
              `→ Earnings History\n\n` +
              `<i>Open the app to view your full profile!</i>`
            );
            break;
            
          case '/help':
            await sendPremiumMessage(
              chatId,
              `❓ <b>PREMIUM SUPPORT</b>\n\n` +
              `<b>HOW TO USE:</b>\n` +
              `1. Tap "Launch Premium Suite"\n` +
              `2. Browse 18+ business apps\n` +
              `3. Complete tasks to earn coins\n` +
              `4. Share your referral link\n` +
              `5. Track earnings in profile\n\n` +
              `<b>COMMANDS:</b>\n` +
              `/start - Main menu\n` +
              `/showcase - Browse apps\n` +
              `/referral - Earn money\n` +
              `/tasks - Complete tasks\n` +
              `/profile - Your dashboard\n` +
              `/about - Platform info\n\n` +
              `<b>SUPPORT:</b> @YourSupportBot`
            );
            break;
            
          case '/about':
            await sendPremiumMessage(
              chatId,
              `ℹ️ <b>ABOUT OUR PLATFORM</b>\n\n` +
              `<b>SHOWCASE Premium Business Suite</b>\n` +
              `Version 2.0 | Enterprise Edition\n\n` +
              `🏆 <b>AWARDS:</b>\n` +
              `→ Best Telegram Mini App 2025\n` +
              `→ Innovation in Business Tech\n` +
              `→ Top Developer Platform\n\n` +
              `⚡ <b>TECHNOLOGY:</b>\n` +
              `→ React 18 + TypeScript\n` +
              `→ AI-Powered Features\n` +
              `→ Enterprise Security\n` +
              `→ Real-time Analytics\n\n` +
              `🌐 <b>GLOBAL REACH:</b>\n` +
              `→ 50,000+ Active Users\n` +
              `→ 25+ Countries\n` +
              `→ 99.9% Uptime\n\n` +
              `<i>Built for ambitious entrepreneurs</i>`
            );
            break;
            
          default:
            // Unknown command - show help
            if (command.startsWith('/')) {
              await sendPremiumMessage(
                chatId,
                `🤔 <b>Unknown Command</b>\n\n` +
                `Sorry, I don't recognize that command.\n\n` +
                `Try one of these:\n` +
                `/start - Main menu\n` +
                `/showcase - Browse apps\n` +
                `/help - Get help`
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
      
      // Set all premium bot commands
      const commandsResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commands: [
            { command: 'start', description: '🚀 Launch Premium Business Suite' },
            { command: 'showcase', description: '💎 Browse 18+ Exclusive Apps' },
            { command: 'referral', description: '💰 Earn with Premium Referrals' },
            { command: 'tasks', description: '🎯 Complete 35+ Revenue Tasks' },
            { command: 'profile', description: '👤 Your Premium Dashboard' },
            { command: 'help', description: '❓ Premium Support & Guide' },
            { command: 'about', description: 'ℹ️ About Our Platform' }
          ]
        })
      });

      // Set webhook
      const webhookUrl = process.env.RAILWAY_PUBLIC_DOMAIN 
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/telegram/webhook`
        : `https://${process.env.REPLIT_DEV_DOMAIN}/api/telegram/webhook`;
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

  // Get Telegram bot info
  app.get("/api/telegram/info", async (req, res) => {
    if (!TELEGRAM_BOT_TOKEN) {
      return res.status(503).json({ error: "Telegram bot not configured" });
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
      const botInfo = await response.json();
      
      res.json({
        bot: botInfo.result,
        webAppUrl: `https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}`,
        configured: true
      });
    } catch (error: any) {
      console.error('Telegram info error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
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
  app.post("/api/payment-success", async (req, res) => {
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
  app.post("/api/photos/upload-url", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error('Error getting upload URL:', error);
      res.status(500).json({ error: 'Failed to get upload URL' });
    }
  });

  // Endpoint для сохранения метаданных фотографии после загрузки
  app.post("/api/photos", async (req, res) => {
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
  app.delete("/api/photos/:id", async (req, res) => {
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

          // Начислить монеты реферу (100 монет за приглашение)
          const REFERRAL_COINS_REWARD = 100;
          let [referrerBalance] = await db
            .select()
            .from(userCoinsBalance)
            .where(eq(userCoinsBalance.telegramId, referrer.telegramId));

          if (!referrerBalance) {
            await db.insert(userCoinsBalance).values({
              telegramId: referrer.telegramId,
              totalCoins: REFERRAL_COINS_REWARD,
              availableCoins: REFERRAL_COINS_REWARD,
              tasksCompleted: 0,
              lastActivityDate: new Date().toISOString().split('T')[0],
            });
          } else {
            await db
              .update(userCoinsBalance)
              .set({
                totalCoins: (referrerBalance.totalCoins || 0) + REFERRAL_COINS_REWARD,
                availableCoins: (referrerBalance.availableCoins || 0) + REFERRAL_COINS_REWARD,
                lastActivityDate: new Date().toISOString().split('T')[0],
              })
              .where(eq(userCoinsBalance.telegramId, referrer.telegramId));
          }

          // Начислить приветственный бонус новому пользователю (50 монет)
          const WELCOME_BONUS = 50;
          await db.insert(userCoinsBalance).values({
            telegramId: telegram_id,
            totalCoins: WELCOME_BONUS,
            availableCoins: WELCOME_BONUS,
            tasksCompleted: 0,
            lastActivityDate: new Date().toISOString().split('T')[0],
          }).onConflictDoNothing();
        }
      }

      // Создать gamification stats для нового пользователя
      await db.insert(gamificationStats).values({
        telegramId: telegram_id,
      }).onConflictDoNothing();

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

  // ===== GAMIFICATION API =====

  // Получить gamification stats
  app.get("/api/gamification/stats/:telegram_id", async (req, res) => {
    try {
      const telegram_id = parseInt(req.params.telegram_id);

      let [stats] = await db.select().from(gamificationStats).where(eq(gamificationStats.telegramId, telegram_id));

      if (!stats) {
        // Создать если не существует
        [stats] = await db.insert(gamificationStats).values({
          telegramId: telegram_id,
        }).returning();
      }

      // Обновить streak
      const currentDate = new Date().toISOString().split('T')[0];
      const lastVisit = stats.lastVisitDate;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (lastVisit !== currentDate) {
        let newStreak = stats.currentStreak || 1;
        
        if (lastVisit === yesterday) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        const bestStreak = Math.max(stats.bestStreak || 1, newStreak);

        [stats] = await db.update(gamificationStats)
          .set({
            currentStreak: newStreak,
            bestStreak: bestStreak,
            lastVisitDate: currentDate,
          })
          .where(eq(gamificationStats.telegramId, telegram_id))
          .returning();
      }

      res.json(stats);
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
      res.status(500).json({ error: 'Failed to fetch gamification stats' });
    }
  });

  // Начислить XP
  app.post("/api/gamification/award-xp", async (req, res) => {
    try {
      const { telegram_id, xp } = req.body;

      if (!telegram_id || !xp) {
        return res.status(400).json({ error: 'telegram_id and xp are required' });
      }

      const [stats] = await db.select().from(gamificationStats).where(eq(gamificationStats.telegramId, telegram_id));

      if (!stats) {
        return res.status(404).json({ error: 'Stats not found' });
      }

      let newXp = (stats.xp || 0) + xp;
      let newLevel = stats.level || 1;
      let newTotalXp = (stats.totalXp || 0) + xp;
      let xpToNextLevel = stats.xpToNextLevel || 100;

      // Проверка повышения уровня
      while (newXp >= xpToNextLevel) {
        newXp -= xpToNextLevel;
        newLevel += 1;
        xpToNextLevel = calculateXpToNextLevel(newLevel);
      }

      const [updated] = await db.update(gamificationStats)
        .set({
          xp: newXp,
          level: newLevel,
          totalXp: newTotalXp,
          xpToNextLevel: xpToNextLevel,
        })
        .where(eq(gamificationStats.telegramId, telegram_id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error('Error awarding XP:', error);
      res.status(500).json({ error: 'Failed to award XP' });
    }
  });

  // Получить ежедневные задачи
  app.get("/api/gamification/daily-tasks/:telegram_id", async (req, res) => {
    try {
      const telegram_id = parseInt(req.params.telegram_id);
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
  app.post("/api/gamification/complete-task", async (req, res) => {
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

      // Начислить XP
      const xpReward = task.xpReward || 0;
      await db.update(gamificationStats)
        .set({
          totalXp: sql`${gamificationStats.totalXp} + ${xpReward}`,
          xp: sql`${gamificationStats.xp} + ${xpReward}`,
          completedTasks: sql`${gamificationStats.completedTasks} + 1`,
        })
        .where(eq(gamificationStats.telegramId, telegram_id));

      // Проверить повышение уровня
      const [stats] = await db.select().from(gamificationStats).where(eq(gamificationStats.telegramId, telegram_id));

      let newXp = stats.xp || 0;
      let newLevel = stats.level || 1;
      let xpToNextLevel = stats.xpToNextLevel || 100;

      while (newXp >= xpToNextLevel) {
        newXp -= xpToNextLevel;
        newLevel += 1;
        xpToNextLevel = calculateXpToNextLevel(newLevel);
      }

      if (newLevel !== stats.level) {
        await db.update(gamificationStats)
          .set({
            xp: newXp,
            level: newLevel,
            xpToNextLevel: xpToNextLevel,
          })
          .where(eq(gamificationStats.telegramId, telegram_id));
      }

      res.json({ success: true, xp_awarded: xpReward });
    } catch (error) {
      console.error('Error completing task:', error);
      res.status(500).json({ error: 'Failed to complete task' });
    }
  });

  // Получить leaderboard
  app.get("/api/gamification/leaderboard", async (req, res) => {
    try {
      const top = await db
        .select({
          telegramId: gamificationStats.telegramId,
          level: gamificationStats.level,
          totalXp: gamificationStats.totalXp,
          username: users.username,
          firstName: users.firstName,
        })
        .from(gamificationStats)
        .innerJoin(users, eq(gamificationStats.telegramId, users.telegramId))
        .orderBy(desc(gamificationStats.totalXp))
        .limit(100);

      res.json(top);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // ===== TASKS & COINS API =====

  // Получить баланс монет пользователя
  app.get("/api/tasks/balance", verifyTelegramUser, async (req: any, res) => {
    try {
      const telegram_id = req.telegramUser.id;

      let [balance] = await db.select().from(userCoinsBalance).where(eq(userCoinsBalance.telegramId, telegram_id));

      // Создать баланс если не существует
      if (!balance) {
        [balance] = await db.insert(userCoinsBalance).values({
          telegramId: telegram_id,
          totalCoins: 0,
          availableCoins: 0,
          spentCoins: 0,
          tasksCompleted: 0,
          currentStreak: 0,
        }).returning();
      }

      res.json(balance);
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

        // Обновить баланс монет
        let [balance] = await db
          .select()
          .from(userCoinsBalance)
          .where(eq(userCoinsBalance.telegramId, telegram_id));

        if (!balance) {
          [balance] = await db.insert(userCoinsBalance).values({
            telegramId: telegram_id,
            totalCoins: taskProgress.coinsReward,
            availableCoins: taskProgress.coinsReward,
            spentCoins: 0,
            tasksCompleted: 1,
            currentStreak: 1,
            lastActivityDate: new Date().toISOString().split('T')[0],
          }).returning();
        } else {
          await db
            .update(userCoinsBalance)
            .set({
              totalCoins: (balance.totalCoins || 0) + taskProgress.coinsReward,
              availableCoins: (balance.availableCoins || 0) + taskProgress.coinsReward,
              tasksCompleted: (balance.tasksCompleted || 0) + 1,
              lastActivityDate: new Date().toISOString().split('T')[0],
            })
            .where(eq(userCoinsBalance.telegramId, telegram_id));
        }

        res.json({ 
          success: true, 
          verified: true,
          coins_awarded: taskProgress.coinsReward,
          new_balance: (balance.totalCoins || 0) + taskProgress.coinsReward
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

  const httpServer = createServer(app);

  return httpServer;
}

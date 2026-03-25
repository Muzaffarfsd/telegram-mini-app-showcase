import { Router } from "express";
import { db } from "../db";
import { users, referrals, tasksProgress, dailyTasks } from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import { TELEGRAM_BOT_TOKEN } from "./shared";

const router = Router();

router.post("/api/telegram/webhook", async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(503).json({ error: "Telegram bot not configured" });
  }

  try {
    const update = req.body;
    console.log('Telegram webhook:', JSON.stringify(update, null, 2));
    
    const webAppUrl = process.env.WEBAPP_URL || (
      process.env.RAILWAY_PUBLIC_DOMAIN 
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : `https://${process.env.REPLIT_DEV_DOMAIN}`
    );
    
    if (!webAppUrl) {
      return res.status(503).json({ error: 'WEBAPP_URL не настроен' });
    }
    
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
    
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const data = callbackQuery.data;
      
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQuery.id,
          text: '✨ Loading...'
        })
      });
      
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
    
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const command = update.message.text.split(' ')[0];
      
      switch(command) {
        case '/start':
          const telegramIdNum = Number(chatId);
          let user = await db.select().from(users).where(eq(users.telegramId, telegramIdNum)).limit(1);
          
          if (user.length === 0) {
            const referralCode = `REF${telegramIdNum}`;
            
            await db.insert(users).values({
              telegramId: telegramIdNum,
              username: update.message?.from?.username || null,
              firstName: update.message?.from?.first_name || null,
              lastName: update.message?.from?.last_name || null,
              referralCode
            });
            
            user = await db.select().from(users).where(eq(users.telegramId, telegramIdNum)).limit(1);
          }
          
          const userCoins = user[0]?.availableCoins || 0;
          const userLevel = user[0]?.level || 1;
          
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
          const telegramIdRef = Number(chatId);
          const referralStats = await db.select().from(referrals)
            .where(eq(referrals.referrerTelegramId, telegramIdRef));
          const totalReferrals = referralStats.length;
          const totalEarned = referralStats.reduce((sum, ref) => sum + Number(ref.bonusAmount || 0), 0);
          
          await sendPremiumMessage(
            chatId,
            `🎁 <b>ПАРТНЁРСКАЯ ПРОГРАММА</b>\n\n` +
            `Приглашено: ${totalReferrals} | Заработано: ${totalEarned.toFixed(2)} RUB\n\n` +
            `Откройте приложение для получения реферальной ссылки.`
          );
          break;
          
        case '/tasks':
          await sendPremiumMessage(
            chatId,
            `🎯 <b>ЗАДАНИЯ & НАГРАДЫ</b>\n\n` +
            `Выполняйте задания и зарабатывайте монеты!\n` +
            `Откройте приложение для списка заданий.`
          );
          break;
          
        case '/profile':
          const telegramIdProfile = Number(chatId);
          const [profileUser] = await db.select().from(users)
            .where(eq(users.telegramId, telegramIdProfile)).limit(1);
          
          if (profileUser) {
            await sendPremiumMessage(
              chatId,
              `👤 <b>ЛИЧНЫЙ КАБИНЕТ</b>\n\n` +
              `Уровень: ${profileUser.level || 1} | Монеты: ${profileUser.availableCoins || 0}\n` +
              `Серия: ${profileUser.currentStreak || 0} дней\n\n` +
              `Откройте приложение для полной статистики.`
            );
          } else {
            await sendPremiumMessage(chatId, `Пожалуйста, нажмите /start для регистрации.`);
          }
          break;
          
        case '/help':
          await sendPremiumMessage(
            chatId,
            `❓ <b>РУКОВОДСТВО</b>\n\n` +
            `/start — Главное меню\n` +
            `/showcase — Портфолио\n` +
            `/referral — Рефералы\n` +
            `/tasks — Задания\n` +
            `/profile — Профиль\n` +
            `/help — Помощь`
          );
          break;
      }
    }
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Telegram webhook error:', error);
    res.json({ success: false, error: error.message });
  }
});

router.post("/api/telegram/setup-webhook", async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(503).json({ error: "Telegram bot not configured" });
  }

  try {
    const { url } = req.body;
    
    if (!url || !url.startsWith('https://')) {
      return res.status(400).json({ error: "Valid HTTPS URL required" });
    }

    const webhookUrl = `${url}/api/telegram/webhook`;
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query', 'inline_query'],
        drop_pending_updates: true
      })
    });
    
    const result = await response.json();
    console.log('Webhook setup result:', result);
    
    res.json({ success: result.ok, result });
  } catch (error: any) {
    console.error('Webhook setup error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/telegram/webhook-info", async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(503).json({ error: "Telegram bot not configured" });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
    const result = await response.json();
    res.json(result);
  } catch (error: any) {
    console.error('Webhook info error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/telegram/bot-info", async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(503).json({ error: "Telegram bot not configured" });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const result = await response.json();
    res.json(result);
  } catch (error: any) {
    console.error('Bot info error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/telegram/setup-commands", async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(503).json({ error: "Telegram bot not configured" });
  }

  try {
    const commands = [
      { command: 'start', description: 'Главное меню' },
      { command: 'showcase', description: 'Портфолио решений' },
      { command: 'referral', description: 'Партнёрская программа' },
      { command: 'tasks', description: 'Задания & награды' },
      { command: 'profile', description: 'Личный кабинет' },
      { command: 'help', description: 'Помощь' },
    ];

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands })
    });

    const result = await response.json();
    res.json({ success: result.ok, result });
  } catch (error: any) {
    console.error('Setup commands error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/api/telegram/setup-menu-button", async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(503).json({ error: "Telegram bot not configured" });
  }

  try {
    const webAppUrl = process.env.WEBAPP_URL || (
      process.env.RAILWAY_PUBLIC_DOMAIN 
        ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : `https://${process.env.REPLIT_DEV_DOMAIN}`
    );
    
    if (!webAppUrl) {
      return res.status(503).json({ error: "WEBAPP_URL not configured" });
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: 'Open App',
          web_app: { url: webAppUrl }
        }
      })
    });

    const result = await response.json();
    res.json({ success: result.ok, result });
  } catch (error: any) {
    console.error('Menu button setup error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

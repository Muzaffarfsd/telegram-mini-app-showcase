import { Router } from "express";
import { db } from "../db";
import { users, tasksProgress, dailyTasks } from "../../shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { verifyTelegramUser, tasksStartSchema, tasksVerifySchema, TELEGRAM_BOT_TOKEN } from "./shared";

const router = Router();

router.post("/api/tasks/verify-telegram-subscription", verifyTelegramUser, async (req: any, res) => {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      return res.status(503).json({ error: 'Telegram bot not configured' });
    }

    const { telegramId, channelUsername } = req.body;
    const authTelegramId = req.telegramUser.id;

    if (telegramId !== undefined && Number(telegramId) !== authTelegramId) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Cannot verify subscription for another user'
      });
    }

    const userTelegramId = authTelegramId;

    if (!channelUsername) {
      return res.status(400).json({ error: 'channelUsername is required' });
    }

    const normalizedChannel = channelUsername.startsWith('@') ? channelUsername : `@${channelUsername}`;

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
      const errorDesc = result.description || '';
      
      if (errorDesc.includes('user not found') || 
          errorDesc.includes('USER_NOT_PARTICIPANT') ||
          errorDesc.includes('PARTICIPANT_NOT_FOUND')) {
        return res.json({
          subscribed: false,
          status: 'not_member',
          message: 'Вы не подписаны на канал. Пожалуйста, подпишитесь и попробуйте снова.'
        });
      }

      if (errorDesc.includes('CHAT_ADMIN_REQUIRED') || 
          errorDesc.includes('member list is inaccessible')) {
        return res.status(400).json({
          error: 'bot_not_admin',
          message: 'Не удалось проверить подписку. Бот не имеет прав администратора в канале.'
        });
      }

      if (errorDesc.includes('chat not found') || errorDesc.includes('CHAT_NOT_FOUND')) {
        return res.status(400).json({
          error: 'channel_not_found',
          message: 'Канал не найден. Проверьте правильность имени канала.'
        });
      }

      return res.status(400).json({
        error: 'telegram_api_error',
        message: 'Ошибка проверки подписки. Попробуйте позже.'
      });
    }

    const memberStatus = result.result?.status;
    const isSubscribed = ['creator', 'administrator', 'member'].includes(memberStatus);

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

router.post("/api/tasks/complete", verifyTelegramUser, async (req: any, res) => {
  try {
    const authTelegramId = req.telegramUser.id;
    const { telegramId: bodyTelegramId, task_id, platform, coins_reward, channelUsername } = req.body;

    if (bodyTelegramId !== undefined && Number(bodyTelegramId) !== authTelegramId) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Cannot complete task for another user'
      });
    }

    const telegramId = authTelegramId;

    if (!task_id || !platform || coins_reward === undefined) {
      return res.status(400).json({ error: 'task_id, platform, and coins_reward are required' });
    }

    const today = new Date().toISOString().split('T')[0];
    
    const [existingProgress] = await db.select().from(tasksProgress)
      .where(and(
        eq(tasksProgress.telegramId, telegramId),
        eq(tasksProgress.taskId, task_id),
        eq(tasksProgress.completed, true)
      ));

    if (existingProgress) {
      if (platform.toLowerCase() === 'daily') {
        const completedDate = existingProgress.completedAt?.toISOString().split('T')[0];
        if (completedDate === today) {
          return res.status(400).json({ 
            error: 'Daily task already completed today',
            message: 'This daily task was already completed today. Try again tomorrow!'
          });
        }
      } else {
        return res.status(400).json({ 
          error: 'Task already completed',
          message: 'This task has already been completed'
        });
      }
    }

    if (platform.toLowerCase() === 'telegram' && channelUsername) {
      if (!TELEGRAM_BOT_TOKEN) {
        return res.status(503).json({ error: 'Telegram bot not configured' });
      }

      const normalizedChannel = channelUsername.startsWith('@') ? channelUsername : `@${channelUsername}`;

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
        const errorDesc = result.description || '';
        
        if (errorDesc.includes('USER_NOT_PARTICIPANT') || 
            errorDesc.includes('PARTICIPANT_NOT_FOUND') ||
            errorDesc.includes('user not found')) {
          return res.status(400).json({
            error: 'not_subscribed',
            subscribed: false,
            message: 'Вы не подписаны на канал. Пожалуйста, подпишитесь и попробуйте снова.'
          });
        }
        
        if (errorDesc.includes('CHAT_ADMIN_REQUIRED') || 
            errorDesc.includes('member list is inaccessible')) {
          return res.status(400).json({
            error: 'bot_not_admin',
            subscribed: false,
            message: 'Не удалось проверить подписку.'
          });
        }
        
        if (errorDesc.includes('chat not found') || errorDesc.includes('CHAT_NOT_FOUND')) {
          return res.status(400).json({
            error: 'channel_not_found',
            subscribed: false,
            message: 'Канал не найден.'
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
        return res.status(400).json({
          error: 'not_subscribed',
          subscribed: false,
          status: memberStatus,
          message: 'Пожалуйста, сначала подпишитесь на канал'
        });
      }
    }

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

    let [userData] = await db.select().from(users)
      .where(eq(users.telegramId, telegramId));

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [updatedUser] = await db.update(users)
      .set({
        totalCoins: (userData.totalCoins || 0) + coins_reward,
        availableCoins: (userData.availableCoins || 0) + coins_reward,
        completedTasks: (userData.completedTasks || 0) + 1,
        updatedAt: new Date()
      })
      .where(eq(users.telegramId, telegramId))
      .returning();

    let streakValue = updatedUser.currentStreak || 0;
    const todayForStreak = new Date().toISOString().split('T')[0];
    
    if (platform.toLowerCase() === 'daily') {
      let lastActivityStr: string | null = null;
      if (updatedUser.lastVisitDate) {
        if (typeof updatedUser.lastVisitDate === 'string') {
          lastActivityStr = updatedUser.lastVisitDate;
        } else if (typeof (updatedUser.lastVisitDate as any).toISOString === 'function') {
          lastActivityStr = (updatedUser.lastVisitDate as Date).toISOString().split('T')[0];
        } else {
          lastActivityStr = String(updatedUser.lastVisitDate);
        }
      }
      
      if (lastActivityStr) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActivityStr === yesterdayStr) {
          streakValue += 1;
        } else if (lastActivityStr === todayForStreak) {
          // keep current
        } else {
          streakValue = 1;
        }
      } else {
        streakValue = 1;
      }
      
      await db.update(users)
        .set({ 
          currentStreak: streakValue,
          bestStreak: Math.max(updatedUser.bestStreak || 1, streakValue),
          lastVisitDate: todayForStreak
        })
        .where(eq(users.telegramId, telegramId));
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

router.get("/api/user/:telegramId/tasks-progress", verifyTelegramUser, async (req: any, res) => {
  try {
    const telegramId = parseInt(req.params.telegramId);
    const authTelegramId = req.telegramUser.id;

    if (telegramId !== authTelegramId) {
      return res.status(403).json({ error: 'Not authorized to view this user\'s progress' });
    }

    const completedTasksProgress = await db.select()
      .from(tasksProgress)
      .where(and(
        eq(tasksProgress.telegramId, telegramId),
        eq(tasksProgress.completed, true)
      ));

    const completedTaskIds = completedTasksProgress.map(t => t.taskId);

    const [userData] = await db.select()
      .from(users)
      .where(eq(users.telegramId, telegramId));

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

router.get("/api/tasks/balance", verifyTelegramUser, async (req: any, res) => {
  try {
    const telegram_id = req.telegramUser.id;

    const [userData] = await db.select().from(users).where(eq(users.telegramId, telegram_id));

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

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

router.get("/api/tasks/progress", verifyTelegramUser, async (req: any, res) => {
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

router.post("/api/tasks/start", verifyTelegramUser, async (req: any, res) => {
  const validationResult = tasksStartSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: validationResult.error.issues 
    });
  }
  
  try {
    const telegram_id = req.telegramUser.id;
    const { task_id, platform, task_type, coins_reward } = validationResult.data;

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
      if (existing.lastAttemptAt) {
        const timeSinceLastAttempt = Date.now() - new Date(existing.lastAttemptAt).getTime();
        if (timeSinceLastAttempt < 30000) {
          return res.status(429).json({ 
            error: 'Too many attempts',
            retry_after: Math.ceil((30000 - timeSinceLastAttempt) / 1000)
          });
        }
      }

      if ((existing.attempts || 0) >= 3) {
        return res.status(403).json({ error: 'Max attempts reached' });
      }

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

router.post("/api/tasks/verify", verifyTelegramUser, async (req: any, res) => {
  const validationResult = tasksVerifySchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: validationResult.error.issues 
    });
  }
  
  try {
    const telegram_id = req.telegramUser.id;
    const { task_id } = validationResult.data;

    const [taskProgressRecord] = await db
      .select()
      .from(tasksProgress)
      .where(
        and(
          eq(tasksProgress.telegramId, telegram_id),
          eq(tasksProgress.taskId, task_id)
        )
      );

    if (!taskProgressRecord) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (taskProgressRecord.completed) {
      return res.status(400).json({ error: 'Task already completed' });
    }

    const timeSpent = taskProgressRecord.startedAt 
      ? Date.now() - new Date(taskProgressRecord.startedAt).getTime()
      : 0;

    const minimumTime = 5000;

    if (timeSpent < minimumTime) {
      await db
        .update(tasksProgress)
        .set({ verificationStatus: 'failed' })
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

    const verified = timeSpent >= minimumTime;

    if (verified) {
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

      const [verifyUserData] = await db.select().from(users)
        .where(eq(users.telegramId, telegram_id));

      if (!verifyUserData) {
        return res.status(404).json({ error: 'User not found' });
      }

      await db.update(users)
        .set({
          totalCoins: (verifyUserData.totalCoins || 0) + taskProgressRecord.coinsReward,
          availableCoins: (verifyUserData.availableCoins || 0) + taskProgressRecord.coinsReward,
          completedTasks: (verifyUserData.completedTasks || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(users.telegramId, telegram_id));

      res.json({ 
        success: true, 
        verified: true,
        coins_awarded: taskProgressRecord.coinsReward,
        new_balance: (verifyUserData.totalCoins || 0) + taskProgressRecord.coinsReward
      });
    } else {
      await db
        .update(tasksProgress)
        .set({ verificationStatus: 'failed' })
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

export default router;

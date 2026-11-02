import { Router } from "express";
import { db } from "../db";
import { users, tasksProgress } from "../../shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { verifyTelegramUser, TELEGRAM_BOT_TOKEN } from "./shared";

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

// Rewards, recurrence and verification targets are defined on the server.
// A client cannot turn an unverified action into a valuable task or set its price.
const rewardTasks: Record<string, { platform: string; taskType: string; coins: number; channel?: string }> = {
  daily_visit: { platform: 'daily', taskType: 'visit', coins: 10 },
  telegram_subscribe: { platform: 'telegram', taskType: 'subscription', coins: 100, channel: '@web4_tg' },
};

router.post("/api/tasks/complete", verifyTelegramUser, async (req: any, res) => {
  try {
    const telegramId = req.telegramUser.id;
    if (req.body.telegramId !== undefined && Number(req.body.telegramId) !== telegramId) {
      return res.status(403).json({ error: 'Forbidden', message: 'Cannot complete task for another user' });
    }
    const taskId = typeof req.body.task_id === 'string' ? req.body.task_id : '';
    const task = Object.prototype.hasOwnProperty.call(rewardTasks, taskId) ? rewardTasks[taskId] : undefined;
    if (!task) {
      return res.status(400).json({ error: 'unsupported_task', message: 'Это задание сейчас недоступно.' });
    }

    if (task.channel) {
      if (!TELEGRAM_BOT_TOKEN) return res.status(503).json({ error: 'Telegram bot not configured' });
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMember`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: task.channel, user_id: telegramId }),
        signal: AbortSignal.timeout(8000),
      });
      const result = await response.json();
      if (!result.ok) {
        const description = String(result.description || '');
        if (/user not found|USER_NOT_PARTICIPANT|PARTICIPANT_NOT_FOUND/i.test(description)) {
          return res.status(400).json({ error: 'not_subscribed', message: 'Сначала подпишитесь на канал.' });
        }
        return res.status(503).json({ error: 'telegram_verification_unavailable', message: 'Не удалось проверить подписку. Попробуйте позже.' });
      }
      const member = result.result;
      const subscribed = ['creator', 'administrator', 'member'].includes(member?.status) ||
        (member?.status === 'restricted' && member?.is_member === true);
      if (!subscribed) return res.status(400).json({ error: 'not_subscribed', message: 'Сначала подпишитесь на канал.' });
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
    const outcome = await db.transaction(async (tx) => {
      // The transaction-level lock also serializes requests arriving at different server processes.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${telegramId}::bigint)`);
      const [user] = await tx.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);
      if (!user) return { kind: 'missing' as const };
      const [existing] = await tx.select().from(tasksProgress).where(and(
        eq(tasksProgress.telegramId, telegramId), eq(tasksProgress.taskId, taskId),
      )).limit(1);
      const lastDay = existing?.completedAt ? new Date(existing.completedAt).toISOString().slice(0, 10) : null;
      if (existing?.completed && (task.platform !== 'daily' || lastDay === today)) {
        return { kind: 'completed' as const };
      }
      await tx.insert(tasksProgress).values({
        telegramId, taskId, platform: task.platform, taskType: task.taskType, coinsReward: task.coins,
        completed: true, verificationStatus: 'verified', attempts: 1, lastAttemptAt: now,
        startedAt: now, completedAt: now, verificationData: task.channel ? { channel: task.channel } : {},
      }).onConflictDoUpdate({
        target: [tasksProgress.telegramId, tasksProgress.taskId],
        set: { platform: task.platform, taskType: task.taskType, coinsReward: task.coins,
          completed: true, verificationStatus: 'verified', completedAt: now, lastAttemptAt: now,
          attempts: sql`${tasksProgress.attempts} + 1`, verificationData: task.channel ? { channel: task.channel } : {} },
      });
      const lastVisit = typeof user.lastVisitDate === 'string' ? user.lastVisitDate.slice(0, 10) : String(user.lastVisitDate).slice(0, 10);
      const streak = task.platform !== 'daily' ? user.currentStreak :
        lastVisit === today ? user.currentStreak : lastVisit === yesterday ? user.currentStreak + 1 : 1;
      const [updated] = await tx.update(users).set({
        totalCoins: sql`${users.totalCoins} + ${task.coins}`,
        availableCoins: sql`${users.availableCoins} + ${task.coins}`,
        completedTasks: sql`${users.completedTasks} + 1`,
        updatedAt: now,
        ...(task.platform === 'daily' ? { currentStreak: streak, bestStreak: Math.max(user.bestStreak, streak), lastVisitDate: today } : {}),
      }).where(eq(users.telegramId, telegramId)).returning();
      return { kind: 'success' as const, updated, streak };
    });
    if (outcome.kind === 'missing') return res.status(404).json({ error: 'User not found' });
    if (outcome.kind === 'completed') return res.status(400).json({ error: 'already_completed', message: 'Это задание уже выполнено.' });
    return res.json({ success: true, coins_awarded: task.coins, task_id: taskId,
      new_balance: outcome.updated.availableCoins, total_tasks_completed: outcome.updated.completedTasks, streak: outcome.streak });
  } catch (error) {
    console.error('[Tasks] Error completing task:', error);
    return res.status(500).json({ error: 'Failed to complete task' });
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

// The old timer-based endpoints did not verify external activity and trusted client rewards.
// Keep a clear response for outdated clients instead of issuing unverified coins.
router.post(["/api/tasks/start", "/api/tasks/verify"], verifyTelegramUser, (_req, res) => {
  return res.status(410).json({ error: 'unsupported_task_flow', message: 'Обновите приложение, чтобы увидеть доступные задания.' });
});

export default router;

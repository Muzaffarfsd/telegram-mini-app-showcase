import { Router } from "express";
import { db } from "../db";
import { users, dailyTasks } from "../../shared/schema";
import { desc, eq, and, sql, count } from "drizzle-orm";
import { parsePaginationParams, createPaginatedResponse, withTimeout, isDbTimeoutError, dbTimeoutError, internalError } from "../apiUtils";
import { getCached, setCache, invalidateCache, cacheKeys, CACHE_TTL } from '../redis';
import { verifyTelegramUser, awardXpSchema, calculateXpToNextLevel } from "./shared";

const router = Router();

router.get("/api/gamification/stats/:telegram_id", async (req, res) => {
  try {
    const telegram_id = parseInt(req.params.telegram_id);

    let [userData] = await db.select().from(users).where(eq(users.telegramId, telegram_id));

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

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

router.post("/api/gamification/award-xp", verifyTelegramUser, async (req: any, res) => {
  try {
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
    
    await invalidateCache('leaderboard:*');
  } catch (error) {
    console.error('Error awarding XP:', error);
    res.status(500).json({ error: 'Failed to award XP' });
  }
});

router.get("/api/gamification/daily-tasks/:telegram_id", verifyTelegramUser, async (req: any, res) => {
  try {
    const telegram_id = parseInt(req.params.telegram_id);
    const authTelegramId = req.telegramUser.id;

    if (telegram_id !== authTelegramId) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Cannot view another user\'s daily tasks'
      });
    }

    const today = new Date().toISOString().split('T')[0];

    let tasks = await db.select().from(dailyTasks).where(
      and(
        eq(dailyTasks.telegramId, telegram_id),
        eq(dailyTasks.taskDate, today)
      )
    );

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

router.post("/api/gamification/complete-task", verifyTelegramUser, async (req: any, res) => {
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

    const xpReward = task.xpReward || 0;
    await db.update(users)
      .set({
        totalXp: sql`COALESCE(${users.totalXp}, 0) + ${xpReward}`,
        xp: sql`COALESCE(${users.xp}, 0) + ${xpReward}`,
        completedTasks: sql`COALESCE(${users.completedTasks}, 0) + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.telegramId, telegram_id));

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

router.get("/api/gamification/leaderboard", async (req, res) => {
  try {
    const { limit, offset } = parsePaginationParams(req);

    const cacheKey = cacheKeys.leaderboard();
    if (limit === 20 && offset === 0) {
      const cached = await getCached<any>(cacheKey);
      if (cached) {
        return res.json(cached);
      }
    }

    const [totalResult, top] = await Promise.all([
      withTimeout(db.select({ count: count() }).from(users)),
      withTimeout(
        db.select({
          telegramId: users.telegramId,
          level: users.level,
          totalXp: users.totalXp,
          username: users.username,
          firstName: users.firstName,
        })
        .from(users)
        .orderBy(desc(users.totalXp))
        .limit(limit)
        .offset(offset)
      ),
    ]);

    const total = totalResult[0]?.count ?? 0;
    const response = createPaginatedResponse(top, total, { limit, offset });

    if (limit === 20 && offset === 0) {
      await setCache(cacheKey, response, CACHE_TTL.LEADERBOARD);
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    if (isDbTimeoutError(error)) {
      return dbTimeoutError(res, 'Failed to fetch leaderboard: database timeout');
    }
    return internalError(res, 'Failed to fetch leaderboard');
  }
});

export default router;

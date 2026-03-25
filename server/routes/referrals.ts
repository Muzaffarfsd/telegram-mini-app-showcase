import { Router } from "express";
import { db } from "../db";
import { users, referrals } from "../../shared/schema";
import { desc, eq, sql } from "drizzle-orm";
import { withTimeout, isDbTimeoutError, validationError, notFoundError, duplicateEntryError, dbTimeoutError, internalError } from "../apiUtils";
import { verifyTelegramUser, referralApplySchema, generateReferralCode, calculateTier } from "./shared";

const router = Router();

router.post("/api/referrals/user/init", verifyTelegramUser, async (req: any, res) => {
  try {
    const telegram_id = req.telegramUser.id;
    const username = req.telegramUser.username;
    const first_name = req.telegramUser.first_name;
    const last_name = req.telegramUser.last_name;
    const { referred_by_code } = req.body;

    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }

    const [existingUser] = await db.select().from(users).where(eq(users.telegramId, telegram_id));

    if (existingUser) {
      return res.json(existingUser);
    }

    const referralCode = generateReferralCode();
    
    const [newUser] = await db.insert(users).values({
      telegramId: telegram_id,
      username,
      firstName: first_name,
      lastName: last_name,
      referralCode: referralCode,
      referredByCode: referred_by_code || null,
    }).returning();

    if (referred_by_code) {
      const [referrer] = await db.select().from(users).where(eq(users.referralCode, referred_by_code));

      if (referrer) {
        await db.insert(referrals).values({
          referrerTelegramId: referrer.telegramId,
          referredTelegramId: telegram_id,
          bonusAmount: "100",
          status: 'active',
        });

        const newTotalReferrals = (referrer.totalReferrals || 0) + 1;
        await db.update(users)
          .set({
            totalReferrals: newTotalReferrals,
            activeReferrals: (referrer.activeReferrals || 0) + 1,
            totalEarnings: sql`${users.totalEarnings} + 100`,
            tier: calculateTier(newTotalReferrals),
          })
          .where(eq(users.telegramId, referrer.telegramId));

        const REFERRAL_COINS_REWARD = 100;
        await db.update(users)
          .set({
            totalCoins: sql`COALESCE(${users.totalCoins}, 0) + ${REFERRAL_COINS_REWARD}`,
            availableCoins: sql`COALESCE(${users.availableCoins}, 0) + ${REFERRAL_COINS_REWARD}`,
            lastVisitDate: new Date().toISOString().split('T')[0],
          })
          .where(eq(users.telegramId, referrer.telegramId));

        const WELCOME_BONUS = 50;
        await db.update(users)
          .set({
            totalCoins: WELCOME_BONUS,
            availableCoins: WELCOME_BONUS,
          })
          .where(eq(users.telegramId, telegram_id));
      }
    }

    res.json(newUser);
  } catch (error) {
    console.error('Error initializing user:', error);
    res.status(500).json({ error: 'Failed to initialize user' });
  }
});

router.get("/api/referrals/stats/:telegram_id", verifyTelegramUser, async (req: any, res) => {
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

router.get("/api/referrals/referrals/:telegram_id", async (req, res) => {
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

router.post("/api/referral/apply", verifyTelegramUser, async (req: any, res) => {
  try {
    const validationResult = referralApplySchema.safeParse(req.body);
    if (!validationResult.success) {
      return validationError(res, 'Validation failed', { 
        errors: validationResult.error.errors 
      });
    }
    
    const { userId, referralCode } = req.body;

    if (!userId || !referralCode) {
      return validationError(res, 'userId and referralCode are required');
    }

    const codePrefix = 'W4T';
    if (!referralCode.startsWith(codePrefix)) {
      return validationError(res, 'Неверный формат кода');
    }

    const encodedId = referralCode.slice(codePrefix.length);
    const referrerTelegramId = parseInt(encodedId, 36);

    if (isNaN(referrerTelegramId)) {
      return validationError(res, 'Неверный реферальный код');
    }

    if (referrerTelegramId === userId) {
      return validationError(res, 'Нельзя использовать свой собственный код');
    }

    const [referrer] = await withTimeout(
      db.select().from(users).where(eq(users.telegramId, referrerTelegramId))
    );
    if (!referrer) {
      return notFoundError(res, 'Пользователь с таким кодом не найден');
    }

    const [existingReferral] = await withTimeout(
      db.select().from(referrals).where(eq(referrals.referredTelegramId, userId))
    );
    
    if (existingReferral) {
      return duplicateEntryError(res, 'Вы уже использовали реферальный код', {
        existingReferrerId: existingReferral.referrerTelegramId,
      });
    }

    const bonusAmount = "100";
    await withTimeout(
      db.insert(referrals).values({
        referrerTelegramId: referrerTelegramId,
        referredTelegramId: userId,
        bonusAmount: bonusAmount,
        status: 'pending',
      })
    );

    await withTimeout(
      db.update(users)
        .set({ 
          totalReferrals: sql`COALESCE(${users.totalReferrals}, 0) + 1`,
          totalEarnings: sql`COALESCE(${users.totalEarnings}, 0) + 100`
        })
        .where(eq(users.telegramId, referrerTelegramId))
    );

    res.json({ success: true, message: 'Реферальный код успешно применён!' });
  } catch (error) {
    console.error('Error applying referral code:', error);
    if (isDbTimeoutError(error)) {
      return dbTimeoutError(res, 'Ошибка при применении кода: database timeout');
    }
    return internalError(res, 'Ошибка при применении кода');
  }
});

export default router;

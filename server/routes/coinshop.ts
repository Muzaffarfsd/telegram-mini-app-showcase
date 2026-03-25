import { Router } from "express";
import { db } from "../db";
import { users } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { verifyTelegramUser } from "./shared";

const router = Router();

const DISCOUNT_TIERS = [
  { id: 'tier1', name: '5% Скидка', nameEn: '5% Discount', coins: 500, discount: 5 },
  { id: 'tier2', name: '10% Скидка', nameEn: '10% Discount', coins: 1000, discount: 10 },
  { id: 'tier3', name: '15% Скидка', nameEn: '15% Discount', coins: 2000, discount: 15 },
  { id: 'tier4', name: '25% Скидка', nameEn: '25% Discount', coins: 5000, discount: 25 },
  { id: 'tier5', name: '50% Скидка', nameEn: '50% Discount', coins: 10000, discount: 50 },
];

router.get("/api/coinshop/tiers", (req, res) => {
  res.json({ tiers: DISCOUNT_TIERS });
});

router.post("/api/coinshop/redeem", verifyTelegramUser, async (req: any, res) => {
  try {
    const telegramId = req.telegramUser.id;
    const { tierId } = req.body;

    if (!tierId) {
      return res.status(400).json({ error: 'tierId is required' });
    }

    const tier = DISCOUNT_TIERS.find(t => t.id === tierId);
    if (!tier) {
      return res.status(404).json({ error: 'Discount tier not found' });
    }

    const [userData] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    const availableCoins = userData.availableCoins || 0;
    if (availableCoins < tier.coins) {
      return res.status(400).json({
        error: 'Insufficient coins',
        required: tier.coins,
        available: availableCoins,
      });
    }

    const [updatedUser] = await db.update(users)
      .set({
        availableCoins: availableCoins - tier.coins,
        spentCoins: (userData.spentCoins || 0) + tier.coins,
        updatedAt: new Date(),
      })
      .where(eq(users.telegramId, telegramId))
      .returning();

    const discountCode = `W4T-${tier.discount}OFF-${Date.now().toString(36).toUpperCase()}`;

    res.json({
      success: true,
      discountCode,
      discountPercent: tier.discount,
      coinsSpent: tier.coins,
      newBalance: updatedUser.availableCoins,
    });
  } catch (error) {
    console.error('Error redeeming coins:', error);
    res.status(500).json({ error: 'Failed to redeem coins' });
  }
});

router.get("/api/coinshop/balance", verifyTelegramUser, async (req: any, res) => {
  try {
    const telegramId = req.telegramUser.id;
    const [userData] = await db.select().from(users).where(eq(users.telegramId, telegramId));

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      totalCoins: userData.totalCoins || 0,
      availableCoins: userData.availableCoins || 0,
      spentCoins: userData.spentCoins || 0,
    });
  } catch (error) {
    console.error('Error fetching coin balance:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

export default router;

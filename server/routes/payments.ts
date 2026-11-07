import { Router } from "express";
import type { Request, Response } from "express";
import { verifyTelegramUser, requireAdmin, stripeClient } from "./shared";
import { z } from 'zod';
import { createHash } from 'node:crypto';

const router = Router();

// The legacy checkout has no server-owned quotation ledger. Only an administrator can issue a payable quote.
router.post("/api/create-payment-intent", verifyTelegramUser, requireAdmin, async (req: Request, res: Response) => {
  if (!stripeClient) {
    return res.status(503).json({ 
      error: "Payment processing is not available. Stripe not configured." 
    });
  }

  try {
    const parsed = z.object({ amount: z.number().finite().min(1).max(10000000), project_name: z.string().min(1).max(200), features: z.array(z.string().max(100)).max(50).default([]), customerTelegramId: z.number().int().positive().safe() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid payment quotation' });
    const { amount, project_name, features, customerTelegramId } = parsed.data;
    
    const amountInCents = Math.round(amount * 100);
    
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amountInCents,
      currency: "rub",
      metadata: {
        project_name: project_name || 'WEB4TG Project',
        features_hash: createHash('sha256').update(JSON.stringify(features)).digest('hex'),
        features_count: String(features.length),
        service: 'WEB4TG Development',
        telegram_user_id: String(customerTelegramId),
      },
      description: `WEB4TG Development: ${project_name}`,
    });
    
    res.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error: any) {
    console.error('Stripe payment intent creation error:', error instanceof Error ? error.name : 'unknown');
    res.status(500).json({ 
      error: "Payment provider unavailable"
    });
  }
});

router.post("/api/payment-success", verifyTelegramUser, async (req: Request, res: Response) => {
  try {
    if (!stripeClient) return res.status(503).json({ error: 'Payment provider unavailable' });
    const id = req.body?.paymentIntentId;
    if (typeof id !== 'string' || !/^pi_[A-Za-z0-9]{1,200}$/.test(id)) return res.status(400).json({ error: 'Invalid payment reference' });
    const intent = await stripeClient.paymentIntents.retrieve(id);
    if (intent.metadata.telegram_user_id !== String(req.telegramUser!.id)) return res.status(403).json({ error: 'Forbidden' });
    if (intent.status !== 'succeeded') return res.status(409).json({ error: 'Payment is not complete' });
    // This read-only confirmation cannot create a paid project or award any value.
    res.json({ success: true, paymentIntentId: intent.id });
  } catch (error: any) {
    console.error('Payment success handling error:', error instanceof Error ? error.name : 'unknown');
    res.status(500).json({ error: 'Payment verification unavailable' });
  }
});

router.get("/api/payment-status", (req, res) => {
  res.json({ 
    stripe_available: !!stripeClient,
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;

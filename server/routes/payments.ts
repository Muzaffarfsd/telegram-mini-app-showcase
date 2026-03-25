import { Router } from "express";
import type { Request, Response } from "express";
import { verifyTelegramUser, stripeClient } from "./shared";

const router = Router();

router.post("/api/create-payment-intent", verifyTelegramUser, async (req: Request, res: Response) => {
  if (!stripeClient) {
    return res.status(503).json({ 
      error: "Payment processing is not available. Stripe not configured." 
    });
  }

  try {
    const { amount, project_name, features } = req.body;
    
    const amountInCents = Math.round(amount * 100);
    
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amountInCents,
      currency: "rub",
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

router.post("/api/payment-success", verifyTelegramUser, async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, projectName, features } = req.body;
    
    console.log('Payment successful for project:', projectName);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Payment success handling error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/payment-status", (req, res) => {
  res.json({ 
    stripe_available: !!stripeClient,
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;

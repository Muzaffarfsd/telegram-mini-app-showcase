import { Router } from "express";
import { verifyTelegramUser, TELEGRAM_BOT_TOKEN, notificationSendSchema, notificationBroadcastSchema, notificationInteractiveSchema } from "./shared";

const router = Router();

router.post("/api/notifications/send", verifyTelegramUser, async (req: any, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(503).json({ error: 'Telegram bot not configured' });
  }
  
  const validationResult = notificationSendSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: validationResult.error.issues 
    });
  }
  
  try {
    const { chatId, message, parseMode } = validationResult.data;
    
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

router.post("/api/notifications/broadcast", verifyTelegramUser, async (req: any, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(503).json({ error: 'Telegram bot not configured' });
  }
  
  const validationResult = notificationBroadcastSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: validationResult.error.issues 
    });
  }
  
  try {
    const { userIds, message, parseMode } = validationResult.data;
    
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

router.post("/api/notifications/interactive", verifyTelegramUser, async (req: any, res) => {
  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(503).json({ error: 'Telegram bot not configured' });
  }
  
  const validationResult = notificationInteractiveSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: validationResult.error.issues 
    });
  }
  
  try {
    const { chatId, message, buttons, parseMode } = validationResult.data;
    
    const inlineKeyboard = buttons ? {
      inline_keyboard: buttons.map((row) => 
        row.map((btn) => ({
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

export default router;

import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db';
import { users } from '../../shared/schema';
import { canonicalDemoShareId, demoShareEntries, demoShareStartParam } from '../../shared/demoShare';
import { verifyTelegramUser } from './shared';

const schema = z.object({
  language: z.enum(['ru', 'en']).default('ru'),
  referral: z.boolean().default(false),
  demoId: z.string().min(1).max(50).optional(),
}).strict();

const miniAppUrl = 'https://t.me/w4tg_bot/w4tg';
// Telegram downloads the JPEG itself. This is a fixed, public application asset.
const inviteImageUrl = 'https://w4tg.up.railway.app/share/invite-three-stores-v1.jpg';

interface InviteDependencies {
  findReferralCode: (telegramId: number) => Promise<string | null>;
  telegramFetch: typeof fetch;
}

const defaults: InviteDependencies = {
  async findReferralCode(telegramId) {
    const [user] = await db.select({ referralCode: users.referralCode })
      .from(users).where(eq(users.telegramId, telegramId)).limit(1);
    return user?.referralCode ?? null;
  },
  telegramFetch: (...args) => fetch(...args),
};

/** The prepared message belongs to the Telegram user authenticated by initData. */
export function createInviteRouter(dependencies: InviteDependencies = defaults) {
  const router = Router();
  router.post('/api/telegram/prepare-invite', verifyTelegramUser, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid invitation request' });
    const demoId = parsed.data.demoId ? canonicalDemoShareId(parsed.data.demoId) : null;
    if ((parsed.data.demoId && !demoId) || (demoId && parsed.data.referral)) {
      return res.status(400).json({ error: 'Invalid invitation request' });
    }

    const telegramId = req.telegramUser?.id;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return res.status(503).json({ error: 'Telegram bot not configured' });
    if (!Number.isSafeInteger(telegramId) || !telegramId || telegramId < 1) {
      return res.status(401).json({ error: 'Invalid Telegram user' });
    }

    try {
      let deepLink = miniAppUrl;
      if (demoId) {
        deepLink += `?startapp=${demoShareStartParam(demoId)}`;
      } else if (parsed.data.referral) {
        const code = await dependencies.findReferralCode(telegramId);
        // startapp supports only these URL-safe characters, with a maximum of 64 bytes.
        if (code && /^[A-Za-z0-9_-]{1,64}$/.test(code)) {
          deepLink += `?startapp=${encodeURIComponent(code)}`;
        }
      }

      const ru = parsed.data.language === 'ru';
      const photoUrl = demoId ? `https://w4tg.up.railway.app/share/demos/${demoId}.jpg` : inviteImageUrl;
      const caption = demoId
        ? ru
          ? `<b>${demoShareEntries[demoId].ru}</b>\n\nПосмотри демо приложения для бизнеса в Telegram.`
          : `<b>${demoShareEntries[demoId].en}</b>\n\nExplore this business app demo in Telegram.`
        : ru
          ? '<b>WEB4TG</b>\n\nПосмотри, как может выглядеть твой магазин в Telegram.'
          : '<b>WEB4TG</b>\n\nSee what your store could look like in Telegram.';
      const response = await dependencies.telegramFetch(`https://api.telegram.org/bot${token}/savePreparedInlineMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          user_id: telegramId,
          result: {
            type: 'photo',
            id: demoId ? `web4tg-demo-${demoId}` : 'web4tg-invite',
            photo_url: photoUrl,
            thumbnail_url: photoUrl,
            parse_mode: 'HTML',
            caption,
            reply_markup: { inline_keyboard: [[{ text: ru ? 'Открыть приложение' : 'Open app', url: deepLink, style: 'primary' }]] },
          },
          allow_user_chats: true,
          allow_group_chats: true,
          allow_channel_chats: true,
        }),
      });
      const data: unknown = await response.json();
      if (!response.ok || !data || typeof data !== 'object' || !('ok' in data) || data.ok !== true ||
          !('result' in data) || !data.result || typeof data.result !== 'object' ||
          !('id' in data.result) || typeof data.result.id !== 'string' || !data.result.id) {
        return res.status(502).json({ error: 'Could not prepare Telegram invitation' });
      }
      return res.json({ messageId: data.result.id, deepLink });
    } catch {
      // Do not log Telegram response bodies or request URLs: they can contain bot credentials.
      return res.status(503).json({ error: 'Could not prepare Telegram invitation' });
    }
  });
  return router;
}

export default createInviteRouter();

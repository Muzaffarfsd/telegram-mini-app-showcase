import { telegramWebhookSecret } from './securityAccess';

export interface WebhookProvisioningOptions {
  botToken?: string;
  webAppUrl?: string;
  fetcher?: typeof fetch;
  runtimeDomain?: string;
  environmentName?: string;
  autoSecure?: boolean;
}

export type WebhookProvisioningStatus =
  | 'disabled' | 'nonproduction_environment' | 'runtime_origin_mismatch'
  | 'invalid_configuration' | 'invalid_secret' | 'lookup_failed'
  | 'not_registered' | 'foreign_webhook' | 'custom_certificate'
  | 'unsupported_configuration' | 'registration_failed' | 'secured';

/**
 * Secure only an existing webhook belonging to this exact production service.
 * This never creates a registration, adopts another callback, or clears pending updates.
 * No provider payload, credential or credential-bearing URL is logged.
 */
export async function secureExistingTelegramWebhook(options: WebhookProvisioningOptions = {}): Promise<WebhookProvisioningStatus> {
  const autoSecure = options.autoSecure ?? process.env.TELEGRAM_WEBHOOK_AUTO_SECURE?.toLowerCase() !== 'false';
  if (!autoSecure) return 'disabled';
  const environmentName = options.environmentName ?? process.env.RAILWAY_ENVIRONMENT_NAME;
  if (environmentName !== undefined && environmentName !== 'production') return 'nonproduction_environment';

  const runtimeDomain = options.runtimeDomain ?? process.env.RAILWAY_PUBLIC_DOMAIN;
  const botToken = options.botToken ?? process.env.TELEGRAM_BOT_TOKEN ?? '';
  const webAppUrl = options.webAppUrl ?? process.env.WEBAPP_URL ?? (runtimeDomain ? `https://${runtimeDomain}` : '');
  if (!/^[1-9]\d{4,19}:[A-Za-z0-9_-]{20,128}$/.test(botToken)) return 'invalid_configuration';
  let origin: string;
  try {
    const configured = new URL(webAppUrl);
    if (configured.protocol !== 'https:' || configured.username || configured.password) return 'invalid_configuration';
    origin = configured.origin;
    if (runtimeDomain !== undefined) {
      if (!/^[A-Za-z0-9](?:[A-Za-z0-9.-]{0,251}[A-Za-z0-9])?$/.test(runtimeDomain) ||
          new URL(`https://${runtimeDomain}`).origin !== origin) return 'runtime_origin_mismatch';
    }
  } catch { return 'invalid_configuration'; }

  const secret = telegramWebhookSecret(botToken);
  if (!secret) return 'invalid_secret';
  const expectedCallback = `${origin}/api/telegram/webhook`;
  const fetcher = options.fetcher ?? fetch;
  let info: Record<string, unknown>;
  try {
    const response = await fetcher(`https://api.telegram.org/bot${botToken}/getWebhookInfo`, {
      method: 'GET', redirect: 'error', signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return 'lookup_failed';
    const data = await response.json();
    if (data?.ok !== true || !data.result || typeof data.result !== 'object' || Array.isArray(data.result)) return 'lookup_failed';
    info = data.result;
  } catch { return 'lookup_failed'; }

  if (info.url === '') return 'not_registered';
  if (typeof info.url !== 'string' || info.url !== expectedCallback) return 'foreign_webhook';
  if (info.has_custom_certificate !== false) return 'custom_certificate';

  const registration: Record<string, unknown> = { url: expectedCallback, secret_token: secret, drop_pending_updates: false };
  if (info.allowed_updates !== undefined) {
    if (!Array.isArray(info.allowed_updates) || info.allowed_updates.length > 100 ||
        !info.allowed_updates.every(value => typeof value === 'string' && /^[a-z_]{1,64}$/.test(value))) return 'unsupported_configuration';
    registration.allowed_updates = info.allowed_updates;
  }
  if (info.max_connections !== undefined) {
    if (!Number.isInteger(info.max_connections) || Number(info.max_connections) < 1 || Number(info.max_connections) > 100) return 'unsupported_configuration';
    registration.max_connections = info.max_connections;
  }

  try {
    const response = await fetcher(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(registration),
    });
    if (!response.ok) return 'registration_failed';
    const data = await response.json();
    return data?.ok === true ? 'secured' : 'registration_failed';
  } catch { return 'registration_failed'; }
}

type TelegramSdk = typeof import('@twa-dev/sdk').default;

// The official script runs before the application entry. Keep every consumer
// on the same bridge so its viewport and button listeners survive startup.
let sdk = window.Telegram?.WebApp as unknown as TelegramSdk;
export { sdk as default };

export async function ensureTelegramSdk(): Promise<void> {
  if (!sdk) {
    await import('@twa-dev/sdk');
    sdk = window.Telegram?.WebApp as unknown as TelegramSdk;
    sdk.ready();
    sdk.expand();
  }
}

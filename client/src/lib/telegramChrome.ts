type TelegramChrome = {
  setBackgroundColor?: (color: string) => void;
  setHeaderColor?: (color: string) => void;
  setBottomBarColor?: (color: string) => void;
};

export type TelegramChromeColors = { background?: string; header?: string; bottom?: string };

/** Read the destination directly: React's route and effects can lag behind the hash. */
export function isHomeHash(): boolean {
  if (typeof window === 'undefined') return false;
  return (window.location.hash.slice(1).split('?')[0] || '/') === '/';
}

/** Restore captured host colours, except that the home screen always uses white. */
export function restoreTelegramChrome(tg: TelegramChrome | undefined, previous: TelegramChromeColors): void {
  const colors = isHomeHash()
    ? { background: '#ffffff', header: '#ffffff', bottom: '#ffffff' }
    : previous;
  // Unsupported methods can throw on older Telegram versions; a failure in
  // one control must not prevent the bottom bar from being updated.
  if (colors.background) try { tg?.setBackgroundColor?.(colors.background); } catch { /* Unsupported. */ }
  if (colors.header) try { tg?.setHeaderColor?.(colors.header); } catch { /* Unsupported. */ }
  if (colors.bottom) try { tg?.setBottomBarColor?.(colors.bottom); } catch { /* Unsupported. */ }
}

export function applyHomeTelegramChrome(): void {
  if (isHomeHash() && typeof window !== 'undefined') {
    restoreTelegramChrome(window.Telegram?.WebApp as TelegramChrome | undefined, {});
  }
}

type TelegramChrome = {
  setBackgroundColor?: (color: string) => void;
  setHeaderColor?: (color: string) => void;
  setBottomBarColor?: (color: string) => void;
  bottomBarColor?: string;
};

export type TelegramChromeColors = { background?: string; header?: string; bottom?: string };

/** React's route can lag behind the hash; home and order always use light surfaces. */
export function isLightDestinationHash(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.hash.slice(1).split('?')[0] || '/';
  return path === '/' || path === '/constructor';
}

/** Restore captured host colours, except on the light home and order screens. */
export function restoreTelegramChrome(tg: TelegramChrome | undefined, previous: TelegramChromeColors): void {
  const colors = isLightDestinationHash()
    ? { background: '#ffffff', header: '#ffffff', bottom: '#ffffff' }
    : previous;
  // Unsupported methods can throw on older Telegram versions; a failure in
  // one control must not prevent the bottom bar from being updated.
  if (colors.background) try { tg?.setBackgroundColor?.(colors.background); } catch { /* Unsupported. */ }
  if (colors.header) try { tg?.setHeaderColor?.(colors.header); } catch { /* Unsupported. */ }
  if (colors.bottom) try { tg?.setBottomBarColor?.(colors.bottom); } catch { /* Unsupported. */ }
}

export function applyLightDestinationTelegramChrome(): void {
  if (isLightDestinationHash() && typeof window !== 'undefined') {
    restoreTelegramChrome(window.Telegram?.WebApp as TelegramChrome | undefined, {});
  }
}

/** Native button visibility can change the viewport and restore an old bar colour. */
export function repairLightBottomBar(tg: TelegramChrome | undefined): void {
  if (!isLightDestinationHash()) return;
  const current = tg?.bottomBarColor?.toLowerCase();
  // Only act on a known wrong value. Multiple hook instances receive the same
  // viewport event; the SDK updates bottomBarColor after the first change.
  if (!current || current === '#fff' || current === '#ffffff') return;
  try { tg?.setBottomBarColor?.('#ffffff'); } catch { /* Unsupported. */ }
}

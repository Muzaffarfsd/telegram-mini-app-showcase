/** Preload only on an explicit contract-route hint or while its questionnaire is open. */
export const CONTRACT_PREVIEW_VERSION = 'real-screens-20261128';
// The preview is about 101px wide: 320px covers DPR up to 3; retain 640px for denser displays.
export const contractPreviewUrl = (key: string) => `/order-contract-previews/${key}${typeof window === 'undefined' || window.devicePixelRatio <= 3 ? '-320' : ''}.webp?v=${CONTRACT_PREVIEW_VERSION}`;

type Task = { key: string; urgent: boolean };
const queue: Task[] = [];
const pending = new Set<string>();
const loaded = new Set<string>();
const listeners = new Map<string, Set<() => void>>();
let active = 0;
const MAX_ACTIVE = 2;
const backgroundOrder = ['takt-coffee', 'lumi-studio', 'medical-center', 'tech', 'flowers', 'women-fashion', 'furniture-studio', 'opt-market', 'jewelry-store', 'china-buyer', 'skincare-aura', 'clothes', 'sneakers'];

function pump() {
  if (typeof Image === 'undefined') return;
  while (active < MAX_ACTIVE && queue.length) {
    const task = queue.shift()!;
    active++;
    const image = new Image();
    image.decoding = 'async';
    if ('fetchPriority' in image) image.fetchPriority = task.urgent ? 'high' : 'low';
    let finished = false;
    const timer = window.setTimeout(() => {
      // Cancel the underlying request before freeing a slot; otherwise a
      // stalled response could continue alongside the next queued image.
      image.onload = null;
      image.onerror = null;
      image.removeAttribute('src');
      finish(false);
    }, 15000);
    const finish = (success: boolean) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      pending.delete(task.key);
      active--;
      if (success) {
        loaded.add(task.key);
        listeners.get(task.key)?.forEach(notify => notify());
      }
      pump();
    };
    image.onload = () => {
      // Avoid swapping the visible image until the browser can paint its pixels.
      if (typeof image.decode === 'function') void image.decode().then(() => finish(true), () => finish(true));
      else finish(true);
    };
    image.onerror = () => finish(false);
    image.src = contractPreviewUrl(task.key);
  }
}

export function warmContractPreview(key: string, urgent = false) {
  if (loaded.has(key)) return;
  if (pending.has(key)) {
    if (urgent) {
      const index = queue.findIndex(task => task.key === key);
      if (index >= 0) { queue.splice(index, 1); queue.unshift({ key, urgent: true }); }
    }
    return;
  }
  pending.add(key);
  if (urgent) queue.unshift({ key, urgent }); else queue.push({ key, urgent });
  pump();
}

export function isContractPreviewReady(key: string) { return loaded.has(key); }
export function subscribeContractPreview(key: string, notify: () => void) {
  let group = listeners.get(key);
  if (!group) listeners.set(key, group = new Set());
  group.add(notify);
  return () => { group!.delete(notify); if (!group!.size) listeners.delete(key); };
}

/** Warm visible projects on navigation, without touching the main-app startup. */
export function primeContractPreviewEntry() {
  let direction = '';
  try {
    const record = JSON.parse(window.localStorage.getItem('web4tg:contract-draft:v1') || 'null');
    if (record?.version === 1 && typeof record.savedAt === 'number' && record.savedAt <= Date.now() && Date.now() - record.savedAt <= 30 * 86400000) direction = record.selection?.direction || '';
  } catch { /* Storage may be blocked or unavailable. */ }
  const food = ['Кофейня', 'Ресторан и доставка'];
  const services = ['Студия красоты', 'Медицинский центр', 'Байер из Китая'];
  const keys = food.includes(direction) ? ['takt-coffee'] : services.includes(direction) ? ['lumi-studio', 'medical-center'] : ['clothes', 'sneakers'];
  keys.forEach(key => warmContractPreview(key, true));
}

/** Prepare other pictures gradually; leave data-saving connections alone. */
export function warmContractPreviewsInBackground() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return;
  backgroundOrder.forEach(key => warmContractPreview(key));
}

export function cancelBackgroundContractPreviews() {
  for (let index = queue.length - 1; index >= 0; index--) {
    if (!queue[index].urgent) { pending.delete(queue[index].key); queue.splice(index, 1); }
  }
}

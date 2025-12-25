import WebApp from '@twa-dev/sdk';
import { apiRequest } from './queryClient';

export const EXPERIMENTS = {
  ONBOARDING_FLOW: 'onboarding_flow',
} as const;

export type ExperimentName = typeof EXPERIMENTS[keyof typeof EXPERIMENTS];
export type Variant = 'A' | 'B';

const STORAGE_KEY_PREFIX = 'ab_test_';

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getTelegramUserId(): string | null {
  try {
    if (WebApp?.initDataUnsafe?.user?.id) {
      return String(WebApp.initDataUnsafe.user.id);
    }
  } catch {
    // Not in Telegram environment
  }
  return null;
}

function getStorageKey(experiment: ExperimentName): string {
  return `${STORAGE_KEY_PREFIX}${experiment}`;
}

export function getStoredVariant(experiment: ExperimentName): Variant | null {
  try {
    const stored = localStorage.getItem(getStorageKey(experiment));
    if (stored === 'A' || stored === 'B') {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return null;
}

export function storeVariant(experiment: ExperimentName, variant: Variant): void {
  try {
    localStorage.setItem(getStorageKey(experiment), variant);
  } catch {
    // localStorage not available
  }
}

export function assignVariant(experiment: ExperimentName): Variant {
  const existingVariant = getStoredVariant(experiment);
  if (existingVariant) {
    return existingVariant;
  }

  const telegramId = getTelegramUserId();
  let variant: Variant;

  if (telegramId) {
    const hash = hashString(`${experiment}_${telegramId}`);
    variant = hash % 2 === 0 ? 'A' : 'B';
  } else {
    const randomId = Math.random().toString(36).substring(2);
    const hash = hashString(`${experiment}_${randomId}`);
    variant = hash % 2 === 0 ? 'A' : 'B';
  }

  storeVariant(experiment, variant);
  return variant;
}

export function getVariant(experiment: ExperimentName): Variant {
  const stored = getStoredVariant(experiment);
  if (stored) {
    return stored;
  }
  return assignVariant(experiment);
}

export type ABEventType = 'exposure' | 'conversion';

export interface ABEvent {
  experiment: ExperimentName;
  variant: Variant;
  eventType: ABEventType;
  userId: string | null;
  timestamp: number;
}

export async function trackABEvent(
  experiment: ExperimentName,
  variant: Variant,
  eventType: ABEventType
): Promise<void> {
  const userId = getTelegramUserId();
  const event: ABEvent = {
    experiment,
    variant,
    eventType,
    userId,
    timestamp: Date.now(),
  };

  try {
    await apiRequest('POST', '/api/analytics/ab-event', event);
  } catch (error) {
    console.warn('Failed to track A/B event:', error);
  }
}

export function trackExposure(experiment: ExperimentName, variant: Variant): void {
  void trackABEvent(experiment, variant, 'exposure').catch(() => {
    // Silently fail - A/B testing is not critical
  });
}

export function trackConversion(experiment: ExperimentName, variant: Variant): void {
  void trackABEvent(experiment, variant, 'conversion').catch(() => {
    // Silently fail - A/B testing is not critical
  });
}

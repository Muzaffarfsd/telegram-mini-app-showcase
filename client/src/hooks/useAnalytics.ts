import { useCallback, useEffect, useRef } from 'react';
import { analytics, EVENT_CATEGORIES, EVENT_ACTIONS } from '@/lib/analytics';

export function usePageView(pageName: string, title?: string) {
  const lastTrackedPage = useRef<string | null>(null);
  
  useEffect(() => {
    if (lastTrackedPage.current !== pageName) {
      analytics.pageView(pageName, title);
      lastTrackedPage.current = pageName;
    }
  }, [pageName, title]);
}

export function useDemoTracking(demoId: string, demoName: string) {
  const startTime = useRef<number | null>(null);
  const interactionCount = useRef(0);

  const startDemo = useCallback(() => {
    startTime.current = Date.now();
    interactionCount.current = 0;
    analytics.demoStart(demoId, demoName);
  }, [demoId, demoName]);

  const completeDemo = useCallback(() => {
    if (startTime.current) {
      const duration = Date.now() - startTime.current;
      analytics.demoComplete(demoId, duration);
      startTime.current = null;
    }
  }, [demoId]);

  const trackInteraction = useCallback((interactionType: string, details?: Record<string, unknown>) => {
    interactionCount.current++;
    analytics.demoInteract(demoId, interactionType, {
      ...details,
      interactionNumber: interactionCount.current,
    });
  }, [demoId]);

  useEffect(() => {
    startDemo();
    return () => {
      if (startTime.current) {
        completeDemo();
      }
    };
  }, [startDemo, completeDemo]);

  return { trackInteraction, interactionCount: interactionCount.current };
}

export function useClickTracking() {
  const trackClick = useCallback((element: string, context?: Record<string, unknown>) => {
    analytics.click(element, context);
  }, []);

  return trackClick;
}

export function useTimingTracking() {
  const startTiming = useCallback((name: string) => {
    return analytics.startTiming(name);
  }, []);

  return startTiming;
}

export function useReferralTracking() {
  const trackReferralClick = useCallback((code: string) => {
    analytics.referralClick(code);
  }, []);

  const trackReferralCopy = useCallback((code: string) => {
    analytics.referralCopy(code);
  }, []);

  return { trackReferralClick, trackReferralCopy };
}

export function useGamificationTracking() {
  const trackXpEarned = useCallback((amount: number, source: string) => {
    analytics.xpEarned(amount, source);
  }, []);

  const trackLevelUp = useCallback((newLevel: number) => {
    analytics.levelUp(newLevel);
  }, []);

  const trackAchievement = useCallback((achievementId: string, achievementName: string) => {
    analytics.achievementUnlocked(achievementId, achievementName);
  }, []);

  return { trackXpEarned, trackLevelUp, trackAchievement };
}

export { analytics, EVENT_CATEGORIES, EVENT_ACTIONS };

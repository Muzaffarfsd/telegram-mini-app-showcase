import { useCallback, useMemo } from 'react';
import { useHapticManager } from './useHapticManager';

export type HapticPattern = 
  | 'tap'
  | 'doubleTap'
  | 'longPress'
  | 'swipe'
  | 'success'
  | 'error'
  | 'warning'
  | 'addToCart'
  | 'removeFromCart'
  | 'checkout'
  | 'purchase'
  | 'favorite'
  | 'unfavorite'
  | 'refresh'
  | 'notification'
  | 'selection'
  | 'toggle'
  | 'drag'
  | 'drop'
  | 'expand'
  | 'collapse'
  | 'pageTransition'
  | 'modalOpen'
  | 'modalClose'
  | 'pullToRefresh';

interface HapticPatternConfig {
  type: 'light' | 'medium' | 'heavy' | 'selection';
  sound?: boolean;
  visual?: boolean;
  delay?: number;
  repeat?: number;
}

const patternConfigs: Record<HapticPattern, HapticPatternConfig | HapticPatternConfig[]> = {
  tap: { type: 'light' },
  doubleTap: [
    { type: 'light' },
    { type: 'light', delay: 100 },
  ],
  longPress: { type: 'heavy', visual: true },
  swipe: { type: 'light' },
  success: { type: 'medium', sound: true, visual: true },
  error: [
    { type: 'heavy' },
    { type: 'heavy', delay: 100 },
    { type: 'heavy', delay: 200 },
  ],
  warning: [
    { type: 'medium' },
    { type: 'medium', delay: 150 },
  ],
  addToCart: { type: 'medium', sound: true, visual: true },
  removeFromCart: { type: 'light' },
  checkout: { type: 'heavy', sound: true, visual: true },
  purchase: [
    { type: 'heavy', sound: true, visual: true },
    { type: 'medium', delay: 200 },
    { type: 'light', delay: 400 },
  ],
  favorite: { type: 'medium', visual: true },
  unfavorite: { type: 'light' },
  refresh: { type: 'selection' },
  notification: { type: 'medium', sound: true },
  selection: { type: 'selection' },
  toggle: { type: 'light' },
  drag: { type: 'selection' },
  drop: { type: 'medium' },
  expand: { type: 'light' },
  collapse: { type: 'light' },
  pageTransition: { type: 'selection' },
  modalOpen: { type: 'light' },
  modalClose: { type: 'selection' },
  pullToRefresh: { type: 'medium' },
};

export const useHapticPatterns = () => {
  const { trigger, settings, updateSettings, isAvailable } = useHapticManager();

  const playPattern = useCallback(async (pattern: HapticPattern) => {
    if (!settings.enabled) return;

    const config = patternConfigs[pattern];

    if (Array.isArray(config)) {
      for (const step of config) {
        if (step.delay) {
          await new Promise(resolve => setTimeout(resolve, step.delay));
        }
        trigger(step.type, { sound: step.sound, visual: step.visual });
      }
    } else {
      trigger(config.type, { sound: config.sound, visual: config.visual });
    }
  }, [settings.enabled, trigger]);

  const patterns = useMemo(() => ({
    tap: () => playPattern('tap'),
    doubleTap: () => playPattern('doubleTap'),
    longPress: () => playPattern('longPress'),
    swipe: () => playPattern('swipe'),
    success: () => playPattern('success'),
    error: () => playPattern('error'),
    warning: () => playPattern('warning'),
    addToCart: () => playPattern('addToCart'),
    removeFromCart: () => playPattern('removeFromCart'),
    checkout: () => playPattern('checkout'),
    purchase: () => playPattern('purchase'),
    favorite: () => playPattern('favorite'),
    unfavorite: () => playPattern('unfavorite'),
    refresh: () => playPattern('refresh'),
    notification: () => playPattern('notification'),
    selection: () => playPattern('selection'),
    toggle: () => playPattern('toggle'),
    drag: () => playPattern('drag'),
    drop: () => playPattern('drop'),
    expand: () => playPattern('expand'),
    collapse: () => playPattern('collapse'),
    pageTransition: () => playPattern('pageTransition'),
    modalOpen: () => playPattern('modalOpen'),
    modalClose: () => playPattern('modalClose'),
    pullToRefresh: () => playPattern('pullToRefresh'),
  }), [playPattern]);

  return {
    playPattern,
    patterns,
    settings,
    updateSettings,
    isAvailable,
  };
};

export const useCartHaptics = () => {
  const { patterns } = useHapticPatterns();
  
  return {
    onAddToCart: patterns.addToCart,
    onRemoveFromCart: patterns.removeFromCart,
    onCheckout: patterns.checkout,
    onPurchaseComplete: patterns.purchase,
  };
};

export const useFavoriteHaptics = () => {
  const { patterns } = useHapticPatterns();
  
  return {
    onFavorite: patterns.favorite,
    onUnfavorite: patterns.unfavorite,
  };
};

export const useNavigationHaptics = () => {
  const { patterns } = useHapticPatterns();
  
  return {
    onPageTransition: patterns.pageTransition,
    onModalOpen: patterns.modalOpen,
    onModalClose: patterns.modalClose,
    onExpand: patterns.expand,
    onCollapse: patterns.collapse,
  };
};

export const useInteractionHaptics = () => {
  const { patterns } = useHapticPatterns();
  
  return {
    onTap: patterns.tap,
    onDoubleTap: patterns.doubleTap,
    onLongPress: patterns.longPress,
    onSwipe: patterns.swipe,
    onSelection: patterns.selection,
    onToggle: patterns.toggle,
    onDrag: patterns.drag,
    onDrop: patterns.drop,
  };
};

export const useFeedbackHaptics = () => {
  const { patterns } = useHapticPatterns();
  
  return {
    onSuccess: patterns.success,
    onError: patterns.error,
    onWarning: patterns.warning,
    onNotification: patterns.notification,
    onRefresh: patterns.refresh,
    onPullToRefresh: patterns.pullToRefresh,
  };
};

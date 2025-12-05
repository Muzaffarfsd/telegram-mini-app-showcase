import { useCallback, useRef, useState, useEffect } from 'react';

export interface GestureState {
  isActive: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  velocity: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
  scale: number;
  rotation: number;
}

export interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPinchIn?: () => void;
  onPinchOut?: () => void;
  onPan?: (state: GestureState) => void;
  onPanEnd?: (state: GestureState) => void;
}

export interface GestureConfig {
  swipeThreshold?: number;
  swipeVelocityThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  pinchThreshold?: number;
  enabled?: boolean;
}

const defaultConfig: Required<GestureConfig> = {
  swipeThreshold: 50,
  swipeVelocityThreshold: 0.3,
  longPressDelay: 500,
  doubleTapDelay: 300,
  pinchThreshold: 0.1,
  enabled: true,
};

const initialState: GestureState = {
  isActive: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  deltaX: 0,
  deltaY: 0,
  velocity: 0,
  direction: null,
  scale: 1,
  rotation: 0,
};

export const useGestures = (
  handlers: GestureHandlers = {},
  config: GestureConfig = {}
) => {
  const mergedConfig = { ...defaultConfig, ...config };
  const [state, setState] = useState<GestureState>(initialState);
  
  const stateRef = useRef(state);
  const startTimeRef = useRef(0);
  const lastTapTimeRef = useRef(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchesRef = useRef<Touch[]>([]);
  const initialPinchDistanceRef = useRef(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getDirection = useCallback((deltaX: number, deltaY: number): GestureState['direction'] => {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    
    if (absDeltaX < 10 && absDeltaY < 10) return null;
    
    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!mergedConfig.enabled) return;

    const touches = Array.from(e.touches);
    touchesRef.current = touches;
    
    if (touches.length === 1) {
      const touch = touches[0];
      const now = Date.now();
      
      setState({
        ...initialState,
        isActive: true,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
      });
      
      startTimeRef.current = now;
      
      longPressTimerRef.current = setTimeout(() => {
        if (stateRef.current.isActive) {
          handlers.onLongPress?.();
        }
      }, mergedConfig.longPressDelay);
    } else if (touches.length === 2) {
      clearLongPressTimer();
      initialPinchDistanceRef.current = getDistance(touches[0], touches[1]);
    }
  }, [mergedConfig, handlers, clearLongPressTimer, getDistance]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!mergedConfig.enabled || !stateRef.current.isActive) return;

    const touches = Array.from(e.touches);
    touchesRef.current = touches;
    
    if (touches.length === 1) {
      const touch = touches[0];
      const deltaX = touch.clientX - stateRef.current.startX;
      const deltaY = touch.clientY - stateRef.current.startY;
      const elapsed = Date.now() - startTimeRef.current;
      const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / elapsed;
      
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        clearLongPressTimer();
      }
      
      const newState: GestureState = {
        ...stateRef.current,
        currentX: touch.clientX,
        currentY: touch.clientY,
        deltaX,
        deltaY,
        velocity,
        direction: getDirection(deltaX, deltaY),
      };
      
      setState(newState);
      handlers.onPan?.(newState);
    } else if (touches.length === 2) {
      const currentDistance = getDistance(touches[0], touches[1]);
      const scale = currentDistance / initialPinchDistanceRef.current;
      
      setState(prev => ({
        ...prev,
        scale,
      }));
    }
  }, [mergedConfig, handlers, clearLongPressTimer, getDirection, getDistance]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!mergedConfig.enabled) return;
    
    clearLongPressTimer();
    
    const currentState = stateRef.current;
    const { deltaX, deltaY, velocity, scale } = currentState;
    const elapsed = Date.now() - startTimeRef.current;
    
    if (e.touches.length === 0) {
      if (touchesRef.current.length === 2) {
        if (scale < 1 - mergedConfig.pinchThreshold) {
          handlers.onPinchIn?.();
        } else if (scale > 1 + mergedConfig.pinchThreshold) {
          handlers.onPinchOut?.();
        }
      } else if (touchesRef.current.length === 1) {
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        const isSwipe = 
          (absDeltaX > mergedConfig.swipeThreshold || absDeltaY > mergedConfig.swipeThreshold) &&
          velocity > mergedConfig.swipeVelocityThreshold;
        
        if (isSwipe) {
          if (absDeltaX > absDeltaY) {
            if (deltaX > 0) {
              handlers.onSwipeRight?.();
            } else {
              handlers.onSwipeLeft?.();
            }
          } else {
            if (deltaY > 0) {
              handlers.onSwipeDown?.();
            } else {
              handlers.onSwipeUp?.();
            }
          }
        } else if (absDeltaX < 10 && absDeltaY < 10 && elapsed < 300) {
          const now = Date.now();
          if (now - lastTapTimeRef.current < mergedConfig.doubleTapDelay) {
            handlers.onDoubleTap?.();
            lastTapTimeRef.current = 0;
          } else {
            lastTapTimeRef.current = now;
            setTimeout(() => {
              if (lastTapTimeRef.current !== 0) {
                handlers.onTap?.();
                lastTapTimeRef.current = 0;
              }
            }, mergedConfig.doubleTapDelay);
          }
        }
        
        handlers.onPanEnd?.(currentState);
      }
      
      setState(initialState);
      touchesRef.current = [];
    }
  }, [mergedConfig, handlers, clearLongPressTimer]);

  const bind = useCallback(() => ({
    onTouchStart: (e: React.TouchEvent) => handleTouchStart(e.nativeEvent),
    onTouchMove: (e: React.TouchEvent) => handleTouchMove(e.nativeEvent),
    onTouchEnd: (e: React.TouchEvent) => handleTouchEnd(e.nativeEvent),
    onTouchCancel: (e: React.TouchEvent) => handleTouchEnd(e.nativeEvent),
  }), [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    state,
    bind,
    isActive: state.isActive,
    direction: state.direction,
    deltaX: state.deltaX,
    deltaY: state.deltaY,
    velocity: state.velocity,
    scale: state.scale,
  };
};

export const useSwipeGesture = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  config?: GestureConfig
) => {
  return useGestures({ onSwipeLeft, onSwipeRight }, config);
};

export const useLongPress = (
  onLongPress: () => void,
  delay: number = 500
) => {
  return useGestures({ onLongPress }, { longPressDelay: delay });
};

export const usePinchZoom = (
  onPinchIn?: () => void,
  onPinchOut?: () => void,
  config?: GestureConfig
) => {
  return useGestures({ onPinchIn, onPinchOut }, config);
};

export const usePanGesture = (
  onPan?: (state: GestureState) => void,
  onPanEnd?: (state: GestureState) => void,
  config?: GestureConfig
) => {
  return useGestures({ onPan, onPanEnd }, config);
};

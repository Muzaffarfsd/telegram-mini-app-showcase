import { useEffect, useRef, useState, memo, useMemo, createContext, useContext, ReactNode } from 'react';

export type ActivityMode = 'visible' | 'hidden';

interface ActivityContextValue {
  mode: ActivityMode;
  isVisible: boolean;
  isHidden: boolean;
  parentMode: ActivityMode | null;
}

const ActivityContext = createContext<ActivityContextValue | null>(null);

export function useActivityContext(): ActivityContextValue | null {
  return useContext(ActivityContext);
}

export function useIsActivityVisible(): boolean {
  const context = useContext(ActivityContext);
  return context?.isVisible ?? true;
}

export function useIsActivityHidden(): boolean {
  const context = useContext(ActivityContext);
  return context?.isHidden ?? false;
}

interface ActivityProps {
  mode: ActivityMode;
  children: ReactNode;
  keepMounted?: boolean;
  fallback?: ReactNode;
  onVisibilityChange?: (isVisible: boolean) => void;
  className?: string;
}

export const Activity = memo(function Activity({
  mode,
  children,
  keepMounted = true,
  fallback = null,
  onVisibilityChange,
  className,
}: ActivityProps) {
  const parentContext = useContext(ActivityContext);
  const previousModeRef = useRef<ActivityMode>(mode);
  const [hasBeenVisible, setHasBeenVisible] = useState(mode === 'visible');
  const childrenRef = useRef<ReactNode>(children);

  const isVisible = mode === 'visible';
  const isHidden = mode === 'hidden';

  const effectiveMode = useMemo(() => {
    if (parentContext?.mode === 'hidden') {
      return 'hidden';
    }
    return mode;
  }, [mode, parentContext?.mode]);

  useEffect(() => {
    if (effectiveMode === 'visible' && !hasBeenVisible) {
      setHasBeenVisible(true);
    }
  }, [effectiveMode, hasBeenVisible]);

  useEffect(() => {
    if (previousModeRef.current !== effectiveMode) {
      onVisibilityChange?.(effectiveMode === 'visible');
      previousModeRef.current = effectiveMode;
    }
  }, [effectiveMode, onVisibilityChange]);

  useEffect(() => {
    if (effectiveMode === 'visible') {
      childrenRef.current = children;
    }
  }, [children, effectiveMode]);

  const contextValue = useMemo<ActivityContextValue>(() => ({
    mode: effectiveMode,
    isVisible: effectiveMode === 'visible',
    isHidden: effectiveMode === 'hidden',
    parentMode: parentContext?.mode ?? null,
  }), [effectiveMode, parentContext?.mode]);

  if (!keepMounted && isHidden) {
    return fallback ? <>{fallback}</> : null;
  }

  if (!hasBeenVisible && isHidden) {
    return fallback ? <>{fallback}</> : null;
  }

  const contentToRender = keepMounted && isHidden ? childrenRef.current : children;

  return (
    <ActivityContext.Provider value={contextValue}>
      <div
        className={className}
        style={{
          display: isHidden ? 'none' : undefined,
          visibility: isHidden ? 'hidden' : undefined,
          pointerEvents: isHidden ? 'none' : undefined,
        }}
        aria-hidden={isHidden}
        data-activity-mode={effectiveMode}
        data-testid={`activity-${effectiveMode}`}
      >
        {contentToRender}
      </div>
    </ActivityContext.Provider>
  );
});

interface ActivityGroupProps {
  activeKey: string;
  children: ReactNode;
  keepMounted?: boolean;
  fallback?: ReactNode;
}

export function ActivityGroup({
  activeKey,
  children,
  keepMounted = true,
  fallback,
}: ActivityGroupProps) {
  const childArray = Array.isArray(children) ? children : [children];

  return (
    <>
      {childArray.map((child, index) => {
        if (!child || typeof child !== 'object' || !('props' in child)) {
          return child;
        }

        const childKey = child.props?.activityKey ?? child.key ?? String(index);
        const isActive = childKey === activeKey;

        return (
          <Activity
            key={childKey}
            mode={isActive ? 'visible' : 'hidden'}
            keepMounted={keepMounted}
            fallback={fallback}
          >
            {child}
          </Activity>
        );
      })}
    </>
  );
}

interface ActivityTabProps {
  activityKey: string;
  children: ReactNode;
}

export function ActivityTab({ children }: ActivityTabProps) {
  return <>{children}</>;
}

export function useActivityTransition(mode: ActivityMode): {
  shouldRender: boolean;
  isTransitioning: boolean;
  transitionState: 'entering' | 'entered' | 'exiting' | 'exited';
} {
  const [transitionState, setTransitionState] = useState<'entering' | 'entered' | 'exiting' | 'exited'>(
    mode === 'visible' ? 'entered' : 'exited'
  );
  const [shouldRender, setShouldRender] = useState(mode === 'visible');
  const previousModeRef = useRef(mode);

  useEffect(() => {
    if (mode !== previousModeRef.current) {
      if (mode === 'visible') {
        setShouldRender(true);
        setTransitionState('entering');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTransitionState('entered');
          });
        });
      } else {
        setTransitionState('exiting');
        const timer = setTimeout(() => {
          setTransitionState('exited');
          setShouldRender(false);
        }, 300);
        return () => clearTimeout(timer);
      }
      previousModeRef.current = mode;
    }
  }, [mode]);

  return {
    shouldRender,
    isTransitioning: transitionState === 'entering' || transitionState === 'exiting',
    transitionState,
  };
}

interface AnimatedActivityProps extends ActivityProps {
  enterDuration?: number;
  exitDuration?: number;
  enterClassName?: string;
  exitClassName?: string;
}

export const AnimatedActivity = memo(function AnimatedActivity({
  mode,
  children,
  keepMounted = true,
  fallback,
  onVisibilityChange,
  className,
  enterDuration = 300,
  exitDuration = 200,
  enterClassName = 'animate-in fade-in',
  exitClassName = 'animate-out fade-out',
}: AnimatedActivityProps) {
  const { shouldRender, transitionState } = useActivityTransition(mode);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (transitionState === 'entering') {
      setAnimationClass(enterClassName);
    } else if (transitionState === 'exiting') {
      setAnimationClass(exitClassName);
    } else {
      setAnimationClass('');
    }
  }, [transitionState, enterClassName, exitClassName]);

  if (!keepMounted && !shouldRender) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <Activity
      mode={shouldRender ? 'visible' : 'hidden'}
      keepMounted={keepMounted}
      fallback={fallback}
      onVisibilityChange={onVisibilityChange}
      className={`${className ?? ''} ${animationClass}`.trim()}
    >
      {children}
    </Activity>
  );
});

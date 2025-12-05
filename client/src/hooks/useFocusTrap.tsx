import { useEffect, useRef, useCallback } from 'react';

interface FocusTrapOptions {
  enabled?: boolean;
  initialFocus?: string;
  returnFocusOnDeactivate?: boolean;
  preventScroll?: boolean;
  allowOutsideClick?: boolean;
}

export const useFocusTrap = (options: FocusTrapOptions = {}) => {
  const {
    enabled = true,
    initialFocus,
    returnFocusOnDeactivate = true,
    preventScroll = false,
    allowOutsideClick = false,
  } = options;

  const containerRef = useRef<HTMLElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const selector = [
      'a[href]:not([disabled]):not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])',
      '[contenteditable="true"]:not([disabled])',
    ].join(', ');

    const elements = Array.from(container.querySelectorAll<HTMLElement>(selector));
    return elements.filter((el) => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
  }, []);

  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return;
    
    const focusableElements = getFocusableElements(containerRef.current);
    firstFocusableRef.current = focusableElements[0] || null;
    lastFocusableRef.current = focusableElements[focusableElements.length - 1] || null;
  }, [getFocusableElements]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled || e.key !== 'Tab') return;

    updateFocusableElements();

    const firstFocusable = firstFocusableRef.current;
    const lastFocusable = lastFocusableRef.current;

    if (!firstFocusable || !lastFocusable) return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus({ preventScroll });
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus({ preventScroll });
      }
    }
  }, [enabled, preventScroll, updateFocusableElements]);

  const handleFocusIn = useCallback((e: FocusEvent) => {
    if (!enabled || !containerRef.current || allowOutsideClick) return;

    const target = e.target as HTMLElement;
    if (!containerRef.current.contains(target)) {
      e.preventDefault();
      firstFocusableRef.current?.focus({ preventScroll });
    }
  }, [enabled, allowOutsideClick, preventScroll]);

  const activate = useCallback((container: HTMLElement) => {
    containerRef.current = container;
    previouslyFocusedRef.current = document.activeElement as HTMLElement;
    
    updateFocusableElements();

    if (initialFocus) {
      const initialElement = container.querySelector<HTMLElement>(initialFocus);
      initialElement?.focus({ preventScroll });
    } else {
      firstFocusableRef.current?.focus({ preventScroll });
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);
  }, [initialFocus, preventScroll, handleKeyDown, handleFocusIn, updateFocusableElements]);

  const deactivate = useCallback(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('focusin', handleFocusIn);

    if (returnFocusOnDeactivate && previouslyFocusedRef.current) {
      previouslyFocusedRef.current.focus({ preventScroll });
    }

    containerRef.current = null;
    previouslyFocusedRef.current = null;
    firstFocusableRef.current = null;
    lastFocusableRef.current = null;
  }, [returnFocusOnDeactivate, preventScroll, handleKeyDown, handleFocusIn]);

  useEffect(() => {
    return () => {
      deactivate();
    };
  }, [deactivate]);

  const ref = useCallback((node: HTMLElement | null) => {
    if (node && enabled) {
      activate(node);
    } else if (!node || !enabled) {
      deactivate();
    }
  }, [enabled, activate, deactivate]);

  return {
    ref,
    activate,
    deactivate,
    updateFocusableElements,
  };
};

export const FocusTrap = ({
  children,
  enabled = true,
  initialFocus,
  returnFocusOnDeactivate = true,
  preventScroll = false,
  allowOutsideClick = false,
  as: Component = 'div',
  ...props
}: FocusTrapOptions & {
  children: React.ReactNode;
  as?: React.ElementType;
  [key: string]: any;
}) => {
  const { ref } = useFocusTrap({
    enabled,
    initialFocus,
    returnFocusOnDeactivate,
    preventScroll,
    allowOutsideClick,
  });

  return (
    <Component ref={ref} {...props}>
      {children}
    </Component>
  );
};

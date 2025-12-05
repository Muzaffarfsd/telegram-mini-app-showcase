import { useState, useCallback, useEffect, useRef } from 'react';

interface AriaLiveOptions {
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  clearDelay?: number;
}

interface AriaLiveProps {
  'aria-live': 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
  role: 'status' | 'alert' | 'log';
  className: string;
  children: string;
}

export const useAriaLive = (options: AriaLiveOptions = {}) => {
  const {
    politeness = 'polite',
    atomic = true,
    relevant = 'additions',
    clearDelay = 5000,
  } = options;

  const [message, setMessage] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const announce = useCallback((
    text: string,
    priority?: 'polite' | 'assertive'
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setMessage('');
    
    requestAnimationFrame(() => {
      setMessage(text);
    });

    if (clearDelay > 0) {
      timeoutRef.current = setTimeout(() => {
        setMessage('');
      }, clearDelay);
    }
  }, [clearDelay]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setMessage('');
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const ariaLiveProps: AriaLiveProps = {
    'aria-live': politeness,
    'aria-atomic': atomic,
    'aria-relevant': relevant,
    role: politeness === 'assertive' ? 'alert' : 'status',
    className: 'sr-only',
    children: message,
  };

  return {
    announce,
    clear,
    message,
    ariaLiveProps,
    AriaLiveRegion: () => (
      <div {...ariaLiveProps} />
    ),
  };
};

export const useLoadingAnnouncer = () => {
  const { announce, clear } = useAriaLive({ politeness: 'polite' });

  const announceLoading = useCallback((itemName?: string) => {
    const message = itemName 
      ? `Loading ${itemName}, please wait.`
      : 'Loading, please wait.';
    announce(message);
  }, [announce]);

  const announceLoaded = useCallback((itemName?: string) => {
    const message = itemName 
      ? `${itemName} has finished loading.`
      : 'Content has finished loading.';
    announce(message);
  }, [announce]);

  const announceError = useCallback((errorMessage?: string) => {
    const message = errorMessage 
      ? `Error: ${errorMessage}`
      : 'An error occurred while loading.';
    announce(message);
  }, [announce]);

  return {
    announceLoading,
    announceLoaded,
    announceError,
    clear,
  };
};

export const useCartAnnouncer = () => {
  const { announce } = useAriaLive({ politeness: 'polite' });

  const announceAddToCart = useCallback((productName: string, quantity: number = 1) => {
    const message = quantity > 1
      ? `${quantity} ${productName} items added to cart.`
      : `${productName} added to cart.`;
    announce(message);
  }, [announce]);

  const announceRemoveFromCart = useCallback((productName: string) => {
    announce(`${productName} removed from cart.`);
  }, [announce]);

  const announceCartUpdate = useCallback((itemCount: number, total: string) => {
    announce(`Cart updated. ${itemCount} items, total ${total}.`);
  }, [announce]);

  const announceCheckoutStep = useCallback((step: string) => {
    announce(`Checkout: ${step}.`);
  }, [announce]);

  return {
    announceAddToCart,
    announceRemoveFromCart,
    announceCartUpdate,
    announceCheckoutStep,
  };
};

export const useFilterAnnouncer = () => {
  const { announce } = useAriaLive({ politeness: 'polite' });

  const announceFilterApplied = useCallback((filterName: string, value: string) => {
    announce(`Filter applied: ${filterName} is ${value}.`);
  }, [announce]);

  const announceFilterRemoved = useCallback((filterName: string) => {
    announce(`Filter removed: ${filterName}.`);
  }, [announce]);

  const announceResults = useCallback((count: number, category?: string) => {
    const message = category
      ? `${count} ${category} products found.`
      : `${count} products found.`;
    announce(message);
  }, [announce]);

  const announceSortChanged = useCallback((sortBy: string) => {
    announce(`Products sorted by ${sortBy}.`);
  }, [announce]);

  return {
    announceFilterApplied,
    announceFilterRemoved,
    announceResults,
    announceSortChanged,
  };
};

import { useState, useCallback, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
  [key: string]: any;
}

interface UsePersistentCartOptions {
  storageKey: string;
  maxItems?: number;
}

export function usePersistentCart({ storageKey, maxItems = 99 }: UsePersistentCartOptions) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(cartItems));
      } catch (e) {
        console.warn('Failed to persist cart:', e);
      }
    }
  }, [cartItems, storageKey, isHydrated]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setCartItems(prev => {
      const itemKey = `${item.id}-${item.size || ''}-${item.color || ''}`;
      const existing = prev.find(i => 
        `${i.id}-${i.size || ''}-${i.color || ''}` === itemKey
      );
      
      if (existing) {
        return prev.map((i): CartItem => 
          `${i.id}-${i.size || ''}-${i.color || ''}` === itemKey
            ? { ...i, quantity: Math.min(i.quantity + (item.quantity || 1), maxItems) }
            : i
        );
      }
      
      if (prev.length >= maxItems) {
        return prev;
      }
      
      return [...prev, { ...item, quantity: item.quantity || 1 } as CartItem];
    });
  }, [maxItems]);

  const updateQuantity = useCallback((id: string, quantity: number, size?: string, color?: string) => {
    const itemKey = `${id}-${size || ''}-${color || ''}`;
    
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => 
        `${item.id}-${item.size || ''}-${item.color || ''}` !== itemKey
      ));
    } else {
      setCartItems(prev => prev.map(item => 
        `${item.id}-${item.size || ''}-${item.color || ''}` === itemKey
          ? { ...item, quantity: Math.min(quantity, maxItems) }
          : item
      ));
    }
  }, [maxItems]);

  const removeFromCart = useCallback((id: string, size?: string, color?: string) => {
    const itemKey = `${id}-${size || ''}-${color || ''}`;
    setCartItems(prev => prev.filter(item => 
      `${item.id}-${item.size || ''}-${item.color || ''}` !== itemKey
    ));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getItemQuantity = useCallback((id: string, size?: string, color?: string) => {
    const itemKey = `${id}-${size || ''}-${color || ''}`;
    const item = cartItems.find(i => 
      `${i.id}-${i.size || ''}-${i.color || ''}` === itemKey
    );
    return item?.quantity || 0;
  }, [cartItems]);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity, 
    0
  );

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    totalAmount,
    totalItems,
    isHydrated
  };
}

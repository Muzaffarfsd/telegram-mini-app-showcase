import { useState, useCallback, useEffect } from 'react';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  address?: string;
  phone?: string;
}

interface UsePersistentOrdersOptions {
  storageKey: string;
  maxOrders?: number;
}

export function usePersistentOrders({ storageKey, maxOrders = 50 }: UsePersistentOrdersOptions) {
  const [orders, setOrders] = useState<Order[]>(() => {
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
        localStorage.setItem(storageKey, JSON.stringify(orders));
      } catch (e) {
        console.warn('Failed to persist orders:', e);
      }
    }
  }, [orders, storageKey, isHydrated]);

  const createOrder = useCallback((
    items: OrderItem[], 
    total: number, 
    details?: { address?: string; phone?: string }
  ): Order => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      items,
      total,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      ...details
    };

    setOrders(prev => {
      const updated = [newOrder, ...prev];
      if (updated.length > maxOrders) {
        return updated.slice(0, maxOrders);
      }
      return updated;
    });

    return newOrder;
  }, [maxOrders]);

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  }, []);

  const getOrder = useCallback((orderId: string) => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  const getRecentOrders = useCallback((count: number = 5) => {
    return orders.slice(0, count);
  }, [orders]);

  const clearOrders = useCallback(() => {
    setOrders([]);
  }, []);

  return {
    orders,
    createOrder,
    updateOrderStatus,
    getOrder,
    getRecentOrders,
    clearOrders,
    ordersCount: orders.length,
    isHydrated
  };
}

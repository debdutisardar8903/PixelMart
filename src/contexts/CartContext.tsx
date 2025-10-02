'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { listenToCart, CartItem } from '@/lib/database';

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartCount: 0,
  loading: true,
});

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    // Listen to real-time cart updates
    const unsubscribe = listenToCart(user.uid, (items) => {
      setCartItems(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const value = {
    cartItems,
    cartCount,
    loading,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

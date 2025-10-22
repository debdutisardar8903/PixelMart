'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  addToCart as addToCartDB, 
  getCartItems, 
  listenToCart, 
  updateCartItemQuantity, 
  removeFromCart as removeFromCartDB, 
  clearCart as clearCartDB,
  CartItem as DBCartItem,
  getAllProducts
} from '@/lib/database';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  originalPrice?: number;
  // Additional fields for database compatibility
  productId?: string;
  title?: string;
  category?: string;
  downloadSize?: string;
  fileFormat?: string;
  description?: string;
}

interface CartContextType {
  cartCount: number;
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth() || { user: null };

  // Load cart from Firebase when user is authenticated
  useEffect(() => {
    if (!user?.uid) {
      // If no user, try to load from localStorage as fallback
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            setCartItems(JSON.parse(savedCart));
          } catch (error) {
            console.error('Error loading cart from localStorage:', error);
          }
        }
      }
      return;
    }

    // Set up real-time listener for authenticated user's cart
    const unsubscribe = listenToCart(user.uid, (dbCartItems: DBCartItem[]) => {
      // Transform database cart items to match our interface
      const transformedItems: CartItem[] = dbCartItems.map(item => ({
        id: item.id,
        name: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        originalPrice: item.originalPrice,
        productId: item.productId,
        title: item.title,
        category: item.category,
        downloadSize: item.downloadSize,
        fileFormat: item.fileFormat,
        description: item.description
      }));
      setCartItems(transformedItems);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Save to localStorage for non-authenticated users
  useEffect(() => {
    if (!user?.uid && typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const addToCart = async (item: CartItem) => {
    if (!user?.uid) {
      // Fallback to localStorage for non-authenticated users
      setCartItems(prev => {
        const existingItem = prev.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
          return prev.map(cartItem =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
              : cartItem
          );
        }
        return [...prev, item];
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Get product details from database to ensure we have all required fields
      const products = await getAllProducts();
      const product = products.find(p => p.id === item.productId || p.id === item.id);
      
      if (!product) {
        console.error('Product not found with ID:', item.productId || item.id);
        console.log('Available product IDs:', products.map(p => p.id));
        console.log('Searching for product with item:', item);
        
        // Fallback: try to add to cart with existing item data (for localStorage users)
        setCartItems(prev => {
          const existingItem = prev.find(cartItem => cartItem.id === item.id);
          if (existingItem) {
            return prev.map(cartItem =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                : cartItem
            );
          }
          return [...prev, item];
        });
        return;
      }

      // Add to Firebase database
      await addToCartDB(user.uid, product, item.quantity);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback to local state update on error
      setCartItems(prev => {
        const existingItem = prev.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
          return prev.map(cartItem =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
              : cartItem
          );
        }
        return [...prev, item];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (id: string) => {
    if (!user?.uid) {
      // Fallback to localStorage for non-authenticated users
      setCartItems(prev => prev.filter(item => item.id !== id));
      return;
    }

    try {
      // Find the cart item to get the correct database ID
      const cartItem = cartItems.find(item => item.id === id || item.productId === id);
      if (cartItem) {
        await removeFromCartDB(user.uid, cartItem.id);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Fallback to local state update on error
      setCartItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    if (!user?.uid) {
      // Fallback to localStorage for non-authenticated users
      setCartItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
      return;
    }

    try {
      // Find the cart item to get the correct database ID
      const cartItem = cartItems.find(item => item.id === id || item.productId === id);
      if (cartItem) {
        await updateCartItemQuantity(user.uid, cartItem.id, quantity);
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      // Fallback to local state update on error
      setCartItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (!user?.uid) {
      // Fallback to localStorage for non-authenticated users
      setCartItems([]);
      return;
    }

    try {
      await clearCartDB(user.uid);
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Fallback to local state update on error
      setCartItems([]);
    }
  };

  return (
    <CartContext.Provider value={{
      cartCount,
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

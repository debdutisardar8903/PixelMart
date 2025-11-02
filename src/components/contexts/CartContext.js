'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ref, get, set, remove, update } from 'firebase/database';
import { database } from '@/lib/firebase';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading: authLoading } = useAuth() || { user: null, loading: true };

  // Load cart from Firebase when user is authenticated
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!user) {
      // User not authenticated, clear cart
      setCartItems([]);
      return;
    }

    const fetchCart = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching cart for user:', user.uid);
        
        const cartRef = ref(database, `carts/${user.uid}`);
        const snapshot = await get(cartRef);
        
        if (snapshot.exists()) {
          const cartData = snapshot.val();
          const cartArray = Object.keys(cartData).map(productId => ({
            id: productId,
            ...cartData[productId]
          }));
          
          console.log('Cart loaded from Firebase:', cartArray);
          setCartItems(cartArray);
        } else {
          console.log('No cart found in Firebase');
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error loading cart from Firebase:', error);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [user, authLoading]);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const addToCart = async (item) => {
    if (!user) {
      console.log('User not authenticated, cannot add to cart');
      return;
    }

    try {
      console.log('Adding item to cart:', item);
      
      // Check if item already exists in cart
      const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // Update quantity of existing item
        const newQuantity = existingItem.quantity + (item.quantity || 1);
        await updateQuantity(item.id, newQuantity);
      } else {
        // Add new item to cart
        const cartItem = {
          productId: item.id,
          userId: user.uid,
          name: item.name || item.title,
          price: item.price,
          image: item.image,
          originalPrice: item.originalPrice || null,
          category: item.category || null,
          quantity: item.quantity || 1,
          addedAt: Date.now(),
          updatedAt: Date.now()
        };

        // Save to Firebase
        const cartItemRef = ref(database, `carts/${user.uid}/${item.id}`);
        await set(cartItemRef, cartItem);

        // Update local state
        setCartItems(prev => [...prev, { id: item.id, ...cartItem }]);
        
        console.log('Item added to cart successfully');
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  const removeFromCart = async (id) => {
    if (!user) {
      console.log('User not authenticated, cannot remove from cart');
      return;
    }

    try {
      console.log('Removing item from cart:', id);
      
      // Remove from Firebase
      const cartItemRef = ref(database, `carts/${user.uid}/${id}`);
      await remove(cartItemRef);

      // Update local state
      setCartItems(prev => prev.filter(item => item.id !== id));
      
      console.log('Item removed from cart successfully');
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (!user) {
      console.log('User not authenticated, cannot update cart');
      return;
    }

    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    try {
      console.log('Updating cart item quantity:', id, quantity);
      
      // Update in Firebase
      const cartItemRef = ref(database, `carts/${user.uid}/${id}`);
      await update(cartItemRef, {
        quantity: quantity,
        updatedAt: Date.now()
      });

      // Update local state
      setCartItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, quantity, updatedAt: Date.now() } : item
        )
      );
      
      console.log('Cart item quantity updated successfully');
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
    }
  };

  const clearCart = async () => {
    if (!user) {
      console.log('User not authenticated, cannot clear cart');
      return;
    }

    try {
      console.log('Clearing entire cart');
      
      // Remove entire cart from Firebase
      const cartRef = ref(database, `carts/${user.uid}`);
      await remove(cartRef);

      // Update local state
      setCartItems([]);
      
      console.log('Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{
      cartCount,
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isLoading
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

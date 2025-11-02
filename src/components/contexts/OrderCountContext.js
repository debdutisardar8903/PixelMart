'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ref, get, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';

const OrderCountContext = createContext(undefined);

export function OrderCountProvider({ children }) {
  const [orderCount, setOrderCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading: authLoading } = useAuth() || { user: null, loading: true };

  // Load order count from Firebase when user is authenticated
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!user) {
      // User not authenticated, clear order count
      setOrderCount(0);
      return;
    }

    const fetchOrderCount = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching order count for user:', user.uid);
        
        const ordersRef = ref(database, 'orders');
        const snapshot = await get(ordersRef);
        
        if (snapshot.exists()) {
          const ordersData = snapshot.val();
          
          // Filter orders by user ID and count them
          const userOrders = Object.keys(ordersData).filter(orderId => {
            const order = ordersData[orderId];
            return order.userId === user.uid;
          });
          
          const count = userOrders.length;
          console.log('Order count loaded from Firebase:', count);
          setOrderCount(count);
        } else {
          console.log('No orders found in Firebase');
          setOrderCount(0);
        }
      } catch (error) {
        console.error('Error loading order count from Firebase:', error);
        setOrderCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderCount();

    // Set up real-time listener for order count updates
    const ordersRef = ref(database, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        
        // Filter orders by user ID and count them
        const userOrders = Object.keys(ordersData).filter(orderId => {
          const order = ordersData[orderId];
          return order.userId === user.uid;
        });
        
        const count = userOrders.length;
        console.log('Order count updated from Firebase listener:', count);
        setOrderCount(count);
      } else {
        setOrderCount(0);
      }
    }, (error) => {
      console.error('Error in order count listener:', error);
      setOrderCount(0);
    });

    // Cleanup listener on unmount or user change
    return () => {
      off(ordersRef, 'value', unsubscribe);
    };
  }, [user, authLoading]);

  return (
    <OrderCountContext.Provider value={{
      orderCount,
      isLoading
    }}>
      {children}
    </OrderCountContext.Provider>
  );
}

export function useOrderCount() {
  const context = useContext(OrderCountContext);
  if (context === undefined) {
    throw new Error('useOrderCount must be used within an OrderCountProvider');
  }
  return context;
}

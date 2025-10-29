'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ref, get, set, remove, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase';

const WishlistContext = createContext(undefined);

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading: authLoading } = useAuth() || { user: null, loading: true };

  // Load wishlist from Firebase when user is authenticated
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!user) {
      // User not authenticated, clear wishlist
      setWishlistItems([]);
      return;
    }

    const fetchWishlist = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching wishlist for user:', user.uid);
        
        const wishlistRef = ref(database, `wishlists/${user.uid}`);
        const snapshot = await get(wishlistRef);
        
        if (snapshot.exists()) {
          const wishlistData = snapshot.val();
          const wishlistArray = Object.keys(wishlistData).map(productId => ({
            id: productId,
            ...wishlistData[productId]
          }));
          
          console.log('Wishlist loaded from Firebase:', wishlistArray);
          setWishlistItems(wishlistArray);
        } else {
          console.log('No wishlist found in Firebase');
          setWishlistItems([]);
        }
      } catch (error) {
        console.error('Error loading wishlist from Firebase:', error);
        setWishlistItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [user, authLoading]);

  const addToWishlist = async (item) => {
    if (!user) {
      console.log('User not authenticated, cannot add to wishlist');
      return;
    }

    try {
      // Check if item already exists in wishlist
      const exists = wishlistItems.find(wishlistItem => wishlistItem.id === item.id);
      if (exists) {
        console.log('Item already in wishlist');
        return;
      }

      console.log('Adding item to wishlist:', item);
      
      // Prepare wishlist item data
      const wishlistItem = {
        productId: item.id,
        userId: user.uid,
        name: item.name,
        price: item.price,
        image: item.image,
        originalPrice: item.originalPrice || null,
        category: item.category || null,
        addedAt: Date.now()
      };

      // Save to Firebase
      const wishlistItemRef = ref(database, `wishlists/${user.uid}/${item.id}`);
      await set(wishlistItemRef, wishlistItem);

      // Update local state
      setWishlistItems(prev => [...prev, { id: item.id, ...wishlistItem }]);
      
      console.log('Item added to wishlist successfully');
    } catch (error) {
      console.error('Error adding item to wishlist:', error);
    }
  };

  const removeFromWishlist = async (itemId) => {
    if (!user) {
      console.log('User not authenticated, cannot remove from wishlist');
      return;
    }

    try {
      console.log('Removing item from wishlist:', itemId);
      
      // Remove from Firebase
      const wishlistItemRef = ref(database, `wishlists/${user.uid}/${itemId}`);
      await remove(wishlistItemRef);

      // Update local state
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      
      console.log('Item removed from wishlist successfully');
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
    }
  };

  const isInWishlist = (itemId) => {
    return wishlistItems.some(item => item.id === itemId || item.productId === itemId);
  };

  const clearWishlist = async () => {
    if (!user) {
      console.log('User not authenticated, cannot clear wishlist');
      return;
    }

    try {
      console.log('Clearing entire wishlist');
      
      // Remove entire wishlist from Firebase
      const wishlistRef = ref(database, `wishlists/${user.uid}`);
      await remove(wishlistRef);

      // Update local state
      setWishlistItems([]);
      
      console.log('Wishlist cleared successfully');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      wishlistCount,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
      isLoading
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  addToWishlist as addToWishlistDB, 
  getWishlistItems, 
  listenToWishlist, 
  removeFromWishlist as removeFromWishlistDB, 
  clearWishlist as clearWishlistDB,
  WishlistItem as DBWishlistItem,
  getAllProducts
} from '@/lib/database';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  originalPrice?: number;
  // Additional fields for database compatibility
  productId?: string;
  userId?: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (itemId: string) => void;
  isInWishlist: (itemId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth() || { user: null };

  // Load wishlist from Firebase when user is authenticated
  useEffect(() => {
    if (!user?.uid) {
      // If no user, try to load from localStorage as fallback
      if (typeof window !== 'undefined') {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          try {
            setWishlistItems(JSON.parse(savedWishlist));
          } catch (error) {
            console.error('Error loading wishlist from localStorage:', error);
          }
        }
      }
      return;
    }

    // Set up real-time listener for authenticated user's wishlist
    const unsubscribe = listenToWishlist(user.uid, (dbWishlistItems: DBWishlistItem[]) => {
      // Transform database wishlist items to match our interface
      const transformedItems: WishlistItem[] = dbWishlistItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        originalPrice: item.originalPrice,
        productId: item.productId,
        userId: item.userId
      }));
      setWishlistItems(transformedItems);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Save to localStorage for non-authenticated users
  useEffect(() => {
    if (!user?.uid && typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, user]);

  const addToWishlist = async (item: WishlistItem) => {
    if (!user?.uid) {
      // Fallback to localStorage for non-authenticated users
      setWishlistItems(prev => {
        const exists = prev.find(wishlistItem => wishlistItem.id === item.id);
        if (exists) {
          return prev; // Item already in wishlist
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
        console.error('Product not found:', item.id);
        return;
      }

      // Add to Firebase database
      await addToWishlistDB(user.uid, product);
      
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      // Fallback to local state update on error
      setWishlistItems(prev => {
        const exists = prev.find(wishlistItem => wishlistItem.id === item.id);
        if (exists) {
          return prev; // Item already in wishlist
        }
        return [...prev, item];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    if (!user?.uid) {
      // Fallback to localStorage for non-authenticated users
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      return;
    }

    try {
      // Find the wishlist item to get the correct database ID
      const wishlistItem = wishlistItems.find(item => item.id === itemId || item.productId === itemId);
      if (wishlistItem) {
        await removeFromWishlistDB(user.uid, wishlistItem.id);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Fallback to local state update on error
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const isInWishlist = (itemId: string) => {
    return wishlistItems.some(item => item.id === itemId || item.productId === itemId);
  };

  const clearWishlist = async () => {
    if (!user?.uid) {
      // Fallback to localStorage for non-authenticated users
      setWishlistItems([]);
      return;
    }

    try {
      await clearWishlistDB(user.uid);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      // Fallback to local state update on error
      setWishlistItems([]);
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
      clearWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

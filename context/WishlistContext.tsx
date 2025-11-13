import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface WishlistContextType {
  wishlistItems: string[]; // Array of product IDs
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isProductInWishlist: (productId: string) => boolean;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);

  // Load wishlist from localStorage when user logs in or page loads
  useEffect(() => {
    if (user) {
      try {
        const storedWishlist = localStorage.getItem(`wishlist_${user.id}`);
        if (storedWishlist) {
          setWishlistItems(JSON.parse(storedWishlist));
        } else {
          setWishlistItems([]);
        }
      } catch (error) {
        console.error("Failed to load wishlist from localStorage", error);
        setWishlistItems([]);
      }
    } else {
      // Clear wishlist when user logs out
      setWishlistItems([]);
    }
  }, [user]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(wishlistItems));
      } catch (error) {
        console.error("Failed to save wishlist to localStorage", error);
      }
    }
  }, [wishlistItems, user]);

  const addToWishlist = (productId: string) => {
    setWishlistItems((prevItems) => {
      if (!prevItems.includes(productId)) {
        return [...prevItems, productId];
      }
      return prevItems;
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems((prevItems) => prevItems.filter((id) => id !== productId));
  };

  const isProductInWishlist = (productId: string) => {
    return wishlistItems.includes(productId);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlistItems, addToWishlist, removeFromWishlist, isProductInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
import React, { createContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { CartItem } from '../types';
import { useAuth } from '../hooks/useAuth';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: string, quantity?: number, customPrice?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage when user logs in or page loads
  useEffect(() => {
    if (user) {
      try {
        const storedCart = localStorage.getItem(`cart_${user.id}`);
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error("Failed to load cart from localStorage", error);
        setCartItems([]);
      }
    } else {
      // Clear cart when user logs out
      setCartItems([]);
    }
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));
      } catch (error) {
        console.error("Failed to save cart to localStorage", error);
      }
    }
  }, [cartItems, user]);

  const addToCart = (productId: string, quantity: number = 1, customPrice?: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === productId);
      if (existingItem) {
        // If item exists, just update quantity. Don't override a custom price if it's already there.
        return prevItems.map(item =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      // If new item, add it with custom price if provided
      return [...prevItems, { productId, quantity, customPrice }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };
  
  const clearCart = () => {
      setCartItems([]);
  };

  const itemCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);


  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from '../types';
import { useAuthStore } from './authStore';

interface CartState {
  cartItems: CartItem[];
  itemCount: number;
  addToCart: (productId: string, quantity?: number, customPrice?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      itemCount: 0,
      addToCart: (productId, quantity = 1, customPrice) => {
        set(state => {
          const existingItem = state.cartItems.find(item => item.productId === productId);
          let newCartItems: CartItem[];
          if (existingItem) {
            newCartItems = state.cartItems.map(item =>
              item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
            );
          } else {
            newCartItems = [...state.cartItems, { productId, quantity, customPrice }];
          }
          const newItemCount = newCartItems.reduce((sum, item) => sum + item.quantity, 0);
          return { cartItems: newCartItems, itemCount: newItemCount };
        });
      },
      removeFromCart: (productId) => {
        set(state => {
          const newCartItems = state.cartItems.filter(item => item.productId !== productId);
          const newItemCount = newCartItems.reduce((sum, item) => sum + item.quantity, 0);
          return { cartItems: newCartItems, itemCount: newItemCount };
        });
      },
      updateQuantity: (productId, newQuantity) => {
        if (newQuantity <= 0) {
          get().removeFromCart(productId);
        } else {
          set(state => {
            const newCartItems = state.cartItems.map(item =>
              item.productId === productId ? { ...item, quantity: newQuantity } : item
            );
            const newItemCount = newCartItems.reduce((sum, item) => sum + item.quantity, 0);
            return { cartItems: newCartItems, itemCount: newItemCount };
          });
        }
      },
      clearCart: () => set({ cartItems: [], itemCount: 0 }),
    }),
    {
      name: 'souqmarib_cart',
      storage: createJSONStorage(() => localStorage),
      getStorage: () => {
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          return {
            ...localStorage,
            getItem: (name) => localStorage.getItem(`${name}-${userId}`),
            setItem: (name, value) => localStorage.setItem(`${name}-${userId}`, value),
            removeItem: (name) => localStorage.removeItem(`${name}-${userId}`),
          };
        }
        return localStorage;
      },
    }
  )
);

useAuthStore.subscribe((state, prevState) => {
  if (prevState.user && !state.user) {
    useCartStore.getState().clearCart();
  }
});

export { useCartStore };

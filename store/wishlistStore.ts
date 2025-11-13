import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useAuthStore } from './authStore';

interface WishlistState {
  wishlistItems: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isProductInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

// We persist the wishlist for each user separately
const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistItems: [],
      addToWishlist: (productId: string) => {
        set(state => ({
          wishlistItems: state.wishlistItems.includes(productId) ? state.wishlistItems : [...state.wishlistItems, productId],
        }));
      },
      removeFromWishlist: (productId: string) => {
        set(state => ({
          wishlistItems: state.wishlistItems.filter(id => id !== productId),
        }));
      },
      isProductInWishlist: (productId: string) => {
        return get().wishlistItems.includes(productId);
      },
      clearWishlist: () => set({ wishlistItems: [] }),
    }),
    {
      name: 'souqmarib_wishlist', // Dynamic name based on user
      storage: createJSONStorage(() => localStorage),
      // A trick to make the storage key dynamic based on the user
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
        return localStorage; // Fallback, though it won't persist without a user
      },
    }
  )
);

// Subscribe to auth changes to clear wishlist on logout
useAuthStore.subscribe((state, prevState) => {
  if (prevState.user && !state.user) {
    useWishlistStore.getState().clearWishlist();
  }
});

export { useWishlistStore };

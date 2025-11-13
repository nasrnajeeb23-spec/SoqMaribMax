import { create } from 'zustand';
import { Store } from '../types';
import * as api from '../api';
import { useAuthStore } from './authStore';

interface StoreState {
  stores: Store[];
  getStoreById: (id: string) => Store | undefined;
  getStoreByOwnerId: (ownerId: string) => Store | undefined;
  createStore: (storeData: Omit<Store, 'id' | 'ownerId'>) => Promise<Store | null>;
  initialize: () => Promise<void>;
}

export const useStoreStore = create<StoreState>((set, get) => ({
  stores: [],
  initialize: async () => {
    const stores = await api.apiFetchStores();
    set({ stores });
  },
  getStoreById: (id) => {
    return get().stores.find(s => s.id === id);
  },
  getStoreByOwnerId: (ownerId) => {
    return get().stores.find(s => s.ownerId === ownerId);
  },
  createStore: async (storeData) => {
    const { user, fetchAllUsers } = useAuthStore.getState();
    if (!user || user.role !== 'SELLER') {
      console.error("Only sellers can create stores.");
      return null;
    }
    const newStoreData: Omit<Store, 'id'> = {
      ...storeData,
      ownerId: user.id,
    };
    const newStore = await api.apiAddStore(newStoreData);
    set(state => ({ stores: [...state.stores, newStore] }));
    
    // Refresh user data to get the new storeId on the user object
    await fetchAllUsers();
    
    return newStore;
  },
}));

// Initialize the store
useStoreStore.getState().initialize();
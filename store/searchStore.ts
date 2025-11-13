import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SavedSearch } from '../types';
import { mockSavedSearchesData } from '../data/searchData';
import { useAuthStore } from './authStore';

interface SearchState {
  allSavedSearches: SavedSearch[];
  savedSearches: SavedSearch[]; // Derived for current user
  saveSearch: (searchTerm: string, categoryId: string | null, condition: 'all' | 'new' | 'used', showToast: (msg: string, type: any) => void) => void;
  deleteSearch: (searchId: string, showToast: (msg: string, type: any) => void) => void;
  _rehydrateUserSearches: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      allSavedSearches: mockSavedSearchesData,
      savedSearches: [],
      saveSearch: (searchTerm, categoryId, condition, showToast) => {
        const { user } = useAuthStore.getState();
        if (!user) { showToast('يجب تسجيل الدخول لحفظ البحث.', 'error'); return; }
        if (!searchTerm && !categoryId) { showToast('لا يمكن حفظ بحث فارغ.', 'info'); return; }
        const newSearch: SavedSearch = {
          id: `ss-${Date.now()}`, userId: user.id, searchTerm, categoryId, condition, timestamp: new Date().toISOString(),
        };
        set(state => ({ allSavedSearches: [newSearch, ...state.allSavedSearches] }));
        get()._rehydrateUserSearches();
        showToast('تم حفظ البحث بنجاح!', 'success');
      },
      deleteSearch: (searchId, showToast) => {
        set(state => ({ allSavedSearches: state.allSavedSearches.filter(s => s.id !== searchId) }));
        get()._rehydrateUserSearches();
        showToast('تم حذف البحث المحفوظ.', 'info');
      },
      _rehydrateUserSearches: () => {
        const { user } = useAuthStore.getState();
        if (!user) {
          set({ savedSearches: [] });
          return;
        }
        const userSearches = get().allSavedSearches
          .filter(s => s.userId === user.id)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        set({ savedSearches: userSearches });
      },
    }),
    {
      name: 'souqmarib_searches',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ allSavedSearches: state.allSavedSearches }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._rehydrateUserSearches();
          useAuthStore.subscribe(state._rehydrateUserSearches);
        }
      }
    }
  )
);

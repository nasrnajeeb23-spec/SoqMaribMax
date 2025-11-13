import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const MAX_COMPARE_ITEMS = 4;

interface ComparisonState {
  comparisonItems: string[];
  toggleComparison: (productId: string, showToast: (msg: string, type: any) => void) => void;
  clearComparison: (showToast: (msg: string, type: any) => void) => void;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      comparisonItems: [],
      toggleComparison: (productId, showToast) => {
        set(state => {
          if (state.comparisonItems.includes(productId)) {
            showToast('تمت الإزالة من قائمة المقارنة.', 'info');
            return { comparisonItems: state.comparisonItems.filter(id => id !== productId) };
          } else {
            if (state.comparisonItems.length >= MAX_COMPARE_ITEMS) {
              showToast(`لا يمكنك مقارنة أكثر من ${MAX_COMPARE_ITEMS} منتجات.`, 'error');
              return state;
            }
            showToast('تمت الإضافة إلى قائمة المقارنة.', 'success');
            return { comparisonItems: [...state.comparisonItems, productId] };
          }
        });
      },
      clearComparison: (showToast) => {
        set({ comparisonItems: [] });
        showToast('تم مسح قائمة المقارنة.', 'info');
      },
    }),
    {
      name: 'souqmarib_comparison',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

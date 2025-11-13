import { create } from 'zustand';
import { Category, ServiceCategory } from '../types';
import * as api from '../api';

interface CategoryState {
  productCategories: Category[];
  serviceCategories: ServiceCategory[];
  addProductCategory: (name: string, description: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  updateProductCategory: (id: string, name: string, description: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  deleteProductCategory: (id: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  addServiceCategory: (name: string, description: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  updateServiceCategory: (id: string, name: string, description: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  deleteServiceCategory: (id: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  productCategories: [],
  serviceCategories: [],
  initialize: async () => {
      const [pCats, sCats] = await Promise.all([
          api.apiFetchProductCategories(),
          api.apiFetchServiceCategories(),
      ]);
      set({ productCategories: pCats, serviceCategories: sCats });
  },
  addProductCategory: async (name, description, showToast) => {
    const newCategory = await api.apiAddProductCategory({ id: `cat-${Date.now()}`, name, description });
    set(state => ({ productCategories: [...state.productCategories, newCategory] }));
    showToast('تم إضافة تصنيف السلع بنجاح.', 'success');
  },
  updateProductCategory: async (id, name, description, showToast) => {
    const updatedCategory = await api.apiUpdateProductCategory(id, name, description);
    set(state => ({ productCategories: state.productCategories.map(cat => (cat.id === id ? updatedCategory : cat)) }));
    showToast('تم تحديث تصنيف السلع بنجاح.', 'success');
  },
  deleteProductCategory: async (id, showToast) => {
    await api.apiDeleteProductCategory(id);
    set(state => ({ productCategories: state.productCategories.filter(cat => cat.id !== id) }));
    showToast('تم حذف تصنيف السلع.', 'info');
  },
  addServiceCategory: async (name, description, showToast) => {
    const newCategory = await api.apiAddServiceCategory({ id: `scat-${Date.now()}`, name, description });
    set(state => ({ serviceCategories: [...state.serviceCategories, newCategory] }));
    showToast('تم إضافة تصنيف الخدمات بنجاح.', 'success');
  },
  updateServiceCategory: async (id, name, description, showToast) => {
    const updatedCategory = await api.apiUpdateServiceCategory(id, name, description);
    set(state => ({ serviceCategories: state.serviceCategories.map(cat => (cat.id === id ? updatedCategory : cat)) }));
    showToast('تم تحديث تصنيف الخدمات بنجاح.', 'success');
  },
  deleteServiceCategory: async (id, showToast) => {
    await api.apiDeleteServiceCategory(id);
    set(state => ({ serviceCategories: state.serviceCategories.filter(cat => cat.id !== id) }));
    showToast('تم حذف تصنيف الخدمات.', 'info');
  },
}));

useCategoryStore.getState().initialize();

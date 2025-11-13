import React, { createContext, useState, ReactNode } from 'react';
import { Category, ServiceCategory } from '../types';
import { categories as mockProductCategories, serviceCategories as mockServiceCategories } from '../data/mockData';
import { useToast } from '../hooks/useToast';

interface CategoryContextType {
  productCategories: Category[];
  serviceCategories: ServiceCategory[];
  addProductCategory: (name: string, description: string) => void;
  updateProductCategory: (id: string, name: string, description: string) => void;
  deleteProductCategory: (id: string) => void;
  addServiceCategory: (name: string, description: string) => void;
  updateServiceCategory: (id: string, name: string, description: string) => void;
  deleteServiceCategory: (id: string) => void;
}

export const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

interface CategoryProviderProps {
  children: ReactNode;
}

export const CategoryProvider: React.FC<CategoryProviderProps> = ({ children }) => {
  const [productCategories, setProductCategories] = useState<Category[]>(mockProductCategories);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(mockServiceCategories);
  const { showToast } = useToast();

  // Product Categories CRUD
  const addProductCategory = (name: string, description: string) => {
    const newCategory: Category = { id: `cat-${Date.now()}`, name, description };
    setProductCategories(prev => [...prev, newCategory]);
    showToast('تم إضافة تصنيف السلع بنجاح.', 'success');
  };

  const updateProductCategory = (id: string, name: string, description: string) => {
    setProductCategories(prev => prev.map(cat => (cat.id === id ? { ...cat, name, description } : cat)));
    showToast('تم تحديث تصنيف السلع بنجاح.', 'success');
  };

  const deleteProductCategory = (id: string) => {
    // TODO: In a real app, check if any product is using this category before deleting.
    setProductCategories(prev => prev.filter(cat => cat.id !== id));
    showToast('تم حذف تصنيف السلع.', 'info');
  };

  // Service Categories CRUD
  const addServiceCategory = (name: string, description: string) => {
    const newCategory: ServiceCategory = { id: `scat-${Date.now()}`, name, description };
    setServiceCategories(prev => [...prev, newCategory]);
    showToast('تم إضافة تصنيف الخدمات بنجاح.', 'success');
  };

  const updateServiceCategory = (id: string, name: string, description: string) => {
    setServiceCategories(prev => prev.map(cat => (cat.id === id ? { ...cat, name, description } : cat)));
    showToast('تم تحديث تصنيف الخدمات بنجاح.', 'success');
  };

  const deleteServiceCategory = (id: string) => {
    // TODO: In a real app, check if any service is using this category before deleting.
    setServiceCategories(prev => prev.filter(cat => cat.id !== id));
    showToast('تم حذف تصنيف الخدمات.', 'info');
  };

  return (
    <CategoryContext.Provider value={{
      productCategories,
      serviceCategories,
      addProductCategory,
      updateProductCategory,
      deleteProductCategory,
      addServiceCategory,
      updateServiceCategory,
      deleteServiceCategory
    }}>
      {children}
    </CategoryContext.Provider>
  );
};


import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '../hooks/useToast';

const MAX_COMPARE_ITEMS = 4;
const COMPARISON_STORAGE_KEY = 'souqmarib_comparison';

interface ComparisonContextType {
  comparisonItems: string[]; // Array of product IDs
  toggleComparison: (productId: string) => void;
  clearComparison: () => void;
}

export const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

interface ComparisonProviderProps {
  children: ReactNode;
}

export const ComparisonProvider: React.FC<ComparisonProviderProps> = ({ children }) => {
  const { showToast } = useToast();
  const [comparisonItems, setComparisonItems] = useState<string[]>(() => {
    try {
      const storedItems = localStorage.getItem(COMPARISON_STORAGE_KEY);
      return storedItems ? JSON.parse(storedItems) : [];
    } catch (error) {
      console.error("Failed to load comparison items from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(comparisonItems));
    } catch (error) {
      console.error("Failed to save comparison items to localStorage", error);
    }
  }, [comparisonItems]);

  const toggleComparison = (productId: string) => {
    setComparisonItems((prevItems) => {
      if (prevItems.includes(productId)) {
        // Remove item
        showToast('تمت الإزالة من قائمة المقارنة.', 'info');
        return prevItems.filter((id) => id !== productId);
      } else {
        // Add item, but check limit first
        if (prevItems.length >= MAX_COMPARE_ITEMS) {
          showToast(`لا يمكنك مقارنة أكثر من ${MAX_COMPARE_ITEMS} منتجات.`, 'error');
          return prevItems;
        }
        showToast('تمت الإضافة إلى قائمة المقارنة.', 'success');
        return [...prevItems, productId];
      }
    });
  };

  const clearComparison = () => {
    setComparisonItems([]);
    showToast('تم مسح قائمة المقارنة.', 'info');
  };

  return (
    <ComparisonContext.Provider
      value={{ comparisonItems, toggleComparison, clearComparison }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

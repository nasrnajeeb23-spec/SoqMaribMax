import React, { createContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { SavedSearch } from '../types';
import { mockSavedSearchesData } from '../data/searchData';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

interface SearchContextType {
  savedSearches: SavedSearch[]; // Searches for the current user
  allSavedSearches: SavedSearch[]; // All searches for notification purposes
  saveSearch: (searchTerm: string, categoryId: string | null, condition: 'all' | 'new' | 'used') => void;
  deleteSearch: (searchId: string) => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

const SEARCHES_STORAGE_KEY = 'souqmarib_searches';

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [allSavedSearches, setAllSavedSearches] = useState<SavedSearch[]>(() => {
    try {
      const storedSearches = localStorage.getItem(SEARCHES_STORAGE_KEY);
      return storedSearches ? JSON.parse(storedSearches) : mockSavedSearchesData;
    } catch (error) {
      console.error("Failed to load searches from localStorage", error);
      return mockSavedSearchesData;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SEARCHES_STORAGE_KEY, JSON.stringify(allSavedSearches));
    } catch (error) {
      console.error("Failed to save searches to localStorage", error);
    }
  }, [allSavedSearches]);

  const userSavedSearches = useMemo(() => {
    if (!user) return [];
    return allSavedSearches
      .filter(s => s.userId === user.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [allSavedSearches, user]);

  const saveSearch = (searchTerm: string, categoryId: string | null, condition: 'all' | 'new' | 'used') => {
    if (!user) {
      showToast('يجب تسجيل الدخول لحفظ البحث.', 'error');
      return;
    }
    if (!searchTerm && !categoryId) {
      showToast('لا يمكن حفظ بحث فارغ. الرجاء إدخال كلمة بحث أو تحديد تصنيف.', 'info');
      return;
    }

    const newSearch: SavedSearch = {
      id: `ss-${Date.now()}`,
      userId: user.id,
      searchTerm,
      categoryId,
      condition,
      timestamp: new Date().toISOString(),
    };
    
    setAllSavedSearches(prev => [newSearch, ...prev]);

    showToast('تم حفظ البحث بنجاح!', 'success');
  };

  const deleteSearch = (searchId: string) => {
    setAllSavedSearches(prev => prev.filter(s => s.id !== searchId));
    showToast('تم حذف البحث المحفوظ.', 'info');
  };

  return (
    <SearchContext.Provider value={{ 
        savedSearches: userSavedSearches, 
        allSavedSearches, 
        saveSearch, 
        deleteSearch 
    }}>
      {children}
    </SearchContext.Provider>
  );
};
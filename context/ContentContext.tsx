import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { StaticPageContent } from '../types';
import { initialContentData } from '../data/contentData';
import { useToast } from '../hooks/useToast';

interface ContentContextType {
  getPageContent: (pageKey: string) => StaticPageContent | undefined;
  updatePageContent: (pageKey: string, newContent: StaticPageContent) => void;
  allPages: { key: string; title: string }[];
}

export const ContentContext = createContext<ContentContextType | undefined>(undefined);

interface ContentProviderProps {
  children: ReactNode;
}

const CONTENT_STORAGE_KEY = 'souqmarib_static_content';

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const { showToast } = useToast();
  const [pageContents, setPageContents] = useState<Record<string, StaticPageContent>>(() => {
    try {
      const storedContent = localStorage.getItem(CONTENT_STORAGE_KEY);
      return storedContent ? JSON.parse(storedContent) : initialContentData;
    } catch (error) {
      console.error("Failed to load static content from localStorage", error);
      return initialContentData;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(pageContents));
    } catch (error) {
      console.error("Failed to save static content to localStorage", error);
    }
  }, [pageContents]);


  const getPageContent = useCallback((pageKey: string) => {
    return pageContents[pageKey];
  }, [pageContents]);

  const updatePageContent = (pageKey: string, newContent: StaticPageContent) => {
    setPageContents(prev => ({
      ...prev,
      [pageKey]: newContent,
    }));
    showToast(`تم تحديث محتوى صفحة "${newContent.title}" بنجاح.`, 'success');
  };
  
  const allPages = Object.keys(pageContents).map(key => ({
      key,
      title: pageContents[key].title,
  }));

  return (
    <ContentContext.Provider value={{ getPageContent, updatePageContent, allPages }}>
      {children}
    </ContentContext.Provider>
  );
};

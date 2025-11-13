import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StaticPageContent } from '../types';
import { initialContentData } from '../data/contentData';

interface ContentState {
  pageContents: Record<string, StaticPageContent>;
  getPageContent: (pageKey: string) => StaticPageContent | undefined;
  updatePageContent: (pageKey: string, newContent: StaticPageContent, showToast: (msg: string, type: any) => void) => void;
  allPages: { key: string; title: string }[];
}

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      pageContents: initialContentData,
      allPages: Object.keys(initialContentData).map(key => ({ key, title: initialContentData[key].title })),
      getPageContent: (pageKey: string) => {
        return get().pageContents[pageKey];
      },
      updatePageContent: (pageKey, newContent, showToast) => {
        set(state => {
            const newPageContents = { ...state.pageContents, [pageKey]: newContent };
            return {
                pageContents: newPageContents,
                allPages: Object.keys(newPageContents).map(key => ({ key, title: newPageContents[key].title })),
            };
        });
        showToast(`تم تحديث محتوى صفحة "${newContent.title}" بنجاح.`, 'success');
      },
    }),
    {
      name: 'souqmarib_static_content',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

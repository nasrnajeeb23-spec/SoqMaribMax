import React, { useState, useEffect } from 'react';
import { StaticPageContent } from '../../../types';

interface ContentManagementTabProps {
    getPageContent: (pageKey: string) => StaticPageContent | undefined;
    updatePageContent: (pageKey: string, newContent: StaticPageContent, showToast: (msg: string, type: any) => void) => void;
    allPages: { key: string; title: string }[];
    showToast: (msg: string, type: any) => void;
}

const ContentManagementTab: React.FC<ContentManagementTabProps> = ({ getPageContent, updatePageContent, allPages, showToast }) => {
    const [selectedPageKey, setSelectedPageKey] = useState<string>(allPages[0]?.key || '');
    const [content, setContent] = useState<StaticPageContent | null>(null);

    useEffect(() => {
        if (selectedPageKey) {
            const pageContent = getPageContent(selectedPageKey);
            if (pageContent) {
                setContent(pageContent);
            }
        }
    }, [selectedPageKey, getPageContent]);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (content && selectedPageKey) {
            updatePageContent(selectedPageKey, content, showToast);
        }
    };

    if (!content) {
        return <div>جار التحميل...</div>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold text-[var(--color-text-muted)] mb-4">إدارة المحتوى الثابت</h2>
            <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-lg border border-[var(--color-border)]">
                <div className="mb-4">
                    <label htmlFor="page-select" className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">اختر الصفحة للتعديل</label>
                    <select
                        id="page-select"
                        value={selectedPageKey}
                        onChange={e => setSelectedPageKey(e.target.value)}
                        className="mt-1 block w-full md:w-1/3 px-3 py-2 border border-[var(--color-border)] bg-[var(--color-surface)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                    >
                        {allPages.map(page => (
                            <option key={page.key} value={page.key}>{page.title}</option>
                        ))}
                    </select>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label htmlFor="page-title" className="block text-sm font-medium text-[var(--color-text-muted)]">عنوان الصفحة</label>
                        <input
                            id="page-title"
                            type="text"
                            value={content.title}
                            onChange={e => setContent({ ...content, title: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)]"
                        />
                    </div>
                    <div>
                        <label htmlFor="page-body" className="block text-sm font-medium text-[var(--color-text-muted)]">محتوى الصفحة (يدعم HTML بسيط)</label>
                        <textarea
                            id="page-body"
                            value={content.body}
                            onChange={e => setContent({ ...content, body: e.target.value })}
                            rows={15}
                            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] font-mono bg-[var(--color-background)]"
                        />
                    </div>
                    <div className="text-right">
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center py-2 px-6 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
                        >
                            حفظ التغييرات
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContentManagementTab;

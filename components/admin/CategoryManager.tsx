import React, { useState } from 'react';
import { Category, ServiceCategory } from '../../types';

interface CategoryManagerProps<T extends Category | ServiceCategory> {
    title: string;
    categories: T[];
    onAdd: (name: string, description: string) => void;
    onUpdate: (id: string, name: string, description: string) => void;
    onDelete: (id: string) => void;
}

const CategoryManager = <T extends Category | ServiceCategory>({ title, categories, onAdd, onUpdate, onDelete }: CategoryManagerProps<T>) => {
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [editingCategory, setEditingCategory] = useState<T | null>(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim()) {
            onAdd(newName, newDesc);
            setNewName('');
            setNewDesc('');
        }
    };

    const handleStartEdit = (category: T) => {
        setEditingCategory(category);
        setEditName(category.name);
        setEditDesc(category.description || '');
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory && editName.trim()) {
            onUpdate(editingCategory.id, editName, editDesc);
            setEditingCategory(null);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-[var(--color-text-muted)] mb-3">{title}</h3>
            <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg border border-[var(--color-border)]">
                <form onSubmit={handleAdd} className="flex items-start gap-2 mb-4">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="اسم التصنيف الجديد"
                        className="flex-grow p-2 border border-[var(--color-border)] rounded-md bg-[var(--color-background)]"
                        required
                    />
                    <input
                        type="text"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="وصف قصير"
                        className="flex-grow p-2 border border-[var(--color-border)] rounded-md bg-[var(--color-background)]"
                    />
                    <button type="submit" className="bg-[var(--color-primary)] text-white font-semibold py-2 px-4 rounded-md hover:bg-[var(--color-primary-hover)]">إضافة</button>
                </form>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-[var(--color-background)] p-2 rounded-md">
                            {editingCategory?.id === cat.id ? (
                                <form onSubmit={handleUpdate} className="flex items-center gap-2">
                                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="flex-grow p-1 border rounded-md bg-[var(--color-surface)]" required />
                                    <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} className="flex-grow p-1 border rounded-md bg-[var(--color-surface)]" />
                                    <button type="submit" className="bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-green-600">حفظ</button>
                                    <button type="button" onClick={() => setEditingCategory(null)} className="bg-gray-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-gray-600">إلغاء</button>
                                </form>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{cat.name}</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">{cat.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleStartEdit(cat)} className="text-blue-600 hover:underline text-xs font-semibold">تعديل</button>
                                        <button onClick={() => onDelete(cat.id)} className="text-red-600 hover:underline text-xs font-semibold">حذف</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;

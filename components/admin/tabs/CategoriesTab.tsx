import React from 'react';
import { Category, ServiceCategory } from '../../../types';
import CategoryManager from '../CategoryManager';

interface CategoriesTabProps {
    productCategories: Category[];
    serviceCategories: ServiceCategory[];
    addProductCategory: (name: string, description: string) => void;
    updateProductCategory: (id: string, name: string, description: string) => void;
    deleteProductCategory: (id: string) => void;
    addServiceCategory: (name: string, description: string) => void;
    updateServiceCategory: (id: string, name: string, description: string) => void;
    deleteServiceCategory: (id: string) => void;
    showToast: (msg: string, type: any) => void;
}

const CategoriesTab: React.FC<CategoriesTabProps> = (props) => {
    return (
        <div>
            <h2 className="text-xl font-semibold text-[var(--color-text-muted)] mb-4">إدارة التصنيفات</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CategoryManager
                    title="تصنيفات السلع"
                    categories={props.productCategories}
                    onAdd={(name, desc) => props.addProductCategory(name, desc)}
                    onUpdate={(id, name, desc) => props.updateProductCategory(id, name, desc)}
                    onDelete={(id) => props.deleteProductCategory(id)}
                />
                <CategoryManager
                    title="تصنيفات الخدمات"
                    categories={props.serviceCategories}
                    onAdd={(name, desc) => props.addServiceCategory(name, desc)}
                    onUpdate={(id, name, desc) => props.updateServiceCategory(id, name, desc)}
                    onDelete={(id) => props.deleteServiceCategory(id)}
                />
            </div>
        </div>
    );
};

export default CategoriesTab;

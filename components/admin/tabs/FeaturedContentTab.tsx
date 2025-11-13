import React, { useState } from 'react';
import { Product, Service } from '../../../types';

interface FeaturedContentTabProps {
    products: Product[];
    updateProduct: (productId: string, productData: Partial<Product>) => void;
    services: Service[];
    updateService: (serviceId: string, serviceData: Partial<Service>) => void;
    showToast: (msg: string, type: any) => void;
}

const FeaturedContentTab: React.FC<FeaturedContentTabProps> = ({
    products,
    updateProduct,
    services,
    updateService,
    showToast
}) => {
    const [productToAdd, setProductToAdd] = useState('');
    const [serviceToAdd, setServiceToAdd] = useState('');

    const now = new Date();
    const featuredProducts = products.filter(p => p.isFeatured && p.featuredEndDate && new Date(p.featuredEndDate) > now);
    const featuredServices = services.filter(s => s.isFeatured && s.featuredEndDate && new Date(s.featuredEndDate) > now);

    const nonFeaturedProducts = products.filter(p => !featuredProducts.some(fp => fp.id === p.id));
    const nonFeaturedServices = services.filter(s => !featuredServices.some(fs => fs.id === s.id));

    const addDays = (days: number) => {
        const result = new Date();
        result.setDate(result.getDate() + days);
        return result.toISOString();
    };

    const handleFeatureProduct = () => {
        if (!productToAdd) return;
        updateProduct(productToAdd, { isFeatured: true, featuredEndDate: addDays(7) });
        showToast('تم تمييز المنتج بنجاح.', 'success');
        setProductToAdd('');
    };

    const handleUnfeatureProduct = (productId: string) => {
        updateProduct(productId, { isFeatured: false, featuredEndDate: undefined });
        showToast('تم إلغاء تمييز المنتج.', 'info');
    };

    const handleFeatureService = () => {
        if (!serviceToAdd) return;
        updateService(serviceToAdd, { isFeatured: true, featuredEndDate: addDays(7) });
        showToast('تم تمييز الخدمة بنجاح.', 'success');
        setServiceToAdd('');
    };

    const handleUnfeatureService = (serviceId: string) => {
        updateService(serviceId, { isFeatured: false, featuredEndDate: undefined });
        showToast('تم إلغاء تمييز الخدمة.', 'info');
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-[var(--color-text-muted)] mb-4">إدارة المحتوى المميز</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Products Section */}
                <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-muted)] mb-3">السلع المميزة</h3>
                    <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg border border-[var(--color-border)] space-y-3">
                        <div className="flex gap-2">
                            <select value={productToAdd} onChange={e => setProductToAdd(e.target.value)} className="flex-grow p-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)]">
                                <option value="">اختر سلعة لتمييزها...</option>
                                {nonFeaturedProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <button onClick={handleFeatureProduct} disabled={!productToAdd} className="bg-[var(--color-primary)] text-white font-semibold py-2 px-4 rounded-md hover:bg-[var(--color-primary-hover)] disabled:bg-gray-400">تمييز</button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {featuredProducts.length > 0 ? featuredProducts.map(p => (
                                <div key={p.id} className="bg-[var(--color-surface)] p-2 rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{p.name}</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">ينتهي في: {new Date(p.featuredEndDate!).toLocaleDateString('ar-EG')}</p>
                                    </div>
                                    <button onClick={() => handleUnfeatureProduct(p.id)} className="text-red-600 hover:underline text-xs font-semibold">إلغاء التمييز</button>
                                </div>
                            )) : <p className="text-center text-[var(--color-text-muted)] py-4">لا توجد سلع مميزة حالياً.</p>}
                        </div>
                    </div>
                </div>
                {/* Services Section */}
                <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-muted)] mb-3">الخدمات المميزة</h3>
                    <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg border border-[var(--color-border)] space-y-3">
                        <div className="flex gap-2">
                            <select value={serviceToAdd} onChange={e => setServiceToAdd(e.target.value)} className="flex-grow p-2 border border-[var(--color-border)] rounded-md bg-[var(--color-surface)]">
                                <option value="">اختر خدمة لتمييزها...</option>
                                {nonFeaturedServices.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>
                            <button onClick={handleFeatureService} disabled={!serviceToAdd} className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-400">تمييز</button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {featuredServices.length > 0 ? featuredServices.map(s => (
                                <div key={s.id} className="bg-[var(--color-surface)] p-2 rounded-md flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{s.title}</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">ينتهي في: {new Date(s.featuredEndDate!).toLocaleDateString('ar-EG')}</p>
                                    </div>
                                    <button onClick={() => handleUnfeatureService(s.id)} className="text-red-600 hover:underline text-xs font-semibold">إلغاء التمييز</button>
                                </div>
                            )) : <p className="text-center text-[var(--color-text-muted)] py-4">لا توجد خدمات مميزة حالياً.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturedContentTab;

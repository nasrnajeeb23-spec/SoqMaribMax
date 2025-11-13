import React from 'react';
import { Product } from '../../../types';
import { useAuth } from '../../../hooks/useAuth';

interface ProductsTabProps {
    products: Product[];
    formatPrice: (price: number) => string;
    handleDeleteProduct: (productId: string) => void;
}

const ProductsTab: React.FC<ProductsTabProps> = ({ products, formatPrice, handleDeleteProduct }) => {
    const { users } = useAuth();

    return (
        <div>
            <h2 className="text-xl font-semibold text-[var(--color-text-muted)] mb-4">قائمة السلع</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-[var(--color-surface)] border border-[var(--color-border)] responsive-table">
                    <thead className="bg-gray-100 dark:bg-slate-900/50">
                        <tr>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">المنتج</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">البائع</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">السعر</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="text-[var(--color-text-base)]">
                        {products.map(product => {
                            const seller = users.find(u => u.id === product.sellerId);
                            return (
                            <tr key={product.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]">
                                <td data-label="المنتج" className="py-3 px-4 flex items-center">
                                    <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md ml-4" />
                                    <span>{product.name}</span>
                                </td>
                                <td data-label="البائع" className="py-3 px-4">{seller?.name || 'بائع محذوف'}</td>
                                <td data-label="السعر" className="py-3 px-4">{formatPrice(product.price)}</td>
                                <td data-label="إجراءات" className="py-3 px-4">
                                    <button onClick={() => handleDeleteProduct(product.id)} className="bg-red-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-red-600 transition">
                                        حذف
                                    </button>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductsTab;
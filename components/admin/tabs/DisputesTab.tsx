import React from 'react';
import { Delivery, Product, User } from '../../../types';

interface DisputesTabProps {
    disputedDeliveries: Delivery[];
    getProductById: (productId: string) => Product | undefined;
    getUserById: (userId: string) => User | undefined;
    handleResolveDispute: (delivery: Delivery, resolution: 'BUYER' | 'SELLER') => void;
}

const DisputesTab: React.FC<DisputesTabProps> = ({
    disputedDeliveries,
    getProductById,
    getUserById,
    handleResolveDispute
}) => {
    return (
        <div>
            <h2 className="text-xl font-semibold text-orange-600 mb-4">النزاعات المفتوحة</h2>
            {disputedDeliveries.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-[var(--color-surface)] border border-[var(--color-border)] responsive-table">
                        <thead className="bg-gray-100 dark:bg-slate-900/50">
                            <tr>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-gray-600 uppercase">الطلب</th>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-gray-600 uppercase">المشتري</th>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-gray-600 uppercase">البائع</th>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-gray-600 uppercase">إجراءات الحل</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {disputedDeliveries.map(delivery => (
                                <tr key={delivery.id} className="border-b border-[var(--color-border)] hover:bg-orange-500/10">
                                    <td data-label="الطلب" className="py-3 px-4">
                                        {getProductById(delivery.productId)?.name || 'N/A'}<br />
                                        <span className="text-xs text-gray-500 font-mono">{delivery.id}</span>
                                    </td>
                                    <td data-label="المشتري" className="py-3 px-4">{getUserById(delivery.buyerId)?.name || 'N/A'}</td>
                                    <td data-label="البائع" className="py-3 px-4">{getUserById(delivery.sellerId)?.name || 'N/A'}</td>
                                    <td data-label="إجراءات" className="py-3 px-4">
                                        <div className="flex items-center space-x-2 space-x-reverse">
                                            <button onClick={() => handleResolveDispute(delivery, 'BUYER')} className="bg-sky-600 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-sky-700">لصالح المشتري (استرداد)</button>
                                            <button onClick={() => handleResolveDispute(delivery, 'SELLER')} className="bg-green-600 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-green-700">لصالح البائع (تحويل)</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center py-8 text-gray-500">لا توجد نزاعات مفتوحة حالياً.</p>
            )}
        </div>
    );
};

export default DisputesTab;

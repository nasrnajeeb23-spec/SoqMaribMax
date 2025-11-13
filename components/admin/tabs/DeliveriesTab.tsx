import React from 'react';
import { Delivery, DeliveryStatus, Product, User } from '../../../types';

interface DeliveriesTabProps {
    deliveries: Delivery[];
    getProductById: (productId: string) => Product | undefined;
    getUserById: (userId: string) => User | undefined;
    updateDeliveryStatus: (deliveryId: string, status: DeliveryStatus) => void;
    statusColors: { [key in DeliveryStatus]: string };
    statusTranslations: { [key in DeliveryStatus]: string };
}

const DeliveriesTab: React.FC<DeliveriesTabProps> = ({
    deliveries,
    getProductById,
    getUserById,
    updateDeliveryStatus,
    statusColors,
    statusTranslations
}) => {
    return (
        <div>
            <h2 className="text-xl font-semibold text-[var(--color-text-muted)] mb-4">قائمة طلبات التوصيل</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-[var(--color-surface)] border border-[var(--color-border)] responsive-table">
                    <thead className="bg-gray-100 dark:bg-slate-900/50">
                        <tr>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">المنتج</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">المشتري</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">البائع</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الحالة</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">تغيير الحالة</th>
                        </tr>
                    </thead>
                    <tbody className="text-[var(--color-text-base)]">
                        {deliveries.map(delivery => (
                            <tr key={delivery.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]">
                                <td data-label="المنتج" className="py-3 px-4">{getProductById(delivery.productId)?.name || 'N/A'}</td>
                                <td data-label="المشتري" className="py-3 px-4">{getUserById(delivery.buyerId)?.name || 'N/A'}</td>
                                <td data-label="البائع" className="py-3 px-4">{getUserById(delivery.sellerId)?.name || 'N/A'}</td>
                                <td data-label="الحالة" className="py-3 px-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[delivery.status]}`}>{statusTranslations[delivery.status]}</span></td>
                                <td data-label="تغيير الحالة" className="py-3 px-4">
                                    <select value={delivery.status} onChange={(e) => updateDeliveryStatus(delivery.id, e.target.value as DeliveryStatus)} className="block w-full p-2 border border-gray-300 bg-white dark:bg-slate-800 rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm">
                                        {Object.keys(statusTranslations).map(status => (
                                            <option key={status} value={status}>{statusTranslations[status as DeliveryStatus]}</option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DeliveriesTab;

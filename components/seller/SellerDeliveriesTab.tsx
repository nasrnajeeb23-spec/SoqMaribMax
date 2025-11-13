import React from 'react';
import { Delivery, DeliveryStatus } from '../../types';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../hooks/useAuth';
import { useDeliveries } from '../../hooks/useDeliveries';
import QrCodeDisplay from '../delivery/QrCodeDisplay';

interface SellerDeliveriesTabProps {
    deliveries: Delivery[];
}

const SellerDeliveriesTab: React.FC<SellerDeliveriesTabProps> = ({ deliveries }) => {
    const { products } = useProducts();
    const { users } = useAuth();
    const { markAsReadyForPickup } = useDeliveries();

    const getProductById = (id: string) => products.find(p => p.id === id);
    const getUserById = (id: string) => users.find(u => u.id === id);

    const deliveryStatusTranslations: { [key in DeliveryStatus]: string } = {
        PENDING: 'بانتظار التجهيز',
        READY_FOR_PICKUP: 'جاهز للاستلام',
        IN_TRANSIT: 'قيد التوصيل',
        DELIVERED: 'بانتظار تأكيد المشتري',
        COMPLETED: 'مكتمل',
        CANCELED: 'ملغي',
        IN_DISPUTE: 'قيد النزاع'
    };
    
    const deliveryStatusColors: { [key in DeliveryStatus]: string } = {
        PENDING: 'bg-yellow-200 text-yellow-800',
        READY_FOR_PICKUP: 'bg-sky-200 text-sky-800',
        IN_TRANSIT: 'bg-blue-200 text-blue-800',
        DELIVERED: 'bg-cyan-200 text-cyan-800',
        COMPLETED: 'bg-green-200 text-green-800',
        CANCELED: 'bg-red-200 text-red-800',
        IN_DISPUTE: 'bg-orange-200 text-orange-800'
    };

    if (deliveries.length === 0) {
        return (
            <div className="text-center py-10 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                <p className="text-[var(--color-text-muted)] text-lg">لا توجد لديك أي طلبات واردة حالياً.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-transparent divide-y divide-[var(--color-border)] responsive-table">
                <thead className="bg-gray-50 dark:bg-slate-900/50">
                    <tr>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">المنتج</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">المشتري</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">الحالة</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">الإجراء المطلوب</th>
                    </tr>
                </thead>
                <tbody className="text-[var(--color-text-base)] divide-y divide-[var(--color-border)] md:divide-y-0">
                    {deliveries.map(delivery => {
                        const product = getProductById(delivery.productId);
                        const buyer = getUserById(delivery.buyerId);

                        return (
                            <tr key={delivery.id} className="hover:bg-[var(--color-background)]">
                                <td data-label="المنتج" className="py-4 px-4">{product?.name || 'منتج محذوف'}</td>
                                <td data-label="المشتري" className="py-4 px-4">{buyer?.name || 'مستخدم محذوف'}</td>
                                <td data-label="الحالة" className="py-4 px-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${deliveryStatusColors[delivery.status]}`}>
                                        {deliveryStatusTranslations[delivery.status]}
                                    </span>
                                </td>
                                <td data-label="الإجراء المطلوب" className="py-4 px-4">
                                    {delivery.status === 'PENDING' && (
                                        <button 
                                            onClick={() => markAsReadyForPickup(delivery.id)}
                                            className="bg-green-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-green-600 transition"
                                        >
                                            تجهيز الطلب للشحن
                                        </button>
                                    )}
                                    {delivery.status === 'READY_FOR_PICKUP' && (
                                        <div className="flex flex-col items-center">
                                            <QrCodeDisplay code={delivery.pickupCode} />
                                            <p className="text-xs text-[var(--color-text-muted)] mt-1">أظهر هذا الرمز للمندوب</p>
                                        </div>
                                    )}
                                    {['IN_TRANSIT', 'DELIVERED', 'COMPLETED'].includes(delivery.status) && (
                                        <p className="text-sm text-gray-500">لا يوجد إجراء مطلوب حالياً.</p>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default SellerDeliveriesTab;
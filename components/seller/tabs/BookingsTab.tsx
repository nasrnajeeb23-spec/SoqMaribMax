import React from 'react';
import { ServiceBooking, ServiceBookingStatus } from '../../../types';
import { useServices } from '../../../hooks/useServices';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';

interface BookingsTabProps {
    bookings: ServiceBooking[];
}

const BookingsTab: React.FC<BookingsTabProps> = React.memo(({ bookings }) => {
    const { services, acceptBooking, rejectBooking, markAsCompletedByProvider } = useServices();
    const { users } = useAuth();
    const { showToast } = useToast();

    const getServiceById = (id: string) => services.find(s => s.id === id);
    const getUserById = (id: string) => users.find(u => u.id === id);

    const statusTranslations: { [key in ServiceBookingStatus]: string } = {
        PENDING: 'بانتظار الموافقة',
        CONFIRMED: 'مؤكد',
        AWAITING_PAYMENT: 'بانتظار الدفع',
        IN_PROGRESS: 'قيد التنفيذ',
        COMPLETED_BY_PROVIDER: 'بانتظار تأكيد العميل',
        COMPLETED: 'مكتمل',
        REJECTED: 'مرفوض',
        CANCELED: 'ملغي',
    };
    
    const statusColors: { [key in ServiceBookingStatus]: string } = {
        PENDING: 'bg-yellow-200 text-yellow-800',
        CONFIRMED: 'bg-sky-200 text-sky-800',
        AWAITING_PAYMENT: 'bg-cyan-200 text-cyan-800',
        IN_PROGRESS: 'bg-blue-200 text-blue-800',
        COMPLETED_BY_PROVIDER: 'bg-purple-200 text-purple-800',
        COMPLETED: 'bg-green-200 text-green-800',
        REJECTED: 'bg-red-200 text-red-800',
        CANCELED: 'bg-gray-200 text-gray-800',
    };

    if (bookings.length === 0) {
        return <div className="text-center py-10 border-2 border-dashed border-[var(--color-border)] rounded-lg"><p className="text-[var(--color-text-muted)] text-lg">لا توجد لديك حجوزات واردة حالياً.</p></div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-transparent divide-y divide-[var(--color-border)] responsive-table">
                <thead className="bg-gray-50 dark:bg-slate-900/50">
                    <tr>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الخدمة</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">العميل</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الحالة</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الإجراءات</th>
                    </tr>
                </thead>
                <tbody className="text-[var(--color-text-base)] divide-y divide-[var(--color-border)] md:divide-y-0">
                    {bookings.map(booking => {
                        const service = getServiceById(booking.serviceId);
                        const client = getUserById(booking.clientId);
                        return (
                        <tr key={booking.id} className="hover:bg-[var(--color-background)]">
                            <td data-label="الخدمة" className="py-4 px-4">{service?.title || 'خدمة محذوفة'}</td>
                            <td data-label="العميل" className="py-4 px-4">{client?.name || 'عميل محذوف'}</td>
                            <td data-label="الحالة" className="py-4 px-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[booking.status]}`}>
                                    {statusTranslations[booking.status]}
                                </span>
                            </td>
                            <td data-label="الإجراءات" className="py-4 px-4">
                                {booking.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => acceptBooking(booking.id, showToast)} className="bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-green-600">قبول</button>
                                        <button onClick={() => rejectBooking(booking.id, showToast)} className="bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-red-600">رفض</button>
                                    </div>
                                )}
                                {booking.status === 'IN_PROGRESS' && (
                                    <button onClick={() => markAsCompletedByProvider(booking.id, showToast)} className="bg-blue-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-blue-600">إنهاء الخدمة</button>
                                )}
                            </td>
                        </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
});

export default BookingsTab;
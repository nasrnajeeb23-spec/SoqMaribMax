import React from 'react';
import { ServiceBooking, ServiceBookingStatus } from '../../../types';
import { useServices } from '../../../hooks/useServices';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';

interface ServiceBookingsTabProps {
    bookings: ServiceBooking[];
    onOpenRatingForm: (bookingId: string, serviceId: string) => void;
}

const ServiceBookingsTab: React.FC<ServiceBookingsTabProps> = React.memo(({ bookings, onOpenRatingForm }) => {
    const { services, hasUserRatedService, payForBooking, confirmCompletionByBuyer } = useServices();
    const { user, users } = useAuth();
    const { showToast } = useToast();

    const getServiceById = (id: string) => services.find(s => s.id === id);
    const getUserById = (id: string) => users.find(u => u.id === id);

    const bookingStatusTranslations: { [key in ServiceBookingStatus]: string } = {
        PENDING: 'بانتظار موافقة المقدم',
        CONFIRMED: 'مؤكد',
        AWAITING_PAYMENT: 'بانتظار الدفع',
        IN_PROGRESS: 'قيد التنفيذ',
        COMPLETED_BY_PROVIDER: 'بانتظار تأكيدك',
        COMPLETED: 'مكتمل',
        REJECTED: 'مرفوض',
        CANCELED: 'ملغي',
    };

    const bookingStatusColors: { [key in ServiceBookingStatus]: string } = {
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
        return <div className="text-center py-10 border-2 border-dashed border-[var(--color-border)] rounded-lg"><p className="text-[var(--color-text-muted)] text-lg">لم تقم بحجز أي خدمات بعد.</p></div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-[var(--color-surface)] border border-[var(--color-border)] responsive-table">
                <thead className="bg-gray-100 dark:bg-slate-900/50">
                    <tr>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الخدمة</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">حالة الحجز</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الإجراءات</th>
                    </tr>
                </thead>
                <tbody className="text-[var(--color-text-base)]">
                    {bookings.map(booking => {
                        const service = getServiceById(booking.serviceId);
                        const provider = service ? getUserById(service.provider.id) : null;
                        const hasRated = user ? hasUserRatedService(booking.id, user.id) : false;
                        return (
                            <tr key={booking.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]">
                                <td data-label="الخدمة" className="py-3 px-4">
                                    {service ? (
                                        <div className="flex items-center">
                                            <img src={service.imageUrl} alt={service.title} className="w-16 h-16 object-cover rounded-md ml-4" />
                                            <div>
                                                <p className="font-semibold">{service.title}</p>
                                                <p className="text-sm text-gray-500">المقدم: {provider?.name || 'غير معروف'}</p>
                                                <p className="text-sm text-gray-500">{new Date(booking.bookingDate).toLocaleDateString('ar-EG')}</p>
                                            </div>
                                        </div>
                                    ) : 'خدمة محذوفة'}
                                </td>
                                <td data-label="الحالة" className="py-3 px-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bookingStatusColors[booking.status]}`}>
                                        {bookingStatusTranslations[booking.status]}
                                    </span>
                                </td>
                                <td data-label="الإجراءات" className="py-3 px-4">
                                    {booking.status === 'AWAITING_PAYMENT' && (
                                        <button onClick={() => payForBooking(booking.id, showToast)} className="bg-green-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-green-600">ادفع الآن</button>
                                    )}
                                    {booking.status === 'COMPLETED_BY_PROVIDER' && (
                                        <button onClick={() => confirmCompletionByBuyer(booking.id, showToast)} className="bg-sky-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-sky-600">تأكيد الاكتمال</button>
                                    )}
                                    {booking.status === 'COMPLETED' && !hasRated && (
                                        <button onClick={() => onOpenRatingForm(booking.id, booking.serviceId)} className="bg-teal-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-teal-600">تقييم الخدمة</button>
                                    )}
                                    {booking.status === 'COMPLETED' && hasRated && (
                                        <span className="text-xs text-green-600">تم تقييم الخدمة</span>
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

export default ServiceBookingsTab;
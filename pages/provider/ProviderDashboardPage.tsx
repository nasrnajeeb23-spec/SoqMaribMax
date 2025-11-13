import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useServices } from '../../hooks/useServices';
import { Service } from '../../types';
import FinancialsTab from '../../components/seller/tabs/FinancialsTab'; // Reusing
import BookingsTab from '../../components/seller/tabs/BookingsTab'; // Reusing
import { useToast } from '../../hooks/useToast';

type Tab = 'analytics' | 'services' | 'bookings' | 'financials';

const ServicesTab: React.FC<{ services: Service[], onDelete: (id: string) => void }> = ({ services, onDelete }) => {
    if (services.length === 0) {
        return (
            <div className="text-center py-10 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                <p className="text-[var(--color-text-muted)] text-lg">لم تقم بإضافة أي خدمات بعد.</p>
                <Link to="/provider-dashboard/add-service" className="mt-4 inline-block bg-[var(--color-primary)] text-white font-bold py-2 px-5 rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
                    إضافة خدمتك الأولى
                </Link>
            </div>
        );
    }
    return (
        <div className="overflow-x-auto">
             <table className="min-w-full bg-transparent divide-y divide-[var(--color-border)] responsive-table">
                <thead className="bg-gray-50 dark:bg-slate-900/50">
                    <tr>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">الخدمة</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">السعر</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">الإجراءات</th>
                    </tr>
                </thead>
                <tbody className="text-[var(--color-text-base)] divide-y divide-[var(--color-border)] md:divide-y-0">
                    {services.map(service => (
                        <tr key={service.id} className="hover:bg-[var(--color-background)]">
                            <td data-label="الخدمة" className="py-4 px-4 font-semibold">{service.title}</td>
                            <td data-label="السعر" className="py-4 px-4">{service.price} ريال</td>
                            <td data-label="إجراءات" className="py-4 px-4">
                                <div className="flex gap-2">
                                     <Link to={`/provider-dashboard/edit-service/${service.id}`} className="bg-blue-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-blue-600">تعديل</Link>
                                     <button onClick={() => onDelete(service.id)} className="bg-red-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-red-600">حذف</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const ProviderDashboardPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('analytics');
    const { user } = useAuth();
    const { services, bookings, deleteService } = useServices();
    const { showToast } = useToast();

    const providerData = useMemo(() => {
        if (!user) return { providerServices: [], providerBookings: [] };
        return {
            providerServices: services.filter(s => s.provider.id === user.id),
            providerBookings: bookings.filter(b => b.providerId === user.id),
        };
    }, [user, services, bookings]);

    const { providerServices, providerBookings } = providerData;

    const handleDeleteService = (serviceId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
            deleteService(serviceId, showToast);
        }
    };
    
    const renderTabContent = () => {
        switch(activeTab) {
            case 'analytics': return <p>سيتم عرض تحليلات الخدمات هنا قريباً.</p>;
            case 'services': return <ServicesTab services={providerServices} onDelete={handleDeleteService} />;
            case 'bookings': return <BookingsTab bookings={providerBookings} />;
            case 'financials': return <FinancialsTab />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-[var(--color-text-base)]">لوحة تحكم مقدم الخدمة</h1>
                <Link to="/provider-dashboard/add-service" className="bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700 transition-colors duration-300 text-center">+ أضف خدمة</Link>
            </div>
            {/* Verification Status Card can be added here if needed */}
            <div className="bg-[var(--color-surface)] p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-transparent dark:border-[var(--color-border)]">
                <div className="border-b border-[var(--color-border)]">
                    <nav className="-mb-px flex space-x-6 space-x-reverse overflow-x-auto" aria-label="Tabs">
                        <button onClick={() => setActiveTab('analytics')} className={`${activeTab === 'analytics' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>التحليلات</button>
                        <button onClick={() => setActiveTab('financials')} className={`${activeTab === 'financials' ? 'border-green-500 text-green-600' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>الأموال</button>
                        <button onClick={() => setActiveTab('services')} className={`${activeTab === 'services' ? 'border-teal-500 text-teal-600' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>خدماتي ({providerServices.length})</button>
                        <button onClick={() => setActiveTab('bookings')} className={`${activeTab === 'bookings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>الحجوزات ({providerBookings.length})</button>
                    </nav>
                </div>
                <div className="mt-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboardPage;

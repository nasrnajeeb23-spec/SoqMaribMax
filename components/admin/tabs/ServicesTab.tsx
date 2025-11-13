import React from 'react';
import { Service } from '../../../types';

interface ServicesTabProps {
    services: Service[];
    formatPrice: (price: number) => string;
    deleteService: (serviceId: string, showToast: (msg: string, type: any) => void) => void;
    showToast: (msg: string, type: any) => void;
}

const ServicesTab: React.FC<ServicesTabProps> = ({ services, formatPrice, deleteService, showToast }) => {

    const handleDeleteService = (serviceId: string) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه الخدمة؟')) {
            deleteService(serviceId, showToast);
        }
    };
    
    return (
        <div>
            <h2 className="text-xl font-semibold text-[var(--color-text-muted)] mb-4">قائمة الخدمات</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-[var(--color-surface)] border border-[var(--color-border)] responsive-table">
                    <thead className="bg-gray-100 dark:bg-slate-900/50">
                        <tr>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الخدمة</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">مقدم الخدمة</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">السعر</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="text-[var(--color-text-base)]">
                        {services.map(service => (
                            <tr key={service.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]">
                                <td data-label="الخدمة" className="py-3 px-4">{service.title}</td>
                                <td data-label="المقدم" className="py-3 px-4">{service.provider.name}</td>
                                <td data-label="السعر" className="py-3 px-4">{formatPrice(service.price)}</td>
                                <td data-label="إجراءات" className="py-3 px-4">
                                    <button onClick={() => handleDeleteService(service.id)} className="bg-red-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-red-600 transition">حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ServicesTab;

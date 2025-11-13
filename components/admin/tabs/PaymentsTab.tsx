import React from 'react';
import { Payment, PaymentMethod, PaymentStatus } from '../../../types';

interface PaymentsTabProps {
    payments: Payment[];
    formatPrice: (price: number) => string;
    paymentMethodTranslations: { [key in PaymentMethod]: string };
    paymentStatusColors: { [key in PaymentStatus]: string };
    paymentStatusTranslations: { [key in PaymentStatus]: string };
}

const PaymentsTab: React.FC<PaymentsTabProps> = ({
    payments,
    formatPrice,
    paymentMethodTranslations,
    paymentStatusColors,
    paymentStatusTranslations
}) => {
    return (
        <div>
            <h2 className="text-xl font-semibold text-[var(--color-text-muted)] mb-4">قائمة المدفوعات</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-[var(--color-surface)] border border-[var(--color-border)] responsive-table">
                    <thead className="bg-gray-100 dark:bg-slate-900/50">
                        <tr>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">معرف الدفع</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">المبلغ</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الطريقة</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الحالة</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">التاريخ</th>
                        </tr>
                    </thead>
                    <tbody className="text-[var(--color-text-base)]">
                        {payments.map(payment => (
                            <tr key={payment.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]">
                                <td data-label="المعرف" className="py-3 px-4 text-xs font-mono">{payment.id}</td>
                                <td data-label="المبلغ" className="py-3 px-4 font-semibold">{formatPrice(payment.amount)}</td>
                                <td data-label="الطريقة" className="py-3 px-4">{paymentMethodTranslations[payment.method]}</td>
                                <td data-label="الحالة" className="py-3 px-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${paymentStatusColors[payment.status]}`}>{paymentStatusTranslations[payment.status]}</span></td>
                                <td data-label="التاريخ" className="py-3 px-4">{new Date(payment.date).toLocaleString('ar-EG')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentsTab;

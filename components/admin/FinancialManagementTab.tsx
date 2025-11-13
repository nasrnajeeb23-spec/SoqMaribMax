import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { usePayouts } from '../../hooks/usePayouts';
import { useToast } from '../../hooks/useToast';
import { PayoutStatus } from '../../types';
import Spinner from '../common/Spinner';

const FinancialManagementTab: React.FC = () => {
    const { users } = useAuth();
    const { payouts, approvePayout, rejectPayout } = usePayouts();
    const { showToast } = useToast();
    const [rejectingPayoutId, setRejectingPayoutId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const pendingPayouts = payouts.filter(p => p.status === 'PENDING');
    const processedPayouts = payouts.filter(p => p.status !== 'PENDING').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const formatPrice = (price: number) => new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER', minimumFractionDigits: 0 }).format(price);

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rejectingPayoutId && rejectionReason) {
            rejectPayout(rejectingPayoutId, rejectionReason, showToast);
            setRejectingPayoutId(null);
            setRejectionReason('');
        }
    };
    
    const payoutStatusColors: { [key in PayoutStatus]: string } = { PENDING: 'bg-yellow-200 text-yellow-800', COMPLETED: 'bg-green-200 text-green-800', FAILED: 'bg-red-200 text-red-800' };
    const payoutStatusTranslations: { [key in PayoutStatus]: string } = { PENDING: 'معلّق', COMPLETED: 'مكتمل', FAILED: 'فشل' };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold text-yellow-700 mb-4">طلبات السحب المعلقة</h2>
                <div className="overflow-x-auto bg-[var(--color-background)] p-4 rounded-lg border">
                     {pendingPayouts.length > 0 ? (
                    <table className="min-w-full bg-[var(--color-surface)] responsive-table">
                        <thead className="bg-gray-100 dark:bg-slate-900/50">
                            <tr>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">المستخدم</th>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">المبلغ</th>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">تفاصيل الحساب</th>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="text-[var(--color-text-base)]">
                            {pendingPayouts.map(payout => {
                                const user = users.find(u => u.id === payout.sellerId);
                                return (
                                <tr key={payout.id} className="border-b">
                                    <td data-label="المستخدم" className="py-3 px-4">{user?.name || 'غير معروف'}</td>
                                    <td data-label="المبلغ" className="py-3 px-4 font-semibold">{formatPrice(payout.amount)}</td>
                                    <td data-label="الحساب" className="py-3 px-4 text-sm">{payout.accountDetails}</td>
                                    <td data-label="الإجراءات" className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => approvePayout(payout.id, showToast)} className="bg-green-600 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-green-700">موافقة</button>
                                            <button onClick={() => setRejectingPayoutId(payout.id)} className="bg-red-600 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-red-700">رفض</button>
                                        </div>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                     ) : <p className="text-center py-6 text-gray-500">لا توجد طلبات سحب معلقة حالياً.</p>}
                </div>
            </div>
            
            <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">سجل الدفعات</h2>
                <div className="overflow-x-auto bg-[var(--color-background)] p-4 rounded-lg border">
                    <table className="min-w-full bg-[var(--color-surface)] responsive-table">
                         <thead className="bg-gray-100 dark:bg-slate-900/50">
                            <tr>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">المستخدم</th>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">المبلغ</th>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">التاريخ</th>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="text-[var(--color-text-base)]">
                            {processedPayouts.map(payout => {
                                const seller = users.find(u => u.id === payout.sellerId);
                                return (
                                <tr key={payout.id} className="border-b hover:bg-gray-50">
                                    <td data-label="المستخدم" className="py-3 px-4">{seller?.name || 'بائع محذوف'}</td>
                                    <td data-label="المبلغ" className="py-3 px-4 font-semibold">{formatPrice(payout.amount)}</td>
                                    <td data-label="التاريخ" className="py-3 px-4">{new Date(payout.processedAt || payout.date).toLocaleDateString('ar-EG')}</td>
                                    <td data-label="الحالة" className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${payoutStatusColors[payout.status]}`}>
                                            {payoutStatusTranslations[payout.status]}
                                        </span>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {rejectingPayoutId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleRejectSubmit} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">رفض طلب السحب</h3>
                        <p className="text-sm text-gray-600 mb-2">يرجى كتابة سبب الرفض (سيتم إرساله للمستخدم).</p>
                        <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={3} className="w-full p-2 border rounded-md" placeholder="مثال: معلومات الحساب غير صحيحة" required />
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setRejectingPayoutId(null)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300">إلغاء</button>
                            <button type="submit" className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700">تأكيد الرفض</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FinancialManagementTab;
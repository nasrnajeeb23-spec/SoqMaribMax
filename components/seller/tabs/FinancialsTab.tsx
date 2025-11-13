import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { usePayments } from '../../../hooks/usePayments';
import { useDeliveries } from '../../../hooks/useDeliveries';
import { usePayouts } from '../../../hooks/usePayouts';
import { useToast } from '../../../hooks/useToast';
import { useForm } from '../../../hooks/useForm';
import { required, isPositiveNumber } from '../../../utils/validation';
import Spinner from '../../common/Spinner';

const FinancialsTab: React.FC = () => {
    const { user } = useAuth();
    const { payments } = usePayments();
    const { deliveries } = useDeliveries();
    const { payouts, requestPayout } = usePayouts();
    const { showToast } = useToast();
    
    const { values, errors, touched, handleChange, handleBlur, handleSubmit, formIsValid } = useForm({
        initialValues: { amount: '', accountDetails: '' },
        validationRules: {
            amount: [required(), isPositiveNumber()],
            accountDetails: [required('يرجى إدخال تفاصيل الحساب.')],
        },
        onSubmit: (formValues, { resetForm }) => {
            if (user) {
                requestPayout(user.id, parseFloat(formValues.amount), formValues.accountDetails, showToast);
                resetForm();
            }
        }
    });

    const formatPrice = (price: number) => new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER', minimumFractionDigits: 0 }).format(price);

    const transactions = React.useMemo(() => {
        if (!user) return [];

        const incomeTransactions = payments
            .filter(p => {
                const delivery = deliveries.find(d => d.id === p.deliveryId);
                return p.status === 'RELEASED_TO_SELLER' && delivery && delivery.sellerId === user.id;
            })
            .map(p => {
                const delivery = deliveries.find(d => d.id === p.deliveryId)!;
                return {
                    id: p.id,
                    date: p.date,
                    description: `أرباح بيع المنتج #${delivery.productId}`,
                    amount: delivery.productPrice - delivery.platformFee,
                    type: 'income' as const,
                };
            });
            
        const payoutTransactions = payouts
            .filter(p => p.sellerId === user.id)
            .map(p => ({
                id: p.id,
                date: p.date,
                description: `طلب سحب إلى ${p.accountDetails} (${p.status})`,
                amount: -p.amount,
                type: 'payout' as const,
                status: p.status
            }));

        return [...incomeTransactions, ...payoutTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    }, [user, payments, deliveries, payouts]);
    
    const payoutStatusColors: { [key: string]: string } = { PENDING: 'text-yellow-600', COMPLETED: 'text-red-600', FAILED: 'text-gray-500' };
    const payoutStatusTranslations: { [key: string]: string } = { PENDING: 'معلّق', COMPLETED: 'مكتمل', FAILED: 'فشل' };


    if (!user) return null;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Balance & Payout Request */}
                <div className="bg-[var(--color-background)] p-6 rounded-lg border border-[var(--color-border)]">
                    <h3 className="text-lg font-semibold mb-1">الرصيد المتاح</h3>
                    <p className="text-4xl font-bold text-[var(--color-primary)]">{formatPrice(user.balance)}</p>
                    <div className="border-t my-6"></div>
                    <h3 className="text-lg font-semibold mb-4">طلب سحب الأرباح</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-[var(--color-text-muted)]">المبلغ (ريال)</label>
                            <input type="number" name="amount" id="amount" value={values.amount} onChange={handleChange} onBlur={handleBlur} className="mt-1 w-full p-2 border rounded-md" />
                            {touched.amount && errors.amount && <p className="text-sm text-red-500 mt-1">{errors.amount}</p>}
                        </div>
                         <div>
                            <label htmlFor="accountDetails" className="block text-sm font-medium text-[var(--color-text-muted)]">تفاصيل الحساب (بنك، رقم حساب، الخ)</label>
                            <textarea name="accountDetails" id="accountDetails" value={values.accountDetails} onChange={handleChange} onBlur={handleBlur} rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea>
                             {touched.accountDetails && errors.accountDetails && <p className="text-sm text-red-500 mt-1">{errors.accountDetails}</p>}
                        </div>
                        <button type="submit" disabled={!formIsValid} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400">
                            إرسال طلب السحب
                        </button>
                    </form>
                </div>

                {/* Transaction History */}
                <div className="bg-[var(--color-background)] p-6 rounded-lg border border-[var(--color-border)]">
                    <h3 className="text-lg font-semibold mb-4">كشف الحساب</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {transactions.length > 0 ? transactions.map(tx => (
                            <div key={tx.id} className="flex justify-between items-center bg-[var(--color-surface)] p-3 rounded-md border">
                                <div>
                                    <p className="font-medium text-sm">{tx.description}</p>
                                    <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleString('ar-EG')}</p>
                                </div>
                                <p className={`font-bold text-lg ${tx.type === 'income' ? 'text-green-600' : payoutStatusColors[tx.status!]}`}>
                                    {formatPrice(tx.amount)}
                                </p>
                            </div>
                        )) : (
                             <p className="text-center text-gray-500 py-10">لا توجد معاملات بعد.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialsTab;
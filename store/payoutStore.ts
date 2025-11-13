import { create } from 'zustand';
import { PayoutTransaction, PayoutStatus } from '../types';
import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';
import * as api from '../api';

interface PayoutState {
  payouts: PayoutTransaction[];
  requestPayout: (userId: string, amount: number, accountDetails: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  approvePayout: (payoutId: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  rejectPayout: (payoutId: string, reason: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  initialize: () => Promise<void>;
}

export const usePayoutStore = create<PayoutState>((set, get) => ({
  payouts: [],
  initialize: async () => {
    const payouts = await api.apiFetchPayouts();
    set({ payouts });
  },
  requestPayout: async (userId, amount, accountDetails, showToast) => {
    const { users } = useAuthStore.getState();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (amount <= 0) {
      showToast('مبلغ السحب يجب أن يكون أكبر من صفر.', 'error');
      return;
    }
    if (user.balance < amount) {
      showToast('رصيدك الحالي غير كافٍ لإتمام عملية السحب.', 'error');
      return;
    }

    const newPayoutData: Omit<PayoutTransaction, 'id'> = {
      sellerId: userId,
      amount,
      date: new Date().toISOString(),
      status: 'PENDING',
      accountDetails,
    };
    
    const newPayout = await api.apiAddPayout(newPayoutData);
    set(state => ({ payouts: [newPayout, ...state.payouts] }));
    
    // Notify admin
    const admin = users.find(u => u.role === 'ADMIN');
    if (admin) {
        useNotificationStore.getState().addNotification({
            userId: admin.id,
            message: `طلب سحب جديد من ${user.name} بقيمة ${amount} ريال.`,
            link: '/admin-dashboard?tab=financial',
        });
    }

    showToast('تم إرسال طلب السحب بنجاح.', 'success');
  },
  approvePayout: async (payoutId, showToast) => {
    const payout = get().payouts.find(p => p.id === payoutId);
    if (!payout || payout.status !== 'PENDING') return;

    const { users, updateUserBalance } = useAuthStore.getState();
    const seller = users.find(u => u.id === payout.sellerId);

    if (!seller || seller.balance < payout.amount) {
        showToast('فشل: رصيد البائع غير كافٍ.', 'error');
        get().rejectPayout(payoutId, 'رصيد غير كافٍ', showToast);
        return;
    }

    const updatedPayout = await api.apiUpdatePayout(payoutId, { status: 'COMPLETED', processedAt: new Date().toISOString() });
    set(state => ({ payouts: state.payouts.map(p => p.id === payoutId ? updatedPayout : p) }));
    
    await updateUserBalance(payout.sellerId, -payout.amount);

    useNotificationStore.getState().addNotification({
        userId: payout.sellerId,
        message: `تمت الموافقة على طلب السحب الخاص بك بمبلغ ${payout.amount} ريال.`,
        link: '/seller-dashboard?tab=financials'
    });
    showToast('تمت الموافقة على طلب السحب بنجاح.', 'success');
  },
  rejectPayout: async (payoutId, reason, showToast) => {
    const payout = get().payouts.find(p => p.id === payoutId);
    if (!payout) return;

    const updatedPayout = await api.apiUpdatePayout(payoutId, { status: 'FAILED', processedAt: new Date().toISOString(), rejectionReason: reason });
    set(state => ({ payouts: state.payouts.map(p => p.id === payoutId ? updatedPayout : p) }));
    
    useNotificationStore.getState().addNotification({
        userId: payout.sellerId,
        message: `تم رفض طلب السحب الخاص بك. السبب: ${reason}`,
        link: '/seller-dashboard?tab=financials'
    });
    showToast('تم رفض طلب السحب.', 'info');
  },
}));

usePayoutStore.getState().initialize();
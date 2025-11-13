import { create } from 'zustand';
import { Payment, PaymentMethod, PaymentStatus, Delivery, ServiceBooking } from '../types';
import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';
import * as api from '../api';
// FIX: Import useSettingsStore to access commission rate.
import { useSettingsStore } from './settingsStore';

interface PaymentState {
  payments: Payment[];
  addPayment: (paymentData: Omit<Payment, 'id' | 'date' | 'status'>) => Promise<Payment>;
  releasePaymentToSeller: (delivery: Delivery) => Promise<void>;
  releasePaymentForService: (booking: ServiceBooking) => Promise<void>;
  refundPaymentToBuyer: (delivery: Delivery) => Promise<void>;
  initialize: () => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  initialize: async () => {
      const payments = await api.apiFetchPayments();
      set({ payments });
  },
  addPayment: async (paymentData) => {
    const newPaymentData: Payment = {
      id: `pay-${Date.now()}`,
      status: 'HELD_IN_ESCROW',
      date: new Date().toISOString(),
      ...paymentData,
    };
    const newPayment = await api.apiAddPayment(newPaymentData);
    set(state => ({ payments: [...state.payments, newPayment] }));
    return newPayment;
  },
  releasePaymentToSeller: async (delivery) => {
    const payment = get().payments.find(p => p.deliveryId === delivery.id);
    if (!payment || !(payment.status === 'HELD_IN_ESCROW' || payment.status === 'PENDING')) {
      console.error('Payment not found or not in escrow for delivery:', delivery.id);
      return;
    }
    const updatedPayment = await api.apiUpdatePayment(payment.id, { status: 'RELEASED_TO_SELLER' });
    set(state => ({
      payments: state.payments.map(p => p.id === payment.id ? updatedPayment : p)
    }));
    
    const amountToRelease = delivery.productPrice - delivery.platformFee;
    await useAuthStore.getState().updateUserBalance(delivery.sellerId, amountToRelease);

    useNotificationStore.getState().addNotification({
        userId: delivery.sellerId,
        message: `تم تحويل مبلغ ${amountToRelease} ريال إلى محفظتك لعملية بيع مكتملة.`,
        link: '/seller-dashboard'
    });
  },
  releasePaymentForService: async (booking) => {
    const payment = get().payments.find(p => p.id === booking.paymentId);
    if (!payment || payment.status !== 'HELD_IN_ESCROW') {
      console.error('Payment for service booking not found or not in escrow:', booking.id);
      return;
    }
    const updatedPayment = await api.apiUpdatePayment(payment.id, { status: 'RELEASED_TO_SELLER' });
     set(state => ({
      payments: state.payments.map(p => p.id === payment.id ? updatedPayment : p)
    }));
    // Assuming platform fee is also applied to services
    const amountToRelease = booking.totalPrice * (1 - useSettingsStore.getState().settings.commissionRate);
    await useAuthStore.getState().updateUserBalance(booking.providerId, amountToRelease);
    useNotificationStore.getState().addNotification({
        userId: booking.providerId,
        message: `تم تحويل مبلغ ${amountToRelease} ريال إلى محفظتك مقابل إنجاز خدمة.`,
        link: '/seller-dashboard'
    });
  },
  refundPaymentToBuyer: async (delivery) => {
    const payment = get().payments.find(p => p.deliveryId === delivery.id);
    if (!payment) return;
    
    const updatedPayment = await api.apiUpdatePayment(payment.id, { status: 'REFUNDED' });
    set(state => ({
      payments: state.payments.map(p => p.id === payment.id ? updatedPayment : p)
    }));
    
    useNotificationStore.getState().addNotification({
        userId: delivery.buyerId,
        message: `تمت إعادة مبلغ ${delivery.totalPrice} ريال إلى حسابك لطلب ملغي.`,
        link: '/buyer-dashboard'
    });
  },
}));

usePaymentStore.getState().initialize();

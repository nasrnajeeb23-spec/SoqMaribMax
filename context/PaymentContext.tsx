import React, { createContext, useState, ReactNode } from 'react';
import { Payment, PaymentMethod, PaymentStatus, Delivery } from '../types';
import { mockPaymentsData } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useNotifications } from '../hooks/useNotifications';

interface PaymentContextType {
  payments: Payment[];
  addPayment: (paymentData: Omit<Payment, 'id' | 'date' | 'status'>) => void;
  releasePaymentToSeller: (delivery: Delivery) => void;
  refundPaymentToBuyer: (delivery: Delivery) => void;
}

export const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [payments, setPayments] = useState<Payment[]>(mockPaymentsData);
  const { updateUserBalance } = useAuth();
  const { showToast } = useToast();
  const { addNotification } = useNotifications();

  const addPayment = (paymentData: Omit<Payment, 'id' | 'date' | 'status'>) => {
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      status: 'HELD_IN_ESCROW', // New: Hold payment in escrow
      date: new Date().toISOString(),
      ...paymentData,
    };
    setPayments(prevPayments => [...prevPayments, newPayment]);
  };

  const releasePaymentToSeller = (delivery: Delivery) => {
    const payment = payments.find(p => p.deliveryId === delivery.id);
    if (!payment || !(payment.status === 'HELD_IN_ESCROW' || payment.status === 'PENDING')) {
      console.error('Payment not found or not in escrow for delivery:', delivery.id);
      return;
    }
    
    setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'RELEASED_TO_SELLER' } : p));
    
    const amountToRelease = delivery.productPrice - delivery.platformFee;
    updateUserBalance(delivery.sellerId, amountToRelease);

    addNotification({
        userId: delivery.sellerId,
        message: `تم تحويل مبلغ ${amountToRelease} ريال إلى محفظتك لعملية بيع مكتملة.`,
        link: '/seller-dashboard'
    });

    showToast('تم تحويل المبلغ إلى رصيد البائع بنجاح.', 'success');
  };

  const refundPaymentToBuyer = (delivery: Delivery) => {
    const payment = payments.find(p => p.deliveryId === delivery.id);
    if (!payment) return;
    
    setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'REFUNDED' } : p));
    
    addNotification({
        userId: delivery.buyerId,
        message: `تمت إعادة مبلغ ${delivery.totalPrice} ريال إلى حسابك لطلب ملغي.`,
        link: '/buyer-dashboard'
    });
    // In a real app, you would also return the money to the buyer's account/card.
    showToast('تمت إعادة المبلغ إلى المشتري.', 'info');
  };


  return (
    <PaymentContext.Provider value={{ payments, addPayment, releasePaymentToSeller, refundPaymentToBuyer }}>
      {children}
    </PaymentContext.Provider>
  );
};
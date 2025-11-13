import React, { createContext, useState, ReactNode } from 'react';
import { PayoutTransaction } from '../types';
import { mockPayoutsData } from '../data/payoutsData';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useNotifications } from '../hooks/useNotifications';

interface PayoutContextType {
  payouts: PayoutTransaction[];
  addPayout: (sellerId: string, amount: number) => void;
}

export const PayoutContext = createContext<PayoutContextType | undefined>(undefined);

interface PayoutProviderProps {
  children: ReactNode;
}

export const PayoutProvider: React.FC<PayoutProviderProps> = ({ children }) => {
  const [payouts, setPayouts] = useState<PayoutTransaction[]>(mockPayoutsData);
  const { updateUserBalance, users } = useAuth();
  const { showToast } = useToast();
  const { addNotification } = useNotifications();

  const addPayout = (sellerId: string, amount: number) => {
    const seller = users.find(u => u.id === sellerId);
    if (!seller) {
      showToast('لم يتم العثور على البائع.', 'error');
      return;
    }

    if (seller.balance < amount) {
      showToast('رصيد البائع غير كافٍ لإتمام عملية الدفع.', 'error');
      return;
    }

    const newPayout: PayoutTransaction = {
      id: `payout-${Date.now()}`,
      sellerId,
      amount,
      date: new Date().toISOString(),
      status: 'COMPLETED',
    };

    setPayouts(prev => [newPayout, ...prev]);

    // Decrease the seller's balance by the payout amount
    updateUserBalance(sellerId, -amount);

    addNotification({
      userId: sellerId,
      message: `تم تحويل مبلغ ${amount} ريال من محفظتك. رصيدك الجديد هو ${seller.balance - amount}.`,
      link: '/seller-dashboard',
    });

    showToast(`تم تسجيل دفعة بقيمة ${amount} ريال للبائع ${seller.name}.`, 'success');
  };

  return (
    <PayoutContext.Provider value={{ payouts, addPayout }}>
      {children}
    </PayoutContext.Provider>
  );
};

import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { Offer, OfferStatus } from '../types';
import { mockOffersData } from '../data/offersData';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useNotifications } from '../hooks/useNotifications';
import { useProducts } from '../hooks/useProducts';

interface OfferContextType {
  offers: Offer[];
  getOffersForProduct: (productId: string) => Offer[];
  getOffersByBuyer: (buyerId: string) => Offer[];
  getOffersForSeller: (sellerId: string) => Offer[];
  createOffer: (productId: string, sellerId: string, offerPrice: number) => void;
  updateOfferStatus: (offerId: string, status: OfferStatus, counterOfferPrice?: number) => void;
}

export const OfferContext = createContext<OfferContextType | undefined>(undefined);

interface OfferProviderProps {
  children: ReactNode;
}

export const OfferProvider: React.FC<OfferProviderProps> = ({ children }) => {
  const [offers, setOffers] = useState<Offer[]>(mockOffersData);
  const { user } = useAuth();
  const { products } = useProducts();
  const { showToast } = useToast();
  const { addNotification } = useNotifications();

  const getOffersForProduct = useCallback((productId: string) => offers.filter(o => o.productId === productId), [offers]);
  const getOffersByBuyer = useCallback((buyerId: string) => offers.filter(o => o.buyerId === buyerId), [offers]);
  const getOffersForSeller = useCallback((sellerId: string) => offers.filter(o => o.sellerId === sellerId), [offers]);

  const createOffer = (productId: string, sellerId: string, offerPrice: number) => {
    if (!user) {
      showToast('يجب تسجيل الدخول لتقديم عرض.', 'error');
      return;
    }

    const now = new Date().toISOString();
    const newOffer: Offer = {
      id: `offer-${Date.now()}`,
      productId,
      buyerId: user.id,
      sellerId,
      offerPrice,
      status: 'PENDING',
      timestamp: now,
      statusUpdateTimestamp: now,
    };

    setOffers(prev => [newOffer, ...prev]);
    
    const product = products.find(p => p.id === productId);
    addNotification({
      userId: sellerId,
      message: `لديك عرض جديد بقيمة ${offerPrice} ريال على منتج "${product?.name}" من ${user.name}.`,
      link: '/seller-dashboard',
    });
    showToast('تم إرسال عرضك بنجاح.', 'success');
  };

  const updateOfferStatus = (offerId: string, status: OfferStatus, counterOfferPrice?: number) => {
    let targetOffer: Offer | undefined;
    const now = new Date().toISOString();

    const updatedOffers = offers.map(o => {
      if (o.id === offerId) {
        targetOffer = { ...o, status, counterOfferPrice: counterOfferPrice || o.counterOfferPrice, statusUpdateTimestamp: now };
        return targetOffer;
      }
      return o;
    });

    setOffers(updatedOffers);

    if (targetOffer) {
        const product = products.find(p => p.id === targetOffer!.productId);
        const actor = user; // The logged-in user performing the action
        
        if (!actor) return;
    
        const isBuyerAction = actor.id === targetOffer.buyerId;
        
        let notificationRecipientId: string;
        let notificationMessage: string = '';
        let notificationLink: string;
    
        if (isBuyerAction) {
            // Buyer is responding to a counter-offer
            notificationRecipientId = targetOffer.sellerId;
            notificationLink = '/seller-dashboard';
            if (status === 'ACCEPTED') {
                notificationMessage = `قبل المشتري "${actor.name}" عرضك المضاد على "${product?.name}".`;
            } else if (status === 'REJECTED') {
                notificationMessage = `رفض المشتري "${actor.name}" عرضك المضاد على "${product?.name}".`;
            }
        } else {
            // Seller is responding to an initial offer
            notificationRecipientId = targetOffer.buyerId;
            notificationLink = '/buyer-dashboard';
            switch (status) {
                case 'ACCEPTED':
                    notificationMessage = `وافق البائع على عرضك لمنتج "${product?.name}". يمكنك الآن إتمام الشراء.`;
                    break;
                case 'REJECTED':
                    notificationMessage = `رفض البائع عرضك لمنتج "${product?.name}".`;
                    break;
                case 'COUNTER_OFFERED':
                    notificationMessage = `قدم البائع عرضاً مضاداً على منتج "${product?.name}".`;
                    break;
            }
        }
        
        if (notificationMessage) {
            addNotification({
                userId: notificationRecipientId,
                message: notificationMessage,
                link: notificationLink
            });
        }
    
        showToast('تم تحديث حالة العرض.', 'info');
    }
  };

  return (
    <OfferContext.Provider value={{
      offers,
      getOffersForProduct,
      getOffersByBuyer,
      getOffersForSeller,
      createOffer,
      updateOfferStatus,
    }}>
      {children}
    </OfferContext.Provider>
  );
};
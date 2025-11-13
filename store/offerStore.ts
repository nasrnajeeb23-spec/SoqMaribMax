import { create } from 'zustand';
import { Offer, OfferStatus } from '../types';
import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';
import { useProductStore } from './productStore';
import * as api from '../api';

interface OfferState {
  offers: Offer[];
  getOffersForProduct: (productId: string) => Offer[];
  getOffersByBuyer: (buyerId: string) => Offer[];
  getOffersForSeller: (sellerId: string) => Offer[];
  createOffer: (productId: string, sellerId: string, offerPrice: number, showToast: (msg: string, type: any) => void) => Promise<void>;
  updateOfferStatus: (offerId: string, status: OfferStatus, showToast: (msg: string, type: any) => void, counterOfferPrice?: number) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useOfferStore = create<OfferState>((set, get) => ({
  offers: [],
  initialize: async () => {
    const offers = await api.apiFetchOffers();
    set({ offers });
  },
  getOffersForProduct: (productId) => get().offers.filter(o => o.productId === productId),
  getOffersByBuyer: (buyerId) => get().offers.filter(o => o.buyerId === buyerId),
  getOffersForSeller: (sellerId) => get().offers.filter(o => o.sellerId === sellerId),
  createOffer: async (productId, sellerId, offerPrice, showToast) => {
    const { user } = useAuthStore.getState();
    if (!user) { showToast('يجب تسجيل الدخول لتقديم عرض.', 'error'); return; }

    const now = new Date().toISOString();
    const newOfferData: Offer = {
      id: `offer-${Date.now()}`, productId, buyerId: user.id, sellerId, offerPrice,
      status: 'PENDING', timestamp: now, statusUpdateTimestamp: now,
    };
    const newOffer = await api.apiAddOffer(newOfferData);
    set(state => ({ offers: [newOffer, ...state.offers] }));
    
    const product = useProductStore.getState().products.find(p => p.id === productId);
    useNotificationStore.getState().addNotification({
      userId: sellerId,
      message: `لديك عرض جديد بقيمة ${offerPrice} ريال على منتج "${product?.name}" من ${user.name}.`,
      link: '/seller-dashboard',
    });
    showToast('تم إرسال عرضك بنجاح.', 'success');
  },
  updateOfferStatus: async (offerId, status, showToast, counterOfferPrice) => {
    const now = new Date().toISOString();
    const { user } = useAuthStore.getState();
    const { products } = useProductStore.getState();
    const { addNotification } = useNotificationStore.getState();

    const updatedData: Partial<Offer> = { status, statusUpdateTimestamp: now };
    if (counterOfferPrice) {
        updatedData.counterOfferPrice = counterOfferPrice;
    }
    const updatedOffer = await api.apiUpdateOffer(offerId, updatedData);
    
    set(state => ({ offers: state.offers.map(o => o.id === offerId ? updatedOffer : o) }));

    if (user) {
        const product = products.find(p => p.id === updatedOffer.productId);
        const isBuyerAction = user.id === updatedOffer.buyerId;
        let recipientId: string, message = '', link = '';
    
        if (isBuyerAction) {
            recipientId = updatedOffer.sellerId;
            link = '/seller-dashboard';
            if (status === 'ACCEPTED') message = `قبل المشتري "${user.name}" عرضك المضاد على "${product?.name}".`;
            else if (status === 'REJECTED') message = `رفض المشتري "${user.name}" عرضك المضاد على "${product?.name}".`;
        } else {
            recipientId = updatedOffer.buyerId;
            link = '/buyer-dashboard';
            switch (status) {
                case 'ACCEPTED': message = `وافق البائع على عرضك لمنتج "${product?.name}". يمكنك الآن إتمام الشراء.`; break;
                case 'REJECTED': message = `رفض البائع عرضك لمنتج "${product?.name}".`; break;
                case 'COUNTER_OFFERED': message = `قدم البائع عرضاً مضاداً على منتج "${product?.name}".`; break;
            }
        }
        
        if (message) addNotification({ userId: recipientId, message, link });
        showToast('تم تحديث حالة العرض.', 'info');
    }
  },
}));

useOfferStore.getState().initialize();

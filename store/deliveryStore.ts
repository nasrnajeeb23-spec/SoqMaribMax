import { create } from 'zustand';
import { Delivery, DeliveryStatus, DeliveryHistoryEntry } from '../types';
import { mockDeliveriesData } from '../data/mockData';
import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';
import { useProductStore } from './productStore';
import { usePaymentStore } from './paymentStore';
import { useSettingsStore } from './settingsStore';

interface DeliveryState {
  deliveries: Delivery[];
  trackingWatchId: number | null; // To store the ID of the geolocation watch
  startTrackingDelivery: (deliveryId: string) => void;
  stopTrackingDelivery: () => void;
  addDelivery: (productId: string, sellerId: string, productPrice: number) => Delivery | undefined;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryStatus) => void;
  updateDeliveryLocation: (deliveryId: string, location: { lat: number; lng: number }) => void;
  confirmReceipt: (deliveryId: string) => void;
  markAsReadyForPickup: (deliveryId: string) => void;
  acceptDeliveryJob: (deliveryId: string) => void;
  confirmPickup: (deliveryId: string, scannedCode: string) => boolean;
  confirmDropoff: (deliveryId: string, enteredCode: string) => boolean;
}

const addHistoryEntry = (delivery: Delivery, status: DeliveryStatus, location?: { lat: number; lng: number; }): Delivery => {
    const newEntry: DeliveryHistoryEntry = { status, timestamp: new Date().toISOString(), location };
    return { ...delivery, status, deliveryHistory: [...delivery.deliveryHistory, newEntry] };
};

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  deliveries: mockDeliveriesData,
  trackingWatchId: null,
  
  startTrackingDelivery: (deliveryId) => {
    get().stopTrackingDelivery(); // Stop any existing tracking first
    if ("geolocation" in navigator) {
      let lastUpdateTime = 0; // Timestamp of the last update
      const UPDATE_INTERVAL = 30000; // 30 seconds in milliseconds

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const now = Date.now();
          // Throttle updates to save battery
          if (now - lastUpdateTime < UPDATE_INTERVAL) {
            return;
          }
          lastUpdateTime = now;

          const { latitude, longitude } = position.coords;
          get().updateDeliveryLocation(deliveryId, { lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Geolocation error:", error);
          // TODO: Optionally show a toast to the user
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
      set({ trackingWatchId: watchId });
    } else {
      console.error("Geolocation is not supported by this browser.");
      // TODO: Optionally show a toast to the user
    }
  },

  stopTrackingDelivery: () => {
    const { trackingWatchId } = get();
    if (trackingWatchId !== null) {
      navigator.geolocation.clearWatch(trackingWatchId);
      set({ trackingWatchId: null });
    }
  },

  addDelivery: (productId, sellerId, productPrice) => {
    const { user } = useAuthStore.getState();
    const { addNotification } = useNotificationStore.getState();
    const { products } = useProductStore.getState();
    const { settings } = useSettingsStore.getState();

    if (!user) {
      alert("يجب تسجيل الدخول لطلب التوصيل.");
      return;
    }

    const deliveryFee = 1500; // Reduced for local delivery
    const platformFee = productPrice * settings.commissionRate;
    const totalPrice = productPrice + deliveryFee + platformFee;
    const pickupCode = `SM-PICKUP-${Date.now()}`;
    const dropoffCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newDelivery: Delivery = {
      id: `del-${Date.now()}`,
      productId,
      buyerId: user.id,
      sellerId,
      status: 'PENDING',
      productPrice,
      deliveryFee,
      platformFee,
      totalPrice,
      date: new Date().toISOString(),
      pickupCode,
      dropoffCode,
      deliveryHistory: [{ status: 'PENDING', timestamp: new Date().toISOString() }],
    };

    set(state => ({ deliveries: [...state.deliveries, newDelivery] }));

    const product = products.find(p => p.id === productId);
    if (product) {
        addNotification({
            userId: sellerId,
            message: `لديك طلب جديد على المنتج "${product.name}" من ${user.name}. يرجى تجهيز الطلب للشحن.`,
            link: '/seller-dashboard'
        });
    }
    return newDelivery;
  },

  markAsReadyForPickup: (deliveryId) => {
    set(state => ({
        deliveries: state.deliveries.map(d => 
            d.id === deliveryId && d.status === 'PENDING'
            ? addHistoryEntry(d, 'READY_FOR_PICKUP')
            : d
        )
    }));
  },

  acceptDeliveryJob: (deliveryId) => {
    const { user } = useAuthStore.getState();
    if (!user || user.role !== 'DELIVERY') return;

    set(state => ({
        deliveries: state.deliveries.map(d => {
            if (d.id === deliveryId && d.status === 'READY_FOR_PICKUP' && !d.deliveryPersonId) {
                const updatedDelivery = { ...d, deliveryPersonId: user.id };
                const product = useProductStore.getState().products.find(p => p.id === d.productId);
                useNotificationStore.getState().addNotification({
                    userId: d.sellerId,
                    message: `مندوب التوصيل "${user.name}" في طريقه لاستلام شحنة "${product?.name}".`,
                    link: '/seller-dashboard'
                });
                return updatedDelivery;
            }
            return d;
        })
    }));
  },

  confirmPickup: (deliveryId, scannedCode) => {
    const delivery = get().deliveries.find(d => d.id === deliveryId);
    if (!delivery || delivery.pickupCode !== scannedCode) return false;

    set(state => ({
        deliveries: state.deliveries.map(d => d.id === deliveryId ? addHistoryEntry(d, 'IN_TRANSIT') : d)
    }));
    get().startTrackingDelivery(deliveryId); // START REAL TRACKING
    const product = useProductStore.getState().products.find(p => p.id === delivery.productId);
    useNotificationStore.getState().addNotification({
        userId: delivery.buyerId,
        message: `طلبك "${product?.name}" الآن قيد التوصيل!`,
        link: '/buyer-dashboard'
    });
    return true;
  },

  confirmDropoff: (deliveryId, enteredCode) => {
    const delivery = get().deliveries.find(d => d.id === deliveryId);
    if (!delivery || delivery.dropoffCode !== enteredCode) return false;
    
    get().stopTrackingDelivery(); // STOP REAL TRACKING
    set(state => ({
        deliveries: state.deliveries.map(d => d.id === deliveryId ? addHistoryEntry(d, 'DELIVERED') : d)
    }));
     const product = useProductStore.getState().products.find(p => p.id === delivery.productId);
    useNotificationStore.getState().addNotification({
        userId: delivery.buyerId,
        message: `تم توصيل طلبك "${product?.name}". يرجى تأكيد الاستلام.`,
        link: '/buyer-dashboard'
    });
    return true;
  },
  
  confirmReceipt: (deliveryId) => {
    const delivery = get().deliveries.find(d => d.id === deliveryId);
    if (!delivery || delivery.status !== 'DELIVERED') return;
    
    get().stopTrackingDelivery(); // Stop tracking just in case
    get().updateDeliveryStatus(deliveryId, 'COMPLETED');
    usePaymentStore.getState().releasePaymentToSeller(delivery);
  },

  updateDeliveryStatus: (deliveryId, status) => {
    let updatedDelivery: Delivery | null = null;
    
    set(state => ({
      deliveries: state.deliveries.map(delivery => {
        if (delivery.id === deliveryId) {
          updatedDelivery = addHistoryEntry(delivery, status);
          return updatedDelivery;
        }
        return delivery;
      })
    }));

    if (updatedDelivery) {
        if (['COMPLETED', 'CANCELED', 'IN_DISPUTE'].includes(status)) {
            get().stopTrackingDelivery();
        }

        const { addNotification } = useNotificationStore.getState();
        const { users } = useAuthStore.getState();
        const { products } = useProductStore.getState();
        const product = products.find(p => p.id === updatedDelivery!.productId);

        if (product) {
            let message = `تم تحديث حالة طلبك للمنتج "${product.name}".`;
            if (status === 'DELIVERED') message = `تم توصيل طلبك "${product.name}"! يرجى تأكيد الاستلام أو رفع نزاع في حال وجود مشكلة.`;
            if (status === 'COMPLETED') message = `اكتمل طلبك للمنتج "${product.name}". شكراً لتسوقك معنا.`;
            if (status === 'IN_DISPUTE') {
                const adminUser = users.find(u => u.role === 'ADMIN');
                const buyer = users.find(u => u.id === updatedDelivery!.buyerId);
                if (adminUser) addNotification({ userId: adminUser.id, message: `تم فتح نزاع جديد من قبل المشتري "${buyer?.name}" على طلب يخص المنتج "${product.name}".`, link: '/admin-dashboard' });
                addNotification({ userId: updatedDelivery!.sellerId, message: `قام المشتري "${buyer?.name}" بفتح نزاع على طلب المنتج "${product.name}". تم تجميد المبلغ.`, link: '/seller-dashboard' });
                return;
            }
            addNotification({ userId: updatedDelivery!.buyerId, message, link: '/buyer-dashboard' });
        }
    }
  },
  updateDeliveryLocation: (deliveryId, location) => {
    set(state => ({
      deliveries: state.deliveries.map(delivery =>
        delivery.id === deliveryId ? { ...delivery, current_location: location, deliveryHistory: [...delivery.deliveryHistory, { status: delivery.status, timestamp: new Date().toISOString(), location }] } : delivery
      )
    }));
  },
}));
import React, { createContext, useState, ReactNode } from 'react';
import { Delivery, DeliveryStatus, Product } from '../types';
import { mockDeliveriesData } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useProducts } from '../hooks/useProducts';
import { usePayments } from '../hooks/usePayments';
import { useSettings } from '../hooks/useSettings'; // New

interface DeliveryContextType {
  deliveries: Delivery[];
  addDelivery: (productId: string, sellerId: string, productPrice: number) => Delivery | undefined;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryStatus) => void;
  updateDeliveryLocation: (deliveryId: string, location: { lat: number; lng: number }) => void;
  confirmReceipt: (deliveryId: string) => void; // New
}

export const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

interface DeliveryProviderProps {
  children: ReactNode;
}

export const DeliveryProvider: React.FC<DeliveryProviderProps> = ({ children }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveriesData);
  const { user, users: allUsers } = useAuth();
  const { addNotification } = useNotifications();
  const { products } = useProducts();
  const { releasePaymentToSeller } = usePayments();
  const { settings } = useSettings(); // New

  const getProductById = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  const addDelivery = (productId: string, sellerId: string, productPrice: number): Delivery | undefined => {
    if (!user) {
      alert("يجب تسجيل الدخول لطلب التوصيل.");
      return;
    }
    
    const deliveryFee = 5000; // Mock delivery fee
    const platformFee = productPrice * settings.commissionRate; // Use setting
    const totalPrice = productPrice + deliveryFee + platformFee;

    const deliveryPerson = allUsers.find(u => u.role === 'DELIVERY');
    
    // FIX: Add missing properties to match the Delivery type
    const pickupCode = `SM-PICKUP-${Date.now()}`;
    const dropoffCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newDelivery: Delivery = {
      id: `del-${Date.now()}`,
      productId,
      buyerId: user.id,
      sellerId,
      status: 'PENDING', // Seller needs to prepare for shipping
      productPrice,
      deliveryFee,
      platformFee,
      totalPrice,
      deliveryPersonId: deliveryPerson?.id,
      date: new Date().toISOString(),
      pickupCode,
      dropoffCode,
      deliveryHistory: [{ status: 'PENDING', timestamp: new Date().toISOString() }],
    };

    setDeliveries(prevDeliveries => [...prevDeliveries, newDelivery]);
    
    const product = getProductById(productId);
    if(product) {
        addNotification({
            userId: sellerId,
            message: `لديك طلب جديد على المنتج "${product.name}" من ${user.name}. المبلغ مؤمّن لدينا، يرجى تجهيز الطلب للشحن.`,
            link: '/seller-dashboard'
        });
    }
    return newDelivery;
  };

  const confirmReceipt = (deliveryId: string) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (!delivery || delivery.status !== 'DELIVERED') return;

    // 1. Update delivery status to COMPLETED
    updateDeliveryStatus(deliveryId, 'COMPLETED');
    
    // 2. Release payment to seller
    releasePaymentToSeller(delivery);
  };

  const updateDeliveryStatus = (deliveryId: string, status: DeliveryStatus) => {
    let updatedDelivery: Delivery | null = null;
    
    setDeliveries(prevDeliveries =>
      prevDeliveries.map(delivery => {
        if (delivery.id === deliveryId) {
          updatedDelivery = { ...delivery, status };
          return updatedDelivery;
        }
        return delivery;
      })
    );

    // Notify users based on status change
    if (updatedDelivery) {
        const finalDelivery = updatedDelivery as Delivery;
        const product = getProductById(finalDelivery.productId);
        if (product) {
            let message = `تم تحديث حالة طلبك للمنتج "${product.name}".`;
            if (status === 'DELIVERED') {
                message = `تم توصيل طلبك "${product.name}"! يرجى تأكيد الاستلام أو رفع نزاع في حال وجود مشكلة.`
            }
            if (status === 'COMPLETED') {
                message = `اكتمل طلبك للمنتج "${product.name}". شكراً لتسوقك معنا.`
            }
             if (status === 'IN_DISPUTE') {
                const adminUser = allUsers.find(u => u.role === 'ADMIN');
                const buyer = allUsers.find(u => u.id === finalDelivery.buyerId);
                // Notify Admin
                if (adminUser) {
                    addNotification({
                        userId: adminUser.id,
                        message: `تم فتح نزاع جديد من قبل المشتري "${buyer?.name}" على طلب يخص المنتج "${product.name}".`,
                        link: '/admin-dashboard'
                    });
                }
                // Notify Seller
                 addNotification({
                    userId: finalDelivery.sellerId,
                    message: `قام المشتري "${buyer?.name}" بفتح نزاع على طلب المنتج "${product.name}". تم تجميد المبلغ.`,
                    link: '/seller-dashboard'
                });
                return; // Stop further notifications for this case
            }
            addNotification({
                userId: finalDelivery.buyerId,
                message: message,
                link: '/buyer-dashboard'
            });
        }
    }
  };

  const updateDeliveryLocation = (deliveryId: string, location: { lat: number; lng: number }) => {
    setDeliveries(prevDeliveries =>
      prevDeliveries.map(delivery =>
        delivery.id === deliveryId
          ? { ...delivery, current_location: location }
          : delivery
      )
    );
  };

  return (
    <DeliveryContext.Provider value={{ deliveries, addDelivery, updateDeliveryStatus, updateDeliveryLocation, confirmReceipt }}>
      {children}
    </DeliveryContext.Provider>
  );
};
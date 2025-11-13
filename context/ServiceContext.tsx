import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { Service, ServiceBooking, ServiceBookingStatus, ServiceReview } from '../types';
import { mockServicesData, mockBookingsData, mockServiceReviewsData } from '../data/servicesData';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useNotifications } from '../hooks/useNotifications';

interface ServiceContextType {
  services: Service[];
  bookings: ServiceBooking[];
  serviceReviews: ServiceReview[];
  getServiceById: (id: string) => Service | undefined;
  getReviewsForService: (serviceId: string) => ServiceReview[];
  addService: (serviceData: Omit<Service, 'id' | 'provider' | 'averageRating'>) => void;
  deleteService: (serviceId: string) => void;
  updateService: (serviceId: string, serviceData: Partial<Omit<Service, 'id' | 'provider'>>) => void;
  createBooking: (serviceId: string, bookingDate: string, notes?: string) => void;
  updateBookingStatus: (bookingId: string, status: ServiceBookingStatus) => void;
  addServiceReview: (serviceId: string, bookingId: string, rating: number, comment: string) => void;
  hasUserRatedService: (bookingId: string, reviewerId: string) => boolean;
}

export const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

interface ServiceProviderProps {
  children: ReactNode;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(mockServicesData);
  const [bookings, setBookings] = useState<ServiceBooking[]>(mockBookingsData);
  const [serviceReviews, setServiceReviews] = useState<ServiceReview[]>(mockServiceReviewsData);

  const { user } = useAuth();
  const { showToast } = useToast();
  const { addNotification } = useNotifications();

  const getServiceById = useCallback((id: string) => services.find(s => s.id === id), [services]);

  const getReviewsForService = useCallback((serviceId: string) => {
    return serviceReviews.filter(r => r.serviceId === serviceId)
                         .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [serviceReviews]);

  const addService = (serviceData: Omit<Service, 'id' | 'provider' | 'averageRating'>) => {
    if (!user || user.role !== 'SELLER') {
      showToast('يجب أن تكون بائعاً لإضافة خدمة.', 'error');
      return;
    }
    const newService: Service = {
      id: `svc-${Date.now()}`,
      provider: user,
      averageRating: 0,
      ...serviceData,
    };
    setServices(prev => [newService, ...prev]);
    showToast('تمت إضافة الخدمة بنجاح!', 'success');
  };
  
  const deleteService = (serviceId: string) => {
      setServices(prev => prev.filter(s => s.id !== serviceId));
      showToast('تم حذف الخدمة.', 'info');
  };

  const updateService = (serviceId: string, serviceData: Partial<Omit<Service, 'id' | 'provider'>>) => {
    setServices(prev => 
      prev.map(s => s.id === serviceId ? { ...s, ...serviceData } as Service : s)
    );
    // showToast('تم تحديث الخدمة بنجاح.', 'info'); // Commented out to avoid toast spam from admin panel
  };

  const createBooking = (serviceId: string, bookingDate: string, notes?: string) => {
    if (!user) {
      showToast('يجب تسجيل الدخول لحجز خدمة.', 'error');
      return;
    }
    const service = getServiceById(serviceId);
    if (!service) {
      showToast('الخدمة المطلوبة غير موجودة.', 'error');
      return;
    }

    const newBooking: ServiceBooking = {
      id: `book-${Date.now()}`,
      serviceId,
      clientId: user.id,
      providerId: service.provider.id,
      bookingDate,
      status: 'PENDING',
      totalPrice: service.price, // Can be adjusted later based on model
      notes,
    };

    setBookings(prev => [newBooking, ...prev]);

    addNotification({
      userId: service.provider.id,
      message: `لديك طلب حجز جديد لخدمة "${service.title}" من ${user.name}.`,
      link: '/seller-dashboard',
    });
    
    showToast('تم إرسال طلب الحجز بنجاح.', 'success');
  };

  const updateBookingStatus = (bookingId: string, status: ServiceBookingStatus) => {
    let targetBooking: ServiceBooking | null = null;
    
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        targetBooking = { ...b, status };
        return targetBooking;
      }
      return b;
    }));

    if (targetBooking) {
      const service = getServiceById(targetBooking.serviceId);
      addNotification({
        userId: targetBooking.clientId,
        message: `تم تحديث حالة حجزك لخدمة "${service?.title}" إلى: ${status}`,
        link: '/buyer-dashboard',
      });
      showToast('تم تحديث حالة الحجز.', 'info');
    }
  };
  
  const hasUserRatedService = (bookingId: string, reviewerId: string): boolean => {
    return serviceReviews.some(r => r.bookingId === bookingId && r.reviewerId === reviewerId);
  };
  
  const addServiceReview = (serviceId: string, bookingId: string, rating: number, comment: string) => {
      if (!user) {
        showToast("يجب تسجيل الدخول لإضافة تقييم.", 'error');
        return;
      }
      
      if(hasUserRatedService(bookingId, user.id)) {
          showToast("لقد قمت بتقييم هذه الخدمة من قبل.", 'info');
          return;
      }

      const newReview: ServiceReview = {
        id: `sr-${Date.now()}`,
        serviceId,
        bookingId,
        reviewerId: user.id,
        rating,
        comment,
        date: new Date().toISOString(),
      };
      
      setServiceReviews(prev => [newReview, ...prev]);
      
      // TODO: Recalculate and update service averageRating
      
      showToast("شكراً لك، تم إضافة تقييمك!", "success");
  };


  return (
    <ServiceContext.Provider value={{
      services,
      bookings,
      serviceReviews,
      getServiceById,
      getReviewsForService,
      addService,
      deleteService,
      updateService,
      createBooking,
      updateBookingStatus,
      addServiceReview,
      hasUserRatedService
    }}>
      {children}
    </ServiceContext.Provider>
  );
};
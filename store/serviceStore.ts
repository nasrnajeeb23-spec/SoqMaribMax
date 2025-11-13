import { create } from 'zustand';
import { Service, ServiceBooking, ServiceBookingStatus, ServiceReview } from '../types';
import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';
import { usePaymentStore } from './paymentStore';
import * as api from '../api';

interface ServiceState {
  services: Service[];
  bookings: ServiceBooking[];
  serviceReviews: ServiceReview[];
  getServiceById: (id: string) => Service | undefined;
  getReviewsForService: (serviceId: string) => ServiceReview[];
  addService: (serviceData: Omit<Service, 'id' | 'provider' | 'averageRating'>, showToast: (msg: string, type: any) => void) => Promise<void>;
  deleteService: (serviceId: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  updateService: (serviceId: string, serviceData: Partial<Omit<Service, 'id' | 'provider'>>) => Promise<void>;
  createBooking: (serviceId: string, bookingDate: string, notes: string | undefined, showToast: (msg: string, type: any) => void) => Promise<void>;
  acceptBooking: (bookingId: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  rejectBooking: (bookingId: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  payForBooking: (bookingId: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  markAsCompletedByProvider: (bookingId: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  confirmCompletionByBuyer: (bookingId: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  addServiceReview: (serviceId: string, bookingId: string, rating: number, comment: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  hasUserRatedService: (bookingId: string, reviewerId: string) => boolean;
  initialize: () => Promise<void>;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  bookings: [],
  serviceReviews: [],
  initialize: async () => {
    const [services, bookings, serviceReviews] = await Promise.all([
      api.apiFetchServices(),
      api.apiFetchBookings(),
      api.apiFetchServiceReviews(),
    ]);
    set({ services, bookings, serviceReviews });
  },
  getServiceById: (id) => get().services.find(s => s.id === id),
  getReviewsForService: (serviceId) => {
    return get().serviceReviews.filter(r => r.serviceId === serviceId)
                         .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  addService: async (serviceData, showToast) => {
    const { user } = useAuthStore.getState();
    if (!user || user.role !== 'PROVIDER') { showToast('يجب أن تكون مقدم خدمة لإضافة خدمة.', 'error'); return; }
    const newServiceData: Service = { id: `svc-${Date.now()}`, provider: user, averageRating: 0, ...serviceData };
    const newService = await api.apiAddService(newServiceData);
    set(state => ({ services: [newService, ...state.services] }));
    showToast('تمت إضافة الخدمة بنجاح!', 'success');
  },
  deleteService: async (serviceId, showToast) => {
    await api.apiDeleteService(serviceId);
    set(state => ({ services: state.services.filter(s => s.id !== serviceId) }));
    showToast('تم حذف الخدمة.', 'info');
  },
  updateService: async (serviceId, serviceData) => {
    const updatedService = await api.apiUpdateService(serviceId, serviceData);
    set(state => ({
      services: state.services.map(s => s.id === serviceId ? updatedService : s)
    }));
  },
  createBooking: async (serviceId, bookingDate, notes, showToast) => {
    const { user } = useAuthStore.getState();
    if (!user) { showToast('يجب تسجيل الدخول لحجز خدمة.', 'error'); return; }
    const service = get().getServiceById(serviceId);
    if (!service) { showToast('الخدمة المطلوبة غير موجودة.', 'error'); return; }
    const newBookingData: ServiceBooking = {
      id: `book-${Date.now()}`, serviceId, clientId: user.id, providerId: service.provider.id,
      bookingDate, status: 'PENDING', totalPrice: service.price, notes,
    };
    const newBooking = await api.apiAddBooking(newBookingData);
    set(state => ({ bookings: [newBooking, ...state.bookings] }));
    useNotificationStore.getState().addNotification({
      userId: service.provider.id,
      message: `لديك طلب حجز جديد لخدمة "${service.title}" من ${user.name}.`,
      link: '/provider-dashboard?tab=bookings',
    });
    showToast('تم إرسال طلب الحجز بنجاح.', 'success');
  },
  acceptBooking: async (bookingId, showToast) => {
    const updatedBooking = await api.apiUpdateBooking(bookingId, { status: 'AWAITING_PAYMENT' });
    set(state => ({ bookings: state.bookings.map(b => b.id === bookingId ? updatedBooking : b) }));
    const service = get().getServiceById(updatedBooking.serviceId);
    useNotificationStore.getState().addNotification({
        userId: updatedBooking.clientId,
        message: `وافق مقدم الخدمة على طلبك لـ "${service?.title}". بانتظار الدفع.`,
        link: '/buyer-dashboard?tab=services',
    });
    showToast('تم قبول الحجز.', 'info');
  },
  rejectBooking: async (bookingId, showToast) => {
    const updatedBooking = await api.apiUpdateBooking(bookingId, { status: 'REJECTED' });
    set(state => ({ bookings: state.bookings.map(b => b.id === bookingId ? updatedBooking : b) }));
    const service = get().getServiceById(updatedBooking.serviceId);
    useNotificationStore.getState().addNotification({
        userId: updatedBooking.clientId,
        message: `تم رفض طلب حجزك لخدمة "${service?.title}".`,
        link: '/buyer-dashboard?tab=services',
    });
    showToast('تم رفض الحجز.', 'info');
  },
  payForBooking: async (bookingId, showToast) => {
    const booking = get().bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const payment = await usePaymentStore.getState().addPayment({
      bookingId: booking.id,
      amount: booking.totalPrice,
      method: 'BANK_TRANSFER' // Mock payment method
    });
    
    const updatedBooking = await api.apiUpdateBooking(bookingId, { status: 'IN_PROGRESS', paymentId: payment.id });
    set(state => ({ bookings: state.bookings.map(b => b.id === bookingId ? updatedBooking : b) }));

    const service = get().getServiceById(booking.serviceId);
    useNotificationStore.getState().addNotification({
      userId: booking.providerId,
      message: `قام العميل بالدفع مقابل خدمة "${service?.title}". يمكنك البدء الآن.`,
      link: '/provider-dashboard?tab=bookings',
    });
    showToast('تم الدفع بنجاح! أموالك في أمان.', 'success');
  },
  markAsCompletedByProvider: async (bookingId, showToast) => {
    const updatedBooking = await api.apiUpdateBooking(bookingId, { status: 'COMPLETED_BY_PROVIDER' });
    set(state => ({ bookings: state.bookings.map(b => b.id === bookingId ? updatedBooking : b) }));
    const service = get().getServiceById(updatedBooking.serviceId);
    useNotificationStore.getState().addNotification({
        userId: updatedBooking.clientId,
        message: `أكمل مقدم الخدمة "${service?.title}". يرجى تأكيد الاكتمال.`,
        link: '/buyer-dashboard?tab=services',
    });
    showToast('تم تحديد الخدمة كمكتملة.', 'info');
  },
  confirmCompletionByBuyer: async (bookingId, showToast) => {
    const booking = get().bookings.find(b => b.id === bookingId);
    if (!booking) return;

    await usePaymentStore.getState().releasePaymentForService(booking);
    const updatedBooking = await api.apiUpdateBooking(bookingId, { status: 'COMPLETED' });
    set(state => ({ bookings: state.bookings.map(b => b.id === bookingId ? updatedBooking : b) }));

    showToast('تم تأكيد اكتمال الخدمة وتحويل المبلغ.', 'success');
  },
  hasUserRatedService: (bookingId, reviewerId) => {
    return get().serviceReviews.some(r => r.bookingId === bookingId && r.reviewerId === reviewerId);
  },
  addServiceReview: async (serviceId, bookingId, rating, comment, showToast) => {
      const { user } = useAuthStore.getState();
      if (!user) { showToast("يجب تسجيل الدخول لإضافة تقييم.", 'error'); return; }
      if (get().hasUserRatedService(bookingId, user.id)) { showToast("لقد قمت بتقييم هذه الخدمة من قبل.", 'info'); return; }

      const newReviewData: ServiceReview = {
        id: `sr-${Date.now()}`, serviceId, bookingId, reviewerId: user.id, rating, comment, date: new Date().toISOString(),
      };
      const newReview = await api.apiAddServiceReview(newReviewData);
      set(state => ({ serviceReviews: [newReview, ...state.serviceReviews] }));
      
      // TODO: Recalculate and update service averageRating via API
      
      showToast("شكراً لك، تم إضافة تقييمك!", "success");
  },
}));

useServiceStore.getState().initialize();
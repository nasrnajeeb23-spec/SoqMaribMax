import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useDeliveries } from '../../hooks/useDeliveries';
import { useProducts } from '../../hooks/useProducts';
import { useServices } from '../../hooks/useServices';
import { useRating } from '../../hooks/useRating';
import { useOffers } from '../../hooks/useOffers';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { useSearch } from '../../hooks/useSearch'; // New
import { useCategories } from '../../hooks/useCategories'; // New
import { DeliveryStatus, ServiceBookingStatus, OfferStatus, SavedSearch, Category } from '../../types';
import DeliveryMap from '../../components/delivery/DeliveryMap';
import StarRating from '../../components/common/StarRating';
import { useNavigate, Link } from 'react-router-dom';

interface RatingFormState {
  deliveryId: string;
  ratedUserId: string;
  ratedUserName: string;
  type: 'SELLER' | 'DELIVERY';
}

interface ServiceRatingFormState {
  bookingId: string;
  serviceId: string;
  serviceTitle: string;
}

type Tab = 'products' | 'services' | 'offers' | 'following' | 'savedSearches'; // Updated

const BuyerDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const { user, users } = useAuth();
  const { deliveries, confirmReceipt, updateDeliveryStatus } = useDeliveries();
  const { products } = useProducts();
  const { bookings, services, addServiceReview, hasUserRatedService } = useServices();
  const { addRating, hasUserRatedTransaction } = useRating();
  const { getOffersByBuyer, updateOfferStatus } = useOffers();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { savedSearches, deleteSearch } = useSearch(); // New
  const { productCategories: categories } = useCategories(); // New
  const navigate = useNavigate();

  const [trackingDeliveryId, setTrackingDeliveryId] = useState<string | null>(null);
  const [ratingFormState, setRatingFormState] = useState<RatingFormState | null>(null);
  const [serviceRatingFormState, setServiceRatingFormState] = useState<ServiceRatingFormState | null>(null);
  const [currentRating, setCurrentRating] = useState(0);
  const [currentComment, setCurrentComment] = useState('');
  const [eta, setEta] = useState<number | null>(null); // State for ETA in minutes

  const myDeliveries = deliveries.filter(d => d.buyerId === user?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  const myBookings = bookings.filter(b => b.clientId === user?.id)
    .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());

  const myOffers = user ? getOffersByBuyer(user.id) : [];
  
  const followedSellers = user?.following ? users.filter(u => user.following!.includes(u.id)) : [];

  const getProductById = (productId: string) => products.find(p => p.id === productId);
  const getServiceById = (serviceId: string) => services.find(s => s.id === serviceId);
  const getUserById = (userId: string) => users.find(u => u.id === userId);
  const getCategoryById = (categoryId: string | null): Category | undefined => categoryId ? categories.find(c => c.id === categoryId) : undefined; // New

  const trackingDelivery = trackingDeliveryId ? myDeliveries.find(d => d.id === trackingDeliveryId) : null;
  const trackingData = useMemo(() => {
      if (!trackingDelivery) return null;
      
      const seller = getUserById(trackingDelivery.sellerId);
      const buyer = getUserById(trackingDelivery.buyerId);

      if (!seller || !buyer) return null;

      const startLocation = seller.location;
      const endLocation = buyer.location;

      if (!startLocation || !endLocation) return null;

      return {
          liveLocation: trackingDelivery.current_location,
          startLocation,
          endLocation
      };
  }, [trackingDelivery, users]);

  const handleToggleTracking = (deliveryId: string) => {
    if (trackingDeliveryId === deliveryId) {
      setTrackingDeliveryId(null);
      setEta(null); // Reset ETA when closing
    } else {
      setTrackingDeliveryId(deliveryId);
      setEta(null); // Reset ETA when opening a new one
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER', minimumFractionDigits: 0 }).format(price);
  };

  const deliveryStatusTranslations: { [key in DeliveryStatus]: string } = {
    PENDING: 'بانتظار البائع',
    READY_FOR_PICKUP: 'جاهز للاستلام',
    IN_TRANSIT: 'قيد التوصيل',
    DELIVERED: 'بانتظار تأكيدك',
    COMPLETED: 'مكتمل',
    CANCELED: 'ملغي',
    IN_DISPUTE: 'قيد النزاع'
  };

  const deliveryStatusColors: { [key in DeliveryStatus]: string } = {
    PENDING: 'bg-yellow-200 text-yellow-800',
    READY_FOR_PICKUP: 'bg-sky-200 text-sky-800',
    IN_TRANSIT: 'bg-blue-200 text-blue-800',
    DELIVERED: 'bg-cyan-200 text-cyan-800',
    COMPLETED: 'bg-green-200 text-green-800',
    CANCELED: 'bg-red-200 text-red-800',
    IN_DISPUTE: 'bg-orange-200 text-orange-800'
  };

  // FIX: Added missing properties to match the ServiceBookingStatus type.
  const bookingStatusTranslations: { [key in ServiceBookingStatus]: string } = {
    PENDING: 'بانتظار موافقة المقدم',
    CONFIRMED: 'مؤكد',
    AWAITING_PAYMENT: 'بانتظار الدفع',
    IN_PROGRESS: 'قيد التنفيذ',
    COMPLETED_BY_PROVIDER: 'بانتظار تأكيدك',
    COMPLETED: 'مكتمل',
    REJECTED: 'مرفوض',
    CANCELED: 'ملغي',
  };

  // FIX: Added missing properties to match the ServiceBookingStatus type.
  const bookingStatusColors: { [key in ServiceBookingStatus]: string } = {
    PENDING: 'bg-yellow-200 text-yellow-800',
    CONFIRMED: 'bg-sky-200 text-sky-800',
    AWAITING_PAYMENT: 'bg-cyan-200 text-cyan-800',
    IN_PROGRESS: 'bg-blue-200 text-blue-800',
    COMPLETED_BY_PROVIDER: 'bg-purple-200 text-purple-800',
    COMPLETED: 'bg-green-200 text-green-800',
    REJECTED: 'bg-red-200 text-red-800',
    CANCELED: 'bg-gray-200 text-gray-800',
  };

   const offerStatusTranslations: { [key in OfferStatus]: string } = {
    PENDING: 'معلّق',
    ACCEPTED: 'مقبول',
    REJECTED: 'مرفوض',
    COUNTER_OFFERED: 'عرض مضاد'
  };

  const offerStatusColors: { [key in OfferStatus]: string } = {
    PENDING: 'bg-yellow-200 text-yellow-800',
    ACCEPTED: 'bg-green-200 text-green-800',
    REJECTED: 'bg-red-200 text-red-800',
    COUNTER_OFFERED: 'bg-blue-200 text-blue-800'
  };
  
  const conditionTranslations = {
    'all': 'الكل',
    'new': 'جديد',
    'used': 'مستعمل'
  };

  const handleOpenRatingForm = (deliveryId: string, ratedUserId: string, type: 'SELLER' | 'DELIVERY') => {
    const ratedUser = getUserById(ratedUserId);
    if (!ratedUser) return;
    setRatingFormState({
      deliveryId,
      ratedUserId,
      ratedUserName: ratedUser.name,
      type
    });
    setCurrentRating(0);
    setCurrentComment('');
  };

  const handleOpenServiceRatingForm = (bookingId: string, serviceId: string) => {
    const service = getServiceById(serviceId);
    if (!service) return;
    setServiceRatingFormState({ bookingId, serviceId, serviceTitle: service.title });
    setCurrentRating(0);
    setCurrentComment('');
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ratingFormState && currentRating > 0) {
      addRating(ratingFormState.ratedUserId, ratingFormState.deliveryId, currentRating, currentComment);
      setRatingFormState(null);
    }
    if (serviceRatingFormState && currentRating > 0) {
      addServiceReview(serviceRatingFormState.serviceId, serviceRatingFormState.bookingId, currentRating, currentComment);
      setServiceRatingFormState(null);
    }
  };

  const handleCompletePurchase = (productId: string, price: number) => {
      addToCart(productId, 1, price);
      showToast('تمت إضافة المنتج للسلة بالسعر المتفق عليه.', 'success');
      navigate('/cart');
  };

  const handleViewSearchResults = (search: SavedSearch) => {
    const params = new URLSearchParams();
    if (search.searchTerm) params.set('q', search.searchTerm);
    if (search.categoryId) params.set('cat', search.categoryId);
    if (search.condition) params.set('cond', search.condition);
    navigate(`/?${params.toString()}`);
  };
  
  const handleConfirmReceipt = (deliveryId: string) => {
    if(window.confirm('هل أنت متأكد من استلامك للمنتج وأنه مطابق للمواصفات؟ سيتم تحويل المبلغ إلى البائع.')) {
        confirmReceipt(deliveryId);
        showToast('شكراً لك! تم تأكيد الاستلام بنجاح.', 'success');
    }
  };

  const handleReportDispute = (deliveryId: string) => {
    if(window.confirm('هل أنت متأكد من وجود مشكلة في هذا الطلب؟ سيتم فتح نزاع وستقوم الإدارة بمراجعة الأمر.')) {
        updateDeliveryStatus(deliveryId, 'IN_DISPUTE');
        showToast('تم فتح نزاع بنجاح. سيتواصل معك فريق الدعم قريباً.', 'info');
    }
  };


  return (
    <div className="bg-[var(--color-surface)] p-4 sm:p-6 md:p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-[var(--color-text-base)] mb-6">لوحة التحكم</h1>

       <div className="border-b border-[var(--color-border)] mb-6">
        <nav className="-mb-px flex space-x-6 space-x-reverse overflow-x-auto" aria-label="Tabs">
          <button onClick={() => setActiveTab('products')} className={`${activeTab === 'products' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            طلبات المنتجات ({myDeliveries.length})
          </button>
           <button onClick={() => setActiveTab('services')} className={`${activeTab === 'services' ? 'border-teal-500 text-teal-600' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            حجوزات الخدمات ({myBookings.length})
          </button>
           <button onClick={() => setActiveTab('offers')} className={`${activeTab === 'offers' ? 'border-orange-500 text-orange-600' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            عروضي ({myOffers.length})
          </button>
          <button onClick={() => setActiveTab('savedSearches')} className={`${activeTab === 'savedSearches' ? 'border-green-500 text-green-600' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            عمليات البحث المحفوظة ({savedSearches.length})
          </button>
          <button onClick={() => setActiveTab('following')} className={`${activeTab === 'following' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            البائعون المفضلون ({followedSellers.length})
          </button>
        </nav>
      </div>

      {activeTab === 'products' && (
        myDeliveries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[var(--color-surface)] border border-[var(--color-border)] responsive-table">
              <thead className="bg-gray-100 dark:bg-slate-900/50">
                <tr>
                  <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">المنتج</th>
                  <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">حالة التوصيل</th>
                  <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="text-[var(--color-text-base)]">
                {myDeliveries.map(delivery => {
                  const product = getProductById(delivery.productId);
                  const seller = getUserById(delivery.sellerId);
                  const deliveryPerson = delivery.deliveryPersonId ? getUserById(delivery.deliveryPersonId) : null;
                  const hasRatedSeller = user ? hasUserRatedTransaction(delivery.id, user.id, delivery.sellerId) : false;
                  const hasRatedDelivery = user && delivery.deliveryPersonId ? hasUserRatedTransaction(delivery.id, user.id, delivery.deliveryPersonId) : false;

                  return (
                    <tr key={delivery.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]">
                      <td data-label="المنتج" className="py-3 px-4">
                        {product ? (
                          <div className="flex items-center">
                            <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md ml-4" />
                            <div>
                              <p className="font-semibold">{product.name}</p>
                              <p className="text-sm text-[var(--color-text-muted)]">البائع: {seller?.name || 'غير معروف'}</p>
                              <p className="text-sm text-[var(--color-text-muted)]">{new Date(delivery.date).toLocaleDateString('ar-EG')}</p>
                            </div>
                          </div>
                        ) : ('منتج محذوف')}
                      </td>
                      <td data-label="الحالة" className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${deliveryStatusColors[delivery.status]}`}>
                          {deliveryStatusTranslations[delivery.status]}
                        </span>
                        {delivery.status === 'DELIVERED' && (
                            <div className="mt-2 bg-sky-50 p-2 rounded-md border border-sky-200 text-center">
                                <p className="text-xs text-sky-800 font-medium">رمز التسليم الخاص بك:</p>
                                <p className="text-2xl font-bold tracking-widest text-sky-700">{delivery.dropoffCode}</p>
                            </div>
                        )}
                      </td>
                      <td data-label="الإجراءات" className="py-3 px-4">
                        <div className="flex flex-col gap-2">
                           {delivery.status === 'IN_TRANSIT' && (
                            <button
                              onClick={() => handleToggleTracking(delivery.id)}
                              className="bg-[var(--color-primary)] text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-[var(--color-primary-hover)] transition w-full text-center"
                            >
                              {trackingDeliveryId === delivery.id ? 'إخفاء الخريطة' : 'تتبع الطلب'}
                            </button>
                          )}
                          {delivery.status === 'DELIVERED' && (
                            <div className="space-y-2">
                                <button onClick={() => handleConfirmReceipt(delivery.id)} className="w-full bg-green-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-green-600 transition">تأكيد الاستلام</button>
                                <button onClick={() => handleReportDispute(delivery.id)} className="w-full bg-orange-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-orange-600 transition">رفع نزاع</button>
                            </div>
                          )}
                           {delivery.status === 'COMPLETED' && (
                            <>
                              <Link to={`/invoice/${delivery.id}`} target="_blank" className="bg-gray-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-gray-600 transition w-full text-center">
                                عرض الفاتورة
                              </Link>
                             {seller && (
                               hasRatedSeller ? <span className="text-xs text-green-600">تم تقييم البائع</span> : <button onClick={() => handleOpenRatingForm(delivery.id, seller.id, 'SELLER')} className="bg-green-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-green-600 transition w-full text-center">تقييم البائع</button>
                             )}
                             {deliveryPerson && (
                                hasRatedDelivery ? <span className="text-xs text-green-600">تم تقييم المندوب</span> : <button onClick={() => handleOpenRatingForm(delivery.id, deliveryPerson.id, 'DELIVERY')} className="bg-blue-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-blue-600 transition w-full text-center">تقييم المندوب</button>
                             )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-[var(--color-border)] rounded-lg">
            <p className="text-[var(--color-text-muted)] text-lg">لم تقم بطلب أي منتجات بعد.</p>
          </div>
        )
      )}

      {activeTab === 'services' && (
        myBookings.length > 0 ? (
          <div className="overflow-x-auto">
             <table className="min-w-full bg-[var(--color-surface)] border border-[var(--color-border)] responsive-table">
              <thead className="bg-gray-100 dark:bg-slate-900/50">
                <tr>
                  <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الخدمة</th>
                  <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">حالة الحجز</th>
                  <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="text-[var(--color-text-base)]">
                {myBookings.map(booking => {
                    const service = getServiceById(booking.serviceId);
                    const provider = service ? getUserById(service.provider.id) : null;
                    const hasRated = user ? hasUserRatedService(booking.id, user.id) : false;
                    return (
                        <tr key={booking.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]">
                            <td data-label="الخدمة" className="py-3 px-4">
                                {service ? (
                                    <div className="flex items-center">
                                    <img src={service.imageUrl} alt={service.title} className="w-16 h-16 object-cover rounded-md ml-4" />
                                    <div>
                                        <p className="font-semibold">{service.title}</p>
                                        <p className="text-sm text-gray-500">المقدم: {provider?.name || 'غير معروف'}</p>
                                        <p className="text-sm text-gray-500">{new Date(booking.bookingDate).toLocaleDateString('ar-EG')}</p>
                                    </div>
                                    </div>
                                ) : 'خدمة محذوفة'}
                            </td>
                            <td data-label="الحالة" className="py-3 px-4">
                               <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bookingStatusColors[booking.status]}`}>
                                {bookingStatusTranslations[booking.status]}
                                </span>
                            </td>
                            <td data-label="الإجراءات" className="py-3 px-4">
                                {booking.status === 'COMPLETED' && !hasRated && (
                                     <button onClick={() => handleOpenServiceRatingForm(booking.id, booking.serviceId)} className="bg-teal-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-teal-600 transition w-full text-center">
                                        تقييم الخدمة
                                     </button>
                                )}
                                {booking.status === 'COMPLETED' && hasRated && (
                                    <span className="text-xs text-green-600">تم تقييم الخدمة</span>
                                )}
                            </td>
                        </tr>
                    )
                })}
              </tbody>
            </table>
          </div>
        ) : (
            <div className="text-center py-10 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                 <p className="text-gray-500 text-lg">لم تقم بحجز أي خدمات بعد.</p>
            </div>
        )
      )}

      {activeTab === 'offers' && (
         myOffers.length > 0 ? (
            <div className="overflow-x-auto">
                 <table className="min-w-full bg-[var(--color-surface)] border border-[var(--color-border)] responsive-table">
                    <thead className="bg-gray-100 dark:bg-slate-900/50">
                        <tr>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">المنتج</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الأسعار</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الحالة</th>
                            <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="text-[var(--color-text-base)]">
                        {myOffers.map(offer => {
                            const product = getProductById(offer.productId);
                            return (
                            <tr key={offer.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-background)]">
                                <td data-label="المنتج" className="py-3 px-4">
                                    {product ? (
                                        <div className="flex items-center">
                                            <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md ml-4" />
                                            <div>
                                                <p className="font-semibold">{product.name}</p>
                                                <p className="text-sm text-gray-500">{new Date(offer.timestamp).toLocaleDateString('ar-EG')}</p>
                                            </div>
                                        </div>
                                    ) : 'منتج محذوف'}
                                </td>
                                <td data-label="الأسعار" className="py-3 px-4">
                                    <p className="text-xs text-gray-500 line-through">الأصلي: {formatPrice(product?.price || 0)}</p>
                                    <p className="font-semibold">عرضك: {formatPrice(offer.offerPrice)}</p>
                                    {offer.status === 'COUNTER_OFFERED' && <p className="font-semibold text-blue-600">عرض البائع: {formatPrice(offer.counterOfferPrice!)}</p>}
                                </td>
                                <td data-label="الحالة" className="py-3 px-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${offerStatusColors[offer.status]}`}>
                                        {offerStatusTranslations[offer.status]}
                                    </span>
                                </td>
                                <td data-label="الإجراءات" className="py-3 px-4">
                                    {offer.status === 'ACCEPTED' && (
                                        <button onClick={() => handleCompletePurchase(offer.productId, offer.offerPrice)} className="bg-green-600 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-green-700">إتمام الشراء</button>
                                    )}
                                     {offer.status === 'COUNTER_OFFERED' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => { updateOfferStatus(offer.id, 'ACCEPTED'); handleCompletePurchase(offer.productId, offer.counterOfferPrice!) }} className="bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-green-600">قبول</button>
                                            <button onClick={() => updateOfferStatus(offer.id, 'REJECTED')} className="bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-red-600">رفض</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                            )
                        })}
                    </tbody>
                 </table>
            </div>
         ) : (
            <div className="text-center py-10 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                <p className="text-gray-500 text-lg">لم تقم بتقديم أي عروض بعد.</p>
            </div>
         )
      )}

      {activeTab === 'savedSearches' && (
        savedSearches.length > 0 ? (
          <div className="space-y-4">
            {savedSearches.map(search => (
              <div key={search.id} className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-grow">
                  <p className="font-bold text-[var(--color-text-base)]">
                    {search.searchTerm ? `"${search.searchTerm}"` : 'أي منتج'}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-text-muted)] mt-1">
                    <span>التصنيف: <span className="font-semibold">{getCategoryById(search.categoryId)?.name || 'الكل'}</span></span>
                    <span>الحالة: <span className="font-semibold">{conditionTranslations[search.condition]}</span></span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 self-end sm:self-center">
                  <button onClick={() => handleViewSearchResults(search)} className="bg-[var(--color-primary)] text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-[var(--color-primary-hover)] transition">عرض النتائج</button>
                  <button onClick={() => deleteSearch(search.id)} className="bg-red-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-red-600 transition">حذف</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div className="text-center py-10 border-2 border-dashed border-[var(--color-border)] rounded-lg">
            <p className="text-gray-500 text-lg">ليس لديك أي عمليات بحث محفوظة.</p>
            <p className="text-sm text-gray-400 mt-1">اذهب إلى الصفحة الرئيسية واحفظ بحثك لتصلك الإشعارات.</p>
          </div>
        )
      )}

      {activeTab === 'following' && (
        followedSellers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {followedSellers.map(seller => (
              <div key={seller.id} className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-gray-300 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-white text-2xl mx-auto mb-3">
                  {seller.name.charAt(0)}
                </div>
                <h3 className="font-bold text-[var(--color-text-base)]">{seller.name}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{seller.city}</p>
                <Link to={`/sellers/${seller.id}`} className="mt-3 inline-block bg-[var(--color-primary)] text-white text-sm font-bold py-1 px-4 rounded-md hover:bg-[var(--color-primary-hover)] transition">
                  زيارة المتجر
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-[var(--color-border)] rounded-lg">
            <p className="text-gray-500 text-lg">أنت لا تتابع أي بائعين حتى الآن.</p>
            <p className="text-sm text-gray-400 mt-1">قم بزيارة صفحة أي بائع واضغط على زر "متابعة".</p>
          </div>
        )
      )}
      
      {(ratingFormState || serviceRatingFormState) && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--color-surface)] rounded-lg shadow-xl p-6 w-full max-w-md">
                 <h2 className="text-xl font-bold mb-4">
                    {ratingFormState ? `تقييم ${ratingFormState.type === 'SELLER' ? 'البائع' : 'المندوب'}: ${ratingFormState.ratedUserName}` : `تقييم خدمة: ${serviceRatingFormState?.serviceTitle}`}
                 </h2>
                 <form onSubmit={handleRatingSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">التقييم (من 1 إلى 5)</label>
                        <StarRating rating={currentRating} onRatingChange={setCurrentRating} size="lg" />
                    </div>
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-[var(--color-text-muted)]">تعليق (اختياري)</label>
                        <textarea id="comment" value={currentComment} onChange={e => setCurrentComment(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-[var(--color-border)] rounded-md shadow-sm focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] bg-[var(--color-background)]"></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => { setRatingFormState(null); setServiceRatingFormState(null); }} className="bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200 font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors">إلغاء</button>
                        <button type="submit" disabled={currentRating === 0} className="bg-[var(--color-primary)] text-white font-bold py-2 px-4 rounded-md hover:bg-[var(--color-primary-hover)] transition-colors disabled:bg-gray-400">إرسال التقييم</button>
                    </div>
                 </form>
            </div>
         </div>
      )}

      {trackingDeliveryId && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-4">تتبع الطلب المباشر</h3>
          {trackingData ? (
            <>
              {eta !== null && (
                <div className="bg-sky-50 p-3 rounded-lg border border-sky-200 text-center mb-4">
                  <p className="font-semibold text-sky-800">الوقت التقديري للوصول: ~{eta} دقيقة</p>
                </div>
              )}
              <DeliveryMap
                liveLocation={trackingData.liveLocation}
                startLocation={trackingData.startLocation}
                endLocation={trackingData.endLocation}
                onRouteSummary={(summary) => setEta(Math.round(summary.totalTime / 60))}
              />
            </>
          ) : (
            <div className="text-center p-4 bg-gray-100 rounded-md">
              <p className="text-gray-600">لا يمكن عرض المسار. قد تكون معلومات الموقع غير مكتملة.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BuyerDashboardPage;
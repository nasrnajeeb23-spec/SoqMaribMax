import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useServices } from '../hooks/useServices';
import { useAuth } from '../hooks/useAuth';
import StarRating from '../components/common/StarRating';
import { useAuthPrompt } from '../hooks/useAuthPrompt';

const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { getServiceById, getReviewsForService, createBooking } = useServices();
  const { user, users } = useAuth();
  const prompt = useAuthPrompt();
  
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingNotes, setBookingNotes] = useState('');

  const service = serviceId ? getServiceById(serviceId) : undefined;
  const reviews = useMemo(() => service ? getReviewsForService(service.id) : [], [service, getReviewsForService]);

  if (!service) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">عذراً، هذه الخدمة غير موجودة!</h2>
        <Link to="/services" className="text-teal-600 hover:underline mt-4 inline-block">العودة لسوق الخدمات</Link>
      </div>
    );
  }
  
  const handleBookingSubmitAction = (e: React.FormEvent) => {
      e.preventDefault();
      createBooking(service.id, bookingDate, bookingNotes);
      setShowBookingModal(false);
  };

  const handleMessageProviderAction = () => {
    navigate(`/chat/${service.provider.id}`);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER', minimumFractionDigits: 0 }).format(price);
  const canInteract = user?.id !== service.provider.id;
  
  return (
    <div className="space-y-12">
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div><img src={service.imageUrl} alt={service.title} className="w-full h-auto object-cover rounded-lg shadow-md" /></div>
          <div className="flex flex-col">
            <Link to="/services" className="text-sm text-teal-600 hover:underline">{service.category.name}</Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">{service.title}</h1>
            <div className="flex items-center mt-2 space-x-2 space-x-reverse">
              <StarRating rating={service.averageRating} readOnly={true} />
              <span className="text-gray-500">({reviews.length} تقييمات)</span>
            </div>
            
            <p className="text-4xl font-bold text-teal-600 my-6">{formatPrice(service.price)}</p>
            
            <div className="mt-auto pt-6 space-y-3">
               {canInteract && user?.role === 'BUYER' && (
                 <button onClick={prompt(() => setShowBookingModal(true), 'يجب تسجيل الدخول لحجز الخدمات.')} className="w-full block text-center bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors duration-300 text-lg">
                  اطلب الخدمة الآن
                </button>
               )}
               {canInteract && (
                <button onClick={prompt(handleMessageProviderAction, 'تواصل مع مقدمي الخدمات بعد تسجيل الدخول.')} className="w-full block text-center bg-white text-teal-600 border-2 border-teal-600 font-bold py-3 px-6 rounded-lg hover:bg-teal-50 transition-colors duration-300 text-lg">
                  تواصل مع مقدم الخدمة
                </button>
               )}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t">
            <h2 className="text-xl font-bold text-gray-800 mb-2">وصف الخدمة</h2>
            <p className="text-gray-600 leading-relaxed">{service.description}</p>
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">معلومات مقدم الخدمة</h3>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{service.provider.name.charAt(0)}</div>
                <div>
                  <Link to={`/sellers/${service.provider.id}`} className="font-bold text-gray-700 hover:text-[var(--color-primary)] hover:underline">{service.provider.name}</Link>
                  <p className="text-sm text-gray-500">{service.city}</p>
                </div>
              </div>
            </div>
        </div>
      </div>
      
      <div className="bg-[var(--color-surface)] rounded-lg shadow-xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">تقييمات الخدمة</h2>
        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map(review => {
                const reviewer = users.find(u => u.id === review.reviewerId);
                return (
              <div key={review.id} className="flex items-start space-x-4 space-x-reverse border-b pb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center font-bold">{reviewer?.name.charAt(0)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-800">{reviewer?.name || 'مستخدم'}</h4>
                    <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <StarRating rating={review.rating} readOnly={true} size="sm" />
                  <p className="text-gray-600 mt-2">{review.comment}</p>
                </div>
              </div>
            )})
          ) : (
            <p className="text-center text-gray-500">لا توجد تقييمات لهذه الخدمة حتى الآن.</p>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                 <h2 className="text-xl font-bold mb-4">تأكيد طلب الخدمة</h2>
                 <form onSubmit={handleBookingSubmitAction} className="space-y-4">
                    <div>
                        <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700">التاريخ المطلوب</label>
                        <input type="date" id="bookingDate" value={bookingDate} onChange={e => setBookingDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">ملاحظات إضافية (اختياري)</label>
                        <textarea id="notes" value={bookingNotes} onChange={e => setBookingNotes(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder="أخبر مقدم الخدمة بتفاصيل إضافية..."></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setShowBookingModal(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors">إلغاء</button>
                        <button type="submit" className="bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700 transition-colors">إرسال الطلب</button>
                    </div>
                 </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default ServiceDetailPage;
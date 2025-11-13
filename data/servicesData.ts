import { Service, ServiceBooking, ServiceReview, User, ServiceCategory } from '../types';

const addDays = (date: Date, days: number): string => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
};
const today = new Date();

const serviceCategories: ServiceCategory[] = [
    { id: 'sc1', name: 'تصميم وجرافيكس', description: 'تصميم شعارات، هويات بصرية، إعلانات' },
    { id: 'sc2', name: 'برمجة وتطوير', description: 'تطوير مواقع، تطبيقات، أنظمة' },
    { id: 'sc3', name: 'صيانة منزلية', description: 'سباكة، كهرباء، تكييف' },
    { id: 'sc4', name: 'استشارات', description: 'استشارات قانونية، مالية، إدارية' },
    { id: 'sc5', name: 'تعليم وتدريب', description: 'دروس تقوية، دورات تدريبية' },
];

const providerUser: Partial<User> = { 
    id: 'user-3', 
    name: 'خالد صالح', 
    email: 'provider@example.com', 
    role: 'PROVIDER', 
    city: 'مأرب', 
    joinDate: '2023-03-10T08:30:00Z', 
    verificationStatus: 'PENDING_VERIFICATION' 
};

export const mockServicesData: Service[] = [
    { id: 'svc1', title: 'تصميم شعار احترافي', description: 'أقوم بتصميم شعارات مبتكرة وفريدة من نوعها للشركات والأفراد. أسلم العمل خلال 3 أيام.', category: serviceCategories[0], provider: providerUser as User, pricingModel: 'FIXED', price: 15000, city: 'صنعاء', imageUrl: 'https://picsum.photos/seed/logo-design/400/300', availability: 'طوال أيام الأسبوع', averageRating: 4.9, isFeatured: true, featuredEndDate: addDays(today, 5) }
];

export const mockBookingsData: ServiceBooking[] = [
    { id: 'book1', serviceId: 'svc1', clientId: 'user-2', providerId: 'user-3', bookingDate: new Date().toISOString(), status: 'COMPLETED', totalPrice: 15000, notes: 'أريد شعاراً باللونين الأزرق والفضي.' }
];

export const mockServiceReviewsData: ServiceReview[] = [
    { id: 'sr1', serviceId: 'svc1', bookingId: 'book1', reviewerId: 'user-2', rating: 5, comment: 'المصمم محترف جداً وفهم الفكرة من أول مرة. سعيد جداً بالنتيجة!', date: new Date().toISOString() }
];

import { Product, User, Category, ServiceCategory, Delivery, Payment, Review, Advertisement, UserRating, Service, ServiceBooking, ServiceReview, CommunityPost, PostComment, Offer, PayoutTransaction, Message, Conversation, Store } from '../types';

// ===================================================================================
// تحديد رابط الـ API بشكل ديناميكي
// هذا الكود يتحقق من بيئة التشغيل لتحديد الرابط الصحيح للخادم الخلفي.
// ===================================================================================
let API_URL: string;

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // --- وضع التطوير المحلي ---
  // عند تشغيل التطبيق على جهازك، سيتصل بالخادم الخلفي المحلي.
  // تأكد من تشغيل الخادم الخلفي باتباع التعليمات في README.md
  API_URL = 'http://localhost:4000/api';
  console.log('Running in development mode. API is at:', API_URL);
} else {
  // --- وضع الإنتاج (النشر) ---
  // عند نشر التطبيق على Vercel، سيستخدم هذا الرابط تلقائياً للاتصال بالخادم الخلفي.
  API_URL = 'https://soqmaribmax.onrender.com/api';
  console.log('Running in production mode. API is at:', API_URL);
}


const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
    }
    return response.json();
};

// --- API Functions ---

// Auth API
export const apiLoginUser = (email: string): Promise<User> => fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }).then(handleResponse);
export const apiRegisterUser = (userData: Omit<User, 'id'>): Promise<User> => fetch(`${API_URL}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) }).then(handleResponse);
export const apiUpdateUser = (userId: string, updatedData: Partial<User>): Promise<User> => fetch(`${API_URL}/users/${userId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) }).then(handleResponse);
export const apiFetchUsers = (): Promise<User[]> => fetch(`${API_URL}/users`).then(handleResponse);

// Store API
export const apiFetchStores = (): Promise<Store[]> => fetch(`${API_URL}/stores`).then(handleResponse);
export const apiAddStore = (newStoreData: Omit<Store, 'id'>): Promise<Store> => fetch(`${API_URL}/stores`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newStoreData) }).then(handleResponse);

// Product API
export const apiFetchProducts = (): Promise<Product[]> => fetch(`${API_URL}/products`).then(handleResponse);
export const apiAddProduct = (newProduct: Product): Promise<Product> => fetch(`${API_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newProduct) }).then(handleResponse);
export const apiUpdateProduct = (productId: string, productData: Partial<Product>): Promise<Product> => fetch(`${API_URL}/products/${productId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) }).then(handleResponse);
export const apiDeleteProduct = (productId: string): Promise<void> => fetch(`${API_URL}/products/${productId}`, { method: 'DELETE' }).then(res => res.ok ? Promise.resolve() : Promise.reject('Failed to delete'));

// Delivery API
export const apiFetchDeliveries = (): Promise<Delivery[]> => fetch(`${API_URL}/deliveries`).then(handleResponse);
export const apiAddDelivery = (newDelivery: Delivery): Promise<Delivery> => fetch(`${API_URL}/deliveries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newDelivery) }).then(handleResponse);
export const apiUpdateDelivery = (deliveryId: string, updatedData: Partial<Delivery>): Promise<Delivery> => fetch(`${API_URL}/deliveries/${deliveryId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) }).then(handleResponse);

// Payment API
export const apiFetchPayments = (): Promise<Payment[]> => fetch(`${API_URL}/payments`).then(handleResponse);
export const apiAddPayment = (newPayment: Payment): Promise<Payment> => fetch(`${API_URL}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPayment) }).then(handleResponse);
export const apiUpdatePayment = (paymentId: string, updatedData: Partial<Payment>): Promise<Payment> => fetch(`${API_URL}/payments/${paymentId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) }).then(handleResponse);

// Payout API
export const apiFetchPayouts = (): Promise<PayoutTransaction[]> => fetch(`${API_URL}/payouts`).then(handleResponse);
export const apiAddPayout = (newPayoutData: Omit<PayoutTransaction, 'id'>): Promise<PayoutTransaction> => fetch(`${API_URL}/payouts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPayoutData) }).then(handleResponse);
export const apiUpdatePayout = (payoutId: string, updatedData: Partial<PayoutTransaction>): Promise<PayoutTransaction> => fetch(`${API_URL}/payouts/${payoutId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) }).then(handleResponse);

// Review API
export const apiFetchReviews = (): Promise<Review[]> => fetch(`${API_URL}/reviews`).then(handleResponse);
export const apiAddReview = (newReview: Review): Promise<Review> => fetch(`${API_URL}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReview) }).then(handleResponse);

// Rating API
export const apiFetchRatings = (): Promise<UserRating[]> => fetch(`${API_URL}/ratings`).then(handleResponse);
export const apiAddRating = (newRating: UserRating): Promise<UserRating> => fetch(`${API_URL}/ratings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newRating) }).then(handleResponse);

// Ad API
export const apiFetchAds = (): Promise<Advertisement[]> => fetch(`${API_URL}/ads`).then(handleResponse);
export const apiAddAd = (newAd: Advertisement): Promise<Advertisement> => fetch(`${API_URL}/ads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newAd) }).then(handleResponse);

// Category API
export const apiFetchProductCategories = (): Promise<Category[]> => fetch(`${API_URL}/product-categories`).then(handleResponse);
export const apiAddProductCategory = (newCategory: Category): Promise<Category> => fetch(`${API_URL}/product-categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCategory) }).then(handleResponse);
export const apiUpdateProductCategory = (id: string, name: string, description: string): Promise<Category> => fetch(`${API_URL}/product-categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description }) }).then(handleResponse);
export const apiDeleteProductCategory = (id: string): Promise<void> => fetch(`${API_URL}/product-categories/${id}`, { method: 'DELETE' }).then(res => res.ok ? Promise.resolve() : Promise.reject('Failed to delete'));

export const apiFetchServiceCategories = (): Promise<ServiceCategory[]> => fetch(`${API_URL}/service-categories`).then(handleResponse);
export const apiAddServiceCategory = (newCategory: ServiceCategory): Promise<ServiceCategory> => fetch(`${API_URL}/service-categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCategory) }).then(handleResponse);
export const apiUpdateServiceCategory = (id: string, name: string, description: string): Promise<ServiceCategory> => fetch(`${API_URL}/service-categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description }) }).then(handleResponse);
export const apiDeleteServiceCategory = (id: string): Promise<void> => fetch(`${API_URL}/service-categories/${id}`, { method: 'DELETE' }).then(res => res.ok ? Promise.resolve() : Promise.reject('Failed to delete'));

// Community API
export const apiFetchPosts = (): Promise<CommunityPost[]> => fetch(`${API_URL}/posts`).then(handleResponse);
export const apiAddPost = (newPost: CommunityPost): Promise<CommunityPost> => fetch(`${API_URL}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPost) }).then(handleResponse);
export const apiUpdatePost = (postId: string, updatedData: Partial<CommunityPost>): Promise<CommunityPost> => fetch(`${API_URL}/posts/${postId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) }).then(handleResponse);
export const apiDeletePost = (postId: string): Promise<void> => fetch(`${API_URL}/posts/${postId}`, { method: 'DELETE' }).then(res => res.ok ? Promise.resolve() : Promise.reject('Failed to delete'));

export const apiFetchComments = (): Promise<PostComment[]> => fetch(`${API_URL}/comments`).then(handleResponse);
export const apiAddComment = (newComment: PostComment): Promise<PostComment> => fetch(`${API_URL}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newComment) }).then(handleResponse);

// Offer API
export const apiFetchOffers = (): Promise<Offer[]> => fetch(`${API_URL}/offers`).then(handleResponse);
export const apiAddOffer = (newOffer: Offer): Promise<Offer> => fetch(`${API_URL}/offers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newOffer) }).then(handleResponse);
export const apiUpdateOffer = (offerId: string, updatedData: Partial<Offer>): Promise<Offer> => fetch(`${API_URL}/offers/${offerId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) }).then(handleResponse);

// Service API
export const apiFetchServices = (): Promise<Service[]> => fetch(`${API_URL}/services`).then(handleResponse);
export const apiAddService = (newService: Service): Promise<Service> => fetch(`${API_URL}/services`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newService) }).then(handleResponse);
export const apiDeleteService = (serviceId: string): Promise<void> => fetch(`${API_URL}/services/${serviceId}`, { method: 'DELETE' }).then(res => res.ok ? Promise.resolve() : Promise.reject('Failed to delete'));
export const apiUpdateService = (serviceId: string, serviceData: Partial<Service>): Promise<Service> => fetch(`${API_URL}/services/${serviceId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(serviceData) }).then(handleResponse);

export const apiFetchBookings = (): Promise<ServiceBooking[]> => fetch(`${API_URL}/bookings`).then(handleResponse);
export const apiAddBooking = (newBooking: ServiceBooking): Promise<ServiceBooking> => fetch(`${API_URL}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newBooking) }).then(handleResponse);
export const apiUpdateBooking = (bookingId: string, updatedData: Partial<ServiceBooking>): Promise<ServiceBooking> => fetch(`${API_URL}/bookings/${bookingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) }).then(handleResponse);

export const apiFetchServiceReviews = (): Promise<ServiceReview[]> => fetch(`${API_URL}/service-reviews`).then(handleResponse);
export const apiAddServiceReview = (newReview: ServiceReview): Promise<ServiceReview> => fetch(`${API_URL}/service-reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReview) }).then(handleResponse);

// Chat API
export const apiFetchConversations = (): Promise<Conversation[]> => fetch(`${API_URL}/conversations`).then(handleResponse);
export const apiAddConversation = (newConversation: Conversation): Promise<Conversation> => fetch(`${API_URL}/conversations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newConversation) }).then(handleResponse);
export const apiFetchMessages = (): Promise<Message[]> => fetch(`${API_URL}/messages`).then(handleResponse);
export const apiAddMessage = (newMessage: Message): Promise<Message> => fetch(`${API_URL}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMessage) }).then(handleResponse);
export const apiUpdateMessages = (updatedMessages: Message[]): Promise<void> => fetch(`${API_URL}/messages`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedMessages) }).then(res => res.ok ? Promise.resolve() : Promise.reject('Failed to update'));
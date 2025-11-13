import { Product, User, Category, ServiceCategory, Delivery, Payment, Store } from '../types';

const addDays = (date: Date, days: number): string => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
};
const today = new Date();

const MARIB_CENTER = { lat: 15.4545, lng: 45.3187 };
const MARIB_RADIUS_KM = 5;
const generateMaribLocation = () => {
    const r = MARIB_RADIUS_KM * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    const lat = MARIB_CENTER.lat + (r / 111.32) * Math.cos(theta);
    const lng = MARIB_CENTER.lng + (r / (111.32 * Math.cos(MARIB_CENTER.lat * Math.PI / 180))) * Math.sin(theta);
    return { lat, lng };
};

export const categories: Category[] = [
    { id: '1', name: 'إلكترونيات', description: 'أجهزة لابتوب، هواتف، اكسسوارات وغيرها' },
    { id: '2', name: 'أثاث منزلي', description: 'كل ما يحتاجه المنزل من أثاث وديكور' },
    { id: '3', name: 'سيارات', description: 'سيارات جديدة ومستعملة للبيع' },
    { id: '4', name: 'ملابس', description: 'ملابس رجالية، نسائية، وأطفال' },
    { id: '5', name: 'عقارات', description: 'شقق، أراضي، محلات تجارية للبيع والإيجار' },
];

export const serviceCategories: ServiceCategory[] = [
    { id: 'sc1', name: 'تصميم وجرافيكس', description: 'تصميم شعارات، هويات بصرية، إعلانات' },
    { id: 'sc2', name: 'برمجة وتطوير', description: 'تطوير مواقع، تطبيقات، أنظمة' },
    { id: 'sc3', name: 'صيانة منزلية', description: 'سباكة، كهرباء، تكييف' },
    { id: 'sc4', name: 'استشارات', description: 'استشارات قانونية، مالية، إدارية' },
    { id: 'sc5', name: 'تعليم وتدريب', description: 'دروس تقوية، دورات تدريبية' },
];

export const users: User[] = [
    { id: 'user-1', name: 'أحمد علي المأربي', email: 'seller@example.com', role: 'SELLER', storeId: 'store-1', city: 'مأرب', location: generateMaribLocation(), phone: '777111222', joinDate: '2023-01-15T12:00:00Z', verificationStatus: 'VERIFIED', averageRating: 4.8, balance: 50000, isSuspended: false, contactInfo: { whatsapp: '967777111222', facebook: 'https://facebook.com/ahmed.ali' } },
    { id: 'user-2', name: 'فاطمة حسن', email: 'buyer@example.com', role: 'BUYER', city: 'مأرب', location: generateMaribLocation(), phone: '777333444', joinDate: '2023-02-20T10:00:00Z', verificationStatus: 'NOT_VERIFIED', following: ['user-1'], balance: 0, isSuspended: false },
    { id: 'user-3', name: 'خالد صالح', email: 'provider@example.com', role: 'PROVIDER', city: 'مأرب', location: generateMaribLocation(), phone: '777555666', joinDate: '2023-03-10T08:30:00Z', verificationStatus: 'PENDING_VERIFICATION', commercialRegisterUrl: 'https://picsum.photos/seed/register1/800/600', guaranteeUrl: 'https://picsum.photos/seed/guarantee1/800/600', averageRating: 4.5, balance: 120000, isSuspended: false, contactInfo: { whatsapp: '967777555666', instagram: 'https://instagram.com/khaled.saleh' } },
    { id: 'admin-1', name: 'مدير النظام', email: 'admin@example.com', role: 'ADMIN', city: 'مأرب', location: MARIB_CENTER, phone: '777000000', joinDate: '2023-01-01T00:00:00Z', verificationStatus: 'VERIFIED', balance: 0, isSuspended: false },
    { id: 'delivery-1', name: 'علي السريع', email: 'delivery@example.com', role: 'DELIVERY', city: 'مأرب', location: generateMaribLocation(), phone: '777888999', joinDate: '2023-04-05T14:00:00Z', verificationStatus: 'VERIFIED', averageRating: 5.0, balance: 15000, isSuspended: false },
    { id: 'user-google', name: 'مستخدم جوجل', email: 'google_user@example.com', role: 'BUYER', city: 'مأرب', location: generateMaribLocation(), phone: '777999888', joinDate: '2023-05-15T12:00:00Z', verificationStatus: 'NOT_VERIFIED', balance: 0, isSuspended: false},
];

const sellerUserForP1 = users.find(u => u.id === 'user-1');

export const mockProductsData: Product[] = [
    { id: 'p1', name: 'لابتوب ديل مستعمل', description: 'لابتوب ديل بحالة ممتازة، مناسب للأعمال والدراسة. معالج Core i5، رام 8 جيجا. موجود في حي الشركة.', price: 120000, category: categories[0], city: 'مأرب', location: sellerUserForP1?.location, imageUrl: 'https://picsum.photos/seed/laptop/400/300', sellerId: 'user-1', storeId: 'store-1', storeCategory: 'لابتوبات', isNew: false, stock: 1, isFeatured: false, listingEndDate: addDays(today, 30), listingType: 'FIXED_PRICE' },
    { id: 'p2', name: 'طقم كنب جديد فاخر', description: 'طقم كنب مودرن يتسع لـ 7 أشخاص، قماش عالي الجودة وخشب متين. متوفر في المجمع.', price: 250000, category: categories[1], city: 'مأرب', location: sellerUserForP1?.location, imageUrl: 'https://picsum.photos/seed/sofa/400/300', sellerId: 'user-1', storeId: 'store-1', isNew: true, stock: 1, isFeatured: true, listingEndDate: addDays(today, 30), featuredEndDate: addDays(today, 7), listingType: 'FIXED_PRICE' },
    { id: 'p3', name: 'سيارة تويوتا كامري 2018', description: 'سيارة كامري بحالة الوكالة، ماشية 50 ألف كيلو فقط. فل كامل. متواجدة في كرا.', price: 8000000, category: categories[2], city: 'مأرب', location: sellerUserForP1?.location, imageUrl: 'https://picsum.photos/seed/car/400/300', sellerId: 'user-1', storeId: 'store-1', isNew: false, stock: 1, isFeatured: false, listingEndDate: addDays(today, 25), listingType: 'FIXED_PRICE' },
    { id: 'p4', name: 'ساعة يد ذكية مقاومة للماء (للمزاد)', description: 'ساعة ذكية جديدة، تدعم قياس نبضات القلب والرد على المكالمات. المزاد يبدأ الآن!', price: 25000, category: categories[0], city: 'مأرب', location: sellerUserForP1?.location, imageUrl: 'https://picsum.photos/seed/watch/400/300', sellerId: 'user-1', storeId: 'store-1', storeCategory: 'اكسسوارات', isNew: true, stock: 1, isFeatured: true, listingEndDate: addDays(today, 3), featuredEndDate: addDays(today, 3), listingType: 'AUCTION', auctionDetails: { startingPrice: 25000, currentBid: 28000, highestBidderId: 'user-2', endTime: addDays(today, 3), bids: [ { userId: 'user-2', amount: 26000, date: addDays(new Date(), -0.2) }, { userId: 'user-1', amount: 27000, date: addDays(new Date(), -0.1) }, { userId: 'user-2', amount: 28000, date: addDays(new Date(), -0.05) }, ] } },
];

export const mockDeliveriesData: Delivery[] = [
    {
      id: 'del-1',
      productId: 'p1',
      buyerId: 'user-2',
      sellerId: 'user-1',
      status: 'COMPLETED',
      productPrice: 120000,
      deliveryFee: 5000,
      platformFee: 6000,
      totalPrice: 131000,
      deliveryPersonId: 'delivery-1',
      date: '2023-11-09T10:00:00Z',
      pickupCode: 'SM-PICKUP-123',
      dropoffCode: '4321',
      deliveryHistory: [
        { status: 'PENDING', timestamp: '2023-11-08T10:00:00Z' },
        { status: 'READY_FOR_PICKUP', timestamp: '2023-11-08T12:00:00Z' },
        { status: 'IN_TRANSIT', timestamp: '2023-11-09T08:00:00Z' },
        { status: 'DELIVERED', timestamp: '2023-11-09T10:00:00Z' },
        { status: 'COMPLETED', timestamp: '2023-11-10T10:00:00Z' },
      ],
    },
];

export const mockPaymentsData: Payment[] = [
    {
      id: 'pay-1',
      deliveryId: 'del-1',
      amount: 131000,
      method: 'BANK_TRANSFER',
      status: 'RELEASED_TO_SELLER',
      date: '2023-11-08T09:00:00Z',
    },
];

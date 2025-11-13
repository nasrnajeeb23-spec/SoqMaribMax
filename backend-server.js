const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- DATA (Simulates a database) ---
let data = {
    products: [], users: [], productCategories: [], serviceCategories: [],
    deliveries: [], payments: [], reviews: [], ads: [], userRatings: [],
    services: [], bookings: [], serviceReviews: [], posts: [], comments: [],
    offers: [], payouts: [], conversations: [], messages: [], stores: []
};

function initializeData() {
    const addDays = (date, days) => {
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

    data.productCategories = [
        { id: '1', name: 'إلكترونيات', description: 'أجهزة لابتوب، هواتف، اكسسوارات وغيرها' },
        { id: '2', name: 'أثاث منزلي', description: 'كل ما يحتاجه المنزل من أثاث وديكور' },
        { id: '3', name: 'سيارات', description: 'سيارات جديدة ومستعملة للبيع' },
        { id: '4', name: 'ملابس', description: 'ملابس رجالية، نسائية، وأطفال' },
        { id: '5', name: 'عقارات', description: 'شقق، أراضي، محلات تجارية للبيع والإيجار' },
    ];
    data.serviceCategories = [
        { id: 'sc1', name: 'تصميم وجرافيكس', description: 'تصميم شعارات، هويات بصرية، إعلانات' },
        { id: 'sc2', name: 'برمجة وتطوير', description: 'تطوير مواقع، تطبيقات، أنظمة' },
        { id: 'sc3', name: 'صيانة منزلية', description: 'سباكة، كهرباء، تكييف' },
        { id: 'sc4', name: 'استشارات', description: 'استشارات قانونية، مالية، إدارية' },
        { id: 'sc5', name: 'تعليم وتدريب', description: 'دروس تقوية، دورات تدريبية' },
    ];
    data.users = [
        { id: 'user-1', name: 'أحمد علي المأربي', email: 'seller@example.com', role: 'SELLER', storeId: 'store-1', city: 'مأرب', location: generateMaribLocation(), phone: '777111222', joinDate: '2023-01-15T12:00:00Z', verificationStatus: 'VERIFIED', averageRating: 4.8, balance: 50000, isSuspended: false, contactInfo: { whatsapp: '967777111222', facebook: 'https://facebook.com/ahmed.ali' } },
        { id: 'user-2', name: 'فاطمة حسن', email: 'buyer@example.com', role: 'BUYER', city: 'مأرب', location: generateMaribLocation(), phone: '777333444', joinDate: '2023-02-20T10:00:00Z', verificationStatus: 'NOT_VERIFIED', following: ['user-1'], balance: 0, isSuspended: false },
        { id: 'user-3', name: 'خالد صالح', email: 'provider@example.com', role: 'PROVIDER', city: 'مأرب', location: generateMaribLocation(), phone: '777555666', joinDate: '2023-03-10T08:30:00Z', verificationStatus: 'PENDING_VERIFICATION', commercialRegisterUrl: 'https://picsum.photos/seed/register1/800/600', guaranteeUrl: 'https://picsum.photos/seed/guarantee1/800/600', averageRating: 4.5, balance: 120000, isSuspended: false, contactInfo: { whatsapp: '967777555666', instagram: 'https://instagram.com/khaled.saleh' } },
        { id: 'admin-1', name: 'مدير النظام', email: 'admin@example.com', role: 'ADMIN', city: 'مأرب', location: MARIB_CENTER, phone: '777000000', joinDate: '2023-01-01T00:00:00Z', verificationStatus: 'VERIFIED', balance: 0, isSuspended: false },
        { id: 'delivery-1', name: 'علي السريع', email: 'delivery@example.com', role: 'DELIVERY', city: 'مأرب', location: generateMaribLocation(), phone: '777888999', joinDate: '2023-04-05T14:00:00Z', verificationStatus: 'VERIFIED', averageRating: 5.0, balance: 15000, isSuspended: false },
        { id: 'user-google', name: 'مستخدم جوجل', email: 'google_user@example.com', role: 'BUYER', city: 'مأرب', location: generateMaribLocation(), phone: '777999888', joinDate: '2023-05-15T12:00:00Z', verificationStatus: 'NOT_VERIFIED', balance: 0, isSuspended: false},
    ];
    const sellerUserForP1 = data.users.find(u => u.id === 'user-1');
    data.products = [
        { id: 'p1', name: 'لابتوب ديل مستعمل', description: 'لابتوب ديل بحالة ممتازة، مناسب للأعمال والدراسة. معالج Core i5، رام 8 جيجا. موجود في حي الشركة.', price: 120000, category: data.productCategories[0], city: 'مأرب', location: sellerUserForP1?.location, imageUrl: 'https://picsum.photos/seed/laptop/400/300', sellerId: 'user-1', storeId: 'store-1', storeCategory: 'لابتوبات', isNew: false, stock: 1, isFeatured: false, listingEndDate: addDays(today, 30), listingType: 'FIXED_PRICE' },
        { id: 'p2', name: 'طقم كنب جديد فاخر', description: 'طقم كنب مودرن يتسع لـ 7 أشخاص، قماش عالي الجودة وخشب متين. متوفر في المجمع.', price: 250000, category: data.productCategories[1], city: 'مأرب', location: sellerUserForP1?.location, imageUrl: 'https://picsum.photos/seed/sofa/400/300', sellerId: 'user-1', storeId: 'store-1', isNew: true, stock: 1, isFeatured: true, listingEndDate: addDays(today, 30), featuredEndDate: addDays(today, 7), listingType: 'FIXED_PRICE' },
        { id: 'p3', name: 'سيارة تويوتا كامري 2018', description: 'سيارة كامري بحالة الوكالة، ماشية 50 ألف كيلو فقط. فل كامل. متواجدة في كرا.', price: 8000000, category: data.productCategories[2], city: 'مأرب', location: sellerUserForP1?.location, imageUrl: 'https://picsum.photos/seed/car/400/300', sellerId: 'user-1', storeId: 'store-1', isNew: false, stock: 1, isFeatured: false, listingEndDate: addDays(today, 25), listingType: 'FIXED_PRICE' },
        { id: 'p4', name: 'ساعة يد ذكية مقاومة للماء (للمزاد)', description: 'ساعة ذكية جديدة، تدعم قياس نبضات القلب والرد على المكالمات. المزاد يبدأ الآن!', price: 25000, category: data.productCategories[0], city: 'مأرب', location: sellerUserForP1?.location, imageUrl: 'https://picsum.photos/seed/watch/400/300', sellerId: 'user-1', storeId: 'store-1', storeCategory: 'اكسسوارات', isNew: true, stock: 1, isFeatured: true, listingEndDate: addDays(today, 3), featuredEndDate: addDays(today, 3), listingType: 'AUCTION', auctionDetails: { startingPrice: 25000, currentBid: 28000, highestBidderId: 'user-2', endTime: addDays(today, 3), bids: [ { userId: 'user-2', amount: 26000, date: addDays(today, -0.2) }, { userId: 'user-1', amount: 27000, date: addDays(today, -0.1) }, { userId: 'user-2', amount: 28000, date: addDays(today, -0.05) }, ] } },
    ];
    data.reviews = [ { id: 'r1', productId: 'p1', userId: 'user-2', userName: 'فاطمة حسن', rating: 5, comment: 'منتج رائع وحالته ممتازة جداً. أنصح به!', date: '2023-10-25T10:00:00Z' } ];
    data.ads = [ { id: 'ad1', title: 'خدمة التوصيل السريع في سوق مارب!', imageUrl: 'https://picsum.photos/seed/delivery-ad/1200/400', link: '/', type: 'platform', endDate: addDays(today, 365) } ];
    data.userRatings = [ { id: 'ur1', ratedUserId: 'user-1', raterId: 'user-2', deliveryId: 'del-1', rating: 5, comment: 'البائع كان محترماً جداً والسلعة مطابقة للوصف. شكراً جزيلاً!', date: '2023-11-10T10:00:00Z' } ];
    data.services = [ { id: 'svc1', title: 'تصميم شعار احترافي', description: 'أقوم بتصميم شعارات مبتكرة وفريدة من نوعها للشركات والأفراد. أسلم العمل خلال 3 أيام.', category: data.serviceCategories[0], provider: data.users.find(u => u.name === 'خالد صالح'), pricingModel: 'FIXED', price: 15000, city: 'صنعاء', imageUrl: 'https://picsum.photos/seed/logo-design/400/300', availability: 'طوال أيام الأسبوع', averageRating: 4.9, isFeatured: true, featuredEndDate: addDays(today, 5) } ];
    data.bookings = [ { id: 'book1', serviceId: 'svc1', clientId: 'user-2', providerId: 'user-3', bookingDate: new Date().toISOString(), status: 'COMPLETED', totalPrice: 15000, notes: 'أريد شعاراً باللونين الأزرق والفضي.' } ];
    data.serviceReviews = [ { id: 'sr1', serviceId: 'svc1', bookingId: 'book1', reviewerId: 'user-2', rating: 5, comment: 'المصمم محترف جداً وفهم الفكرة من أول مرة. سعيد جداً بالنتيجة!', date: new Date().toISOString() } ];
    data.posts = [ { id: 'post1', authorId: 'user-2', content: 'يا جماعة، أريد أن أشتري لابتوب مستعمل للدراسة، بماذا تنصحوني؟ الميزانية حوالي 100 ألف ريال.', category: { id: 'pc2', name: 'أسئلة واستفسارات', description: 'هل لديك سؤال؟ اطرحه هنا ليجيبك أعضاء المجتمع.' }, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), likes: ['user-1', 'user-3'], commentCount: 2 } ];
    data.comments = [ { id: 'comment1', postId: 'post1', authorId: 'user-1', content: 'أنصحك بلابتوبات ديل، عملية جداً وتتحمل. يمكنك البحث في قسم الإلكترونيات.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() } ];
    data.offers = [ { id: 'offer1', productId: 'p1', buyerId: 'user-2', sellerId: 'user-1', offerPrice: 110000, status: 'PENDING', timestamp: new Date().toISOString(), statusUpdateTimestamp: new Date().toISOString() } ];
    data.payouts = [ { id: 'payout-1', sellerId: 'user-1', amount: 25000, date: new Date().toISOString(), status: 'COMPLETED', accountDetails: 'بنك اليمن الدولي - 123456', processedAt: new Date().toISOString() } ];
    data.messages = [ { id: 'msg1', conversationId: 'conv1', senderId: 'user-2', receiverId: 'user-1', text: 'مرحباً، هل اللابتوب ما زال متوفراً؟', timestamp: new Date().toISOString(), isRead: true } ];
    data.conversations = [ { id: 'conv1', participantIds: ['user-1', 'user-2'] } ];
    data.stores = [ { id: 'store-1', ownerId: 'user-1', name: 'متجر أحمد للإلكترونيات', logoUrl: 'https://picsum.photos/seed/logo1/200/200', bannerUrl: 'https://picsum.photos/seed/banner1/1200/400', description: 'متخصصون في بيع الإلكترونيات الجديدة والمستعملة بأفضل الأسعار.', categories: ['لابتوبات', 'هواتف ذكية', 'اكسسوارات', 'شاشات'] } ];
}
initializeData();


// --- API Endpoints ---
const router = express.Router();

// Generic GET all
const createGetAllEndpoint = (resource) => (req, res) => res.json(data[resource]);
// Generic POST
const createPostEndpoint = (resource) => (req, res) => {
    const newItem = req.body;
    data[resource].push(newItem);
    res.status(201).json(newItem);
};
// Generic PATCH
const createPatchEndpoint = (resource) => (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    let itemFound = null;
    data[resource] = data[resource].map(item => {
        if (item.id === id) {
            itemFound = { ...item, ...updatedData };
            return itemFound;
        }
        return item;
    });
    if (itemFound) res.json(itemFound);
    else res.status(404).json({ message: 'Item not found' });
};
// Generic PUT
const createPutEndpoint = (resource) => (req, res) => {
     const { id } = req.params;
    const updatedData = req.body;
    let itemFound = null;
    data[resource] = data[resource].map(item => {
        if (item.id === id) {
            itemFound = { ...item, ...updatedData };
            return itemFound;
        }
        return item;
    });
    if (itemFound) res.json(itemFound);
    else res.status(404).json({ message: 'Item not found' });
};
// Generic DELETE
const createDeleteEndpoint = (resource) => (req, res) => {
    const { id } = req.params;
    data[resource] = data[resource].filter(item => item.id !== id);
    res.status(204).send();
};

const resources = ['products', 'users', 'stores', 'deliveries', 'payments', 'payouts', 'reviews', 'ratings', 'ads', 'product-categories', 'service-categories', 'posts', 'comments', 'offers', 'services', 'bookings', 'service-reviews', 'conversations', 'messages'];
resources.forEach(resource => {
    const path = `/${resource.replace('-','_')}`;
    const key = resource.replace(/-/g, '').replace(/s$/, '') + 's'; // a bit of magic to match keys in `data` object
    
    // For categories, the key is different
    let dataKey = resource.replace('-', '');
    if (dataKey === 'productcategories') dataKey = 'productCategories';
    if (dataKey === 'servicecategories') dataKey = 'serviceCategories';
    if (dataKey === 'userratings') dataKey = 'userRatings';

    // A more direct mapping
    const keyMap = {
        'product-categories': 'productCategories',
        'service-categories': 'serviceCategories',
        'ratings': 'userRatings'
    };
    
    const finalDataKey = keyMap[resource] || resource;

    router.get(`/${resource}`, createGetAllEndpoint(finalDataKey));
    router.post(`/${resource}`, createPostEndpoint(finalDataKey));
    router.patch(`/${resource}/:id`, createPatchEndpoint(finalDataKey));
    router.put(`/${resource}/:id`, createPutEndpoint(finalDataKey));
    router.delete(`/${resource}/:id`, createDeleteEndpoint(finalDataKey));
});

// Special endpoints
router.post('/login', (req, res) => {
    const { email } = req.body;
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});


app.use('/api', router);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

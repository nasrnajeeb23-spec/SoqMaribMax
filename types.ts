export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN' | 'DELIVERY' | 'PROVIDER';
export type VerificationStatus = 'NOT_VERIFIED' | 'PENDING_VERIFICATION' | 'VERIFIED';

export interface ContactInfo {
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  logoUrl: string;
  bannerUrl: string;
  description: string;
  categories: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string; // New field for sellers
  city: string;
  location?: { lat: number; lng: number; }; 
  phone?: string;
  joinDate: string; 
  verificationStatus: VerificationStatus;
  commercialRegisterUrl?: string;
  guaranteeUrl?: string;
  averageRating?: number;
  following?: string[];
  balance: number;
  isSuspended?: boolean;
  contactInfo?: ContactInfo;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Review { 
  id: string;
  productId: string;
  userId: string;
  userName: string; 
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

// New Auction-related types
export interface Bid {
  userId: string;
  amount: number;
  date: string;
}

export interface AuctionDetails {
  startingPrice: number;
  currentBid: number;
  highestBidderId: string | null;
  endTime: string;
  bids: Bid[];
}

export type ListingType = 'FIXED_PRICE' | 'AUCTION';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  city: string;
  location?: { lat: number; lng: number; };
  imageUrl: string;
  sellerId: string; // Changed from seller: User
  storeId: string; // New
  storeCategory?: string; // New: For categories within a store
  isNew: boolean;
  stock: number;
  isFeatured: boolean;
  listingEndDate?: string;
  featuredEndDate?: string;
  listingType: ListingType;
  auctionDetails?: AuctionDetails;
}

export interface CartItem { 
  productId: string;
  quantity: number;
  customPrice?: number;
}

export type DeliveryStatus = 'PENDING' | 'READY_FOR_PICKUP' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'CANCELED' | 'IN_DISPUTE';

export interface DeliveryHistoryEntry {
  status: DeliveryStatus;
  timestamp: string;
  location?: { lat: number; lng: number; };
}

export interface Delivery {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  status: DeliveryStatus;
  productPrice: number;
  deliveryFee: number;
  platformFee: number;
  totalPrice: number;
  deliveryPersonId?: string;
  date: string;
  current_location?: { lat: number; lng: number; };
  pickupCode: string;
  dropoffCode: string;
  deliveryHistory: DeliveryHistoryEntry[];
}

export interface Notification {
  id: string;
  userId: string; 
  message: string;
  link: string; 
  isRead: boolean;
  date: string;
}

export type PaymentMethod = 'CASH_ON_DELIVERY' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'HELD_IN_ESCROW' | 'RELEASED_TO_SELLER' | 'REFUNDED' | 'FAILED' | 'COMPLETED';

export interface Payment {
  id: string;
  deliveryId?: string; 
  bookingId?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
}

export interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  type: 'platform' | 'user';
  advertiserName?: string;
  endDate: string;
}

export interface UserRating {
  id: string;
  ratedUserId: string;
  raterId: string;
  deliveryId: string;
  rating: number;
  comment: string;
  date: string;
}

// --- NEW: Service Marketplace Types ---
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
}

export type ServicePricingModel = 'HOURLY' | 'FIXED' | 'PER_PROJECT';

export interface Service {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  provider: User;
  pricingModel: ServicePricingModel;
  price: number;
  city: string;
  imageUrl: string;
  availability: string;
  averageRating: number;
  isFeatured?: boolean;
  featuredEndDate?: string;
}

export type ServiceBookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'AWAITING_PAYMENT' | 'IN_PROGRESS' | 'COMPLETED_BY_PROVIDER' | 'COMPLETED' | 'CANCELED';

export interface ServiceBooking {
  id: string;
  serviceId: string;
  clientId: string;
  providerId: string;
  bookingDate: string;
  status: ServiceBookingStatus;
  totalPrice: number;
  notes?: string;
  paymentId?: string;
}

export interface ServiceReview {
  id: string;
  serviceId: string;
  bookingId: string;
  reviewerId: string;
  rating: number;
  comment: string;
  date: string;
}

// --- NEW: Community / Social Feed Types ---
export interface PostCategory {
  id: string;
  name: string;
  description: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  category: PostCategory;
  timestamp: string;
  likes: string[];
  commentCount: number;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  timestamp: string;
}

// --- NEW: Offer/Bargaining Types ---
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTER_OFFERED';

export interface Offer {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  offerPrice: number;
  counterOfferPrice?: number;
  status: OfferStatus;
  timestamp: string;
  statusUpdateTimestamp: string;
}

// --- NEW: Saved Search Type ---
export interface SavedSearch {
  id: string;
  userId: string;
  searchTerm: string;
  categoryId: string | null;
  condition: 'all' | 'new' | 'used';
  timestamp: string;
}

// --- NEW: Static Content Management ---
export interface StaticPageContent {
  title: string;
  body: string;
}

// --- NEW: Payout Management Types ---
export type PayoutStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface PayoutTransaction {
  id: string;
  sellerId: string;
  amount: number;
  date: string;
  status: PayoutStatus;
  accountDetails?: string;
  processedAt?: string;
  rejectionReason?: string;
}

// --- NEW: Platform Settings ---
export interface PlatformSettings {
  commissionRate: number;
  adCost: number;
  standardListingFee: number;
  featuredListingFee: number;
  maintenanceMode: boolean;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    whatsapp: string;
  };
}
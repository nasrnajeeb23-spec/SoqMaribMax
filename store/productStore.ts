import { create } from 'zustand';
import { Product, ListingType } from '../types';
import { realtimeService } from '../api/realtimeService';
import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';
import { useSearchStore } from './searchStore';
import { useSettingsStore } from './settingsStore';
import * as api from '../api';

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetchProducts: () => Promise<void>;
  addProduct: (productData: Omit<Product, 'id' | 'sellerId' | 'storeId' | 'isFeatured' | 'listingEndDate' | 'featuredEndDate' | 'auctionDetails' | 'listingType'>, listingType: 'standard' | 'featured', productListingType: ListingType, auctionEndDate?: string) => Promise<void>;
  updateProduct: (productId: string, productData: Partial<Omit<Product, 'id' | 'sellerId' | 'storeId'>>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  decreaseStock: (productId: string, quantity: number) => Promise<void>;
  promoteProduct: (productId: string, showToast: (message: string, type: 'success' | 'error' | 'info') => void) => Promise<void>;
  placeBid: (productId: string, amount: number, showToast: (message: string, type: 'success' | 'error' | 'info') => void) => Promise<void>;
  initialize: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: true,
  error: null,
  refetchProducts: async () => {
    set({ loading: true, error: null });
    try {
        const products = await api.apiFetchProducts();
        set({ products, loading: false });
    } catch(e) {
        set({ error: (e as Error).message, loading: false });
    }
  },
  addProduct: async (productData, listingType, productListingType, auctionEndDate) => {
    const { user, users: allUsers } = useAuthStore.getState();
    const { addNotification } = useNotificationStore.getState();
    const { allSavedSearches } = useSearchStore.getState();
    
    if (!user || user.role !== 'SELLER' || !user.storeId) {
      console.error("User must be a seller with a store to add products.");
      return;
    }

    const today = new Date();
    const listingEndDate = productListingType === 'AUCTION' ? auctionEndDate : new Date(new Date().setDate(today.getDate() + 30)).toISOString();
    let featuredEndDate: string | undefined = undefined;
    let isFeatured = false;

    if (listingType === 'featured') {
      featuredEndDate = new Date(new Date().setDate(today.getDate() + 7)).toISOString();
      isFeatured = true;
    }

    const newProductData: Omit<Product, 'id'> = {
      sellerId: user.id,
      storeId: user.storeId,
      isFeatured,
      listingType: productListingType,
      listingEndDate,
      featuredEndDate,
      ...productData,
    };
    if (productListingType === 'AUCTION') {
        (newProductData as Product).auctionDetails = {
            startingPrice: newProductData.price, currentBid: newProductData.price, highestBidderId: null,
            endTime: auctionEndDate || new Date().toISOString(), bids: []
        };
    }
    
    const newProduct = await api.apiAddProduct({ id: `p${Date.now()}`, ...newProductData} as Product);
    
    set(state => ({ products: [newProduct, ...state.products] }));

    const adminUser = allUsers.find(u => u.role === 'ADMIN');
    if (adminUser) addNotification({ userId: adminUser.id, message: `تمت إضافة منتج جديد "${newProduct.name}" بواسطة ${user.name}.`, link: '/admin-dashboard' });

    const followers = allUsers.filter(u => u.following?.includes(user.id));
    followers.forEach(follower => addNotification({ userId: follower.id, message: `أضاف بائعك المفضل '${user.name}' منتجاً جديداً: "${newProduct.name}"`, link: `/products/${newProduct.id}` }));

    allSavedSearches.forEach(search => {
      const termMatch = !search.searchTerm || newProduct.name.toLowerCase().includes(search.searchTerm.toLowerCase());
      const categoryMatch = !search.categoryId || newProduct.category.id === search.categoryId;
      const conditionMatch = search.condition === 'all' || (search.condition === 'new' && newProduct.isNew) || (search.condition === 'used' && !newProduct.isNew);
      if (termMatch && categoryMatch && conditionMatch && newProduct.sellerId !== search.userId) {
        addNotification({ userId: search.userId, message: `تمت إضافة منتج جديد يطابق بحثك المحفوظ: "${newProduct.name}"`, link: `/products/${newProduct.id}` });
      }
    });
  },
  updateProduct: async (productId, productData) => {
    const updatedProduct = await api.apiUpdateProduct(productId, productData);
    set(state => ({
      products: state.products.map(p => p.id === productId ? updatedProduct : p)
    }));
  },
  placeBid: async (productId, amount, showToast) => {
    const { user } = useAuthStore.getState();
    const { addNotification } = useNotificationStore.getState();

    if (!user) { showToast('يجب تسجيل الدخول للمزايدة.', 'error'); return; }
    const product = get().products.find(p => p.id === productId);
    if (!product || !product.auctionDetails) return;
    
    if (new Date(product.auctionDetails.endTime) < new Date()) { showToast('انتهى المزاد على هذا المنتج.', 'error'); return; }
    if (amount <= product.auctionDetails.currentBid) { showToast('يجب أن تكون مزايدتك أعلى من السعر الحالي.', 'error'); return; }

    const previousHighestBidderId = product.auctionDetails.highestBidderId;

    const updatedAuctionDetails = {
        ...product.auctionDetails,
        currentBid: amount,
        highestBidderId: user.id,
        bids: [...product.auctionDetails.bids, { userId: user.id, amount, date: new Date().toISOString() }]
    };
    
    const updatedProduct = await api.apiUpdateProduct(productId, { auctionDetails: updatedAuctionDetails });

    if (previousHighestBidderId && previousHighestBidderId !== user.id) {
        addNotification({
            userId: previousHighestBidderId,
            message: `تمت المزايدة بسعر أعلى منك على منتج "${product.name}". السعر الجديد هو ${amount}.`,
            link: `/products/${productId}`
        });
    }

    set(state => ({ products: state.products.map(p => p.id === productId ? updatedProduct : p) }));
    realtimeService.postEvent({ type: 'auction_bid', payload: { productId, product: updatedProduct }});
    showToast('تمت المزايدة بنجاح!', 'success');
  },
  promoteProduct: async (productId, showToast) => {
    const { settings } = useSettingsStore.getState();
    const product = get().products.find(p => p.id === productId);
    if (!product) return;
    const now = new Date();
    const isCurrentlyFeatured = product.isFeatured && product.featuredEndDate && new Date(product.featuredEndDate) > now;
    if (isCurrentlyFeatured) { showToast('المنتج مميز بالفعل.', 'info'); return; }
    const MAX_FEATURED_PRODUCTS = 4;
    const featuredCount = get().products.filter(p => p.isFeatured && p.featuredEndDate && new Date(p.featuredEndDate) > now).length;
    if (featuredCount >= MAX_FEATURED_PRODUCTS) { showToast(`لقد وصلت إلى الحد الأقصى للمنتجات المميزة (${MAX_FEATURED_PRODUCTS}).`, 'error'); return; }
    
    if (window.confirm(`تمييز هذا المنتج سيكلف ${settings.featuredListingFee} ريال يمني لمدة 7 أيام. هل تريد المتابعة؟`)) {
      const today = new Date();
      const featuredEndDate = new Date(today.setDate(today.getDate() + 7)).toISOString();
      await get().updateProduct(productId, { isFeatured: true, featuredEndDate });
      showToast('تم تمييز المنتج بنجاح!', 'success');
    }
  },
  deleteProduct: async (productId) => {
    await api.apiDeleteProduct(productId);
    set(state => ({ products: state.products.filter(p => p.id !== productId) }));
  },
  decreaseStock: async (productId, quantity) => {
    const product = get().products.find(p => p.id === productId);
    if (!product) return;
    const newStock = Math.max(0, product.stock - quantity);
    await get().updateProduct(productId, { stock: newStock });
  },
  initialize: () => {
    get().refetchProducts();
    
    realtimeService.onEvent((event) => {
        if (event.type === 'auction_bid') {
            const { productId, product: updatedProduct } = event.payload;
            set(state => ({
                products: state.products.map(p => p.id === productId ? updatedProduct : p)
            }));
        }
    });
  }
}));

// Initialize the store
useProductStore.getState().initialize();
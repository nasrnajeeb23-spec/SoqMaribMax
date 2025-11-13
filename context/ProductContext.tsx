import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Product, ListingType } from '../types';
import { mockProductsData } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../hooks/useToast';
import { useSearch } from '../hooks/useSearch'; // New
import { realtimeService } from '../api/realtimeService';
import { useSettings } from '../hooks/useSettings'; // New

const MAX_FEATURED_PRODUCTS = 4;

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetchProducts: () => void;
  // FIX: Changed Omit to use sellerId and storeId instead of seller, matching the Product type.
  addProduct: (productData: Omit<Product, 'id' | 'sellerId' | 'storeId' | 'isFeatured' | 'listingEndDate' | 'featuredEndDate' | 'auctionDetails' | 'listingType'>, listingType: 'standard' | 'featured', productListingType: ListingType, auctionEndDate?: string) => void;
  updateProduct: (productId: string, productData: Partial<Omit<Product, 'id' | 'sellerId' | 'storeId'>>) => void;
  deleteProduct: (productId: string) => void;
  decreaseStock: (productId: string, quantity: number) => void;
  promoteProduct: (productId: string) => void;
  placeBid: (productId: string, amount: number) => void;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user, users: allUsers } = useAuth(); 
  const { addNotification } = useNotifications();
  const { showToast } = useToast();
  const { allSavedSearches } = useSearch();
  const { settings } = useSettings();

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    console.log("Fetching products...");
    setTimeout(() => {
      setProducts(mockProductsData);
      setLoading(false);
      console.log("Products fetched successfully.");
    }, 1500);
  }, []);
  
  useEffect(() => {
    realtimeService.onEvent((event) => {
        if (event.type === 'auction_bid') {
            const { productId, product: updatedProduct } = event.payload;
            setProducts(prevProducts =>
                prevProducts.map(p => p.id === productId ? updatedProduct : p)
            );
        }
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = (productData: Omit<Product, 'id' | 'sellerId' | 'storeId' | 'isFeatured' | 'listingEndDate' | 'featuredEndDate' | 'auctionDetails' | 'listingType'>, listingType: 'standard' | 'featured', productListingType: ListingType, auctionEndDate?: string) => {
    if (!user || user.role !== 'SELLER' || !user.storeId) {
      console.error("Only sellers with a store can add products.");
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

    // FIX: Changed `seller: user` to `sellerId: user.id` and added `storeId` to match the Product type.
    const newProduct: Product = {
      id: `p${Date.now()}`,
      sellerId: user.id,
      storeId: user.storeId,
      isFeatured,
      listingType: productListingType,
      listingEndDate,
      featuredEndDate,
      ...productData,
    };
    
    if (productListingType === 'AUCTION') {
        newProduct.auctionDetails = {
            startingPrice: newProduct.price,
            currentBid: newProduct.price,
            highestBidderId: null,
            endTime: auctionEndDate || new Date().toISOString(),
            bids: []
        };
    }
    
    setProducts(prevProducts => [newProduct, ...prevProducts]);

    const adminUser = allUsers.find(u => u.role === 'ADMIN');
    if (adminUser) {
        addNotification({
            userId: adminUser.id,
            message: `تمت إضافة منتج جديد "${newProduct.name}" بواسطة ${user.name}.`,
            link: '/admin-dashboard' 
        });
    }

    // FIX: The seller is the current user. `newProduct` no longer has a `seller` property.
    const seller = user;
    const followers = allUsers.filter(u => u.following?.includes(seller.id));
    followers.forEach(follower => {
      addNotification({
        userId: follower.id,
        message: `أضاف بائعك المفضل '${seller.name}' منتجاً جديداً: "${newProduct.name}"`,
        link: `/products/${newProduct.id}`
      });
    });

    // New: Notify users with matching saved searches
    allSavedSearches.forEach(search => {
      const termMatch = !search.searchTerm || newProduct.name.toLowerCase().includes(search.searchTerm.toLowerCase());
      const categoryMatch = !search.categoryId || newProduct.category.id === search.categoryId;
      const conditionMatch = search.condition === 'all' || (search.condition === 'new' && newProduct.isNew) || (search.condition === 'used' && !newProduct.isNew);
      // FIX: Use `sellerId` from `newProduct` instead of `seller.id`.
      const isNotOwnProduct = newProduct.sellerId !== search.userId;

      if (termMatch && categoryMatch && conditionMatch && isNotOwnProduct) {
        addNotification({
          userId: search.userId,
          message: `تمت إضافة منتج جديد يطابق بحثك المحفوظ: "${newProduct.name}"`,
          link: `/products/${newProduct.id}`
        });
      }
    });

  };

  const updateProduct = (productId: string, productData: Partial<Omit<Product, 'id' | 'sellerId' | 'storeId'>>) => {
     const updatedProducts = products.map(p =>
        p.id === productId ? { ...p, ...productData } as Product : p
      );
     setProducts(updatedProducts);
  };
  
  const placeBid = (productId: string, amount: number) => {
    if (!user) {
        showToast('يجب تسجيل الدخول للمزايدة.', 'error');
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product || !product.auctionDetails) return;
    
    if (new Date(product.auctionDetails.endTime) < new Date()) {
        showToast('انتهى المزاد على هذا المنتج.', 'error');
        return;
    }
    
    if (amount <= product.auctionDetails.currentBid) {
        showToast('يجب أن تكون مزايدتك أعلى من السعر الحالي.', 'error');
        return;
    }

    const previousHighestBidderId = product.auctionDetails.highestBidderId;

    const updatedProduct = {
        ...product,
        auctionDetails: {
            ...product.auctionDetails,
            currentBid: amount,
            highestBidderId: user.id,
            bids: [...product.auctionDetails.bids, { userId: user.id, amount, date: new Date().toISOString() }]
        }
    };
    
    if (previousHighestBidderId && previousHighestBidderId !== user.id) {
        addNotification({
            userId: previousHighestBidderId,
            message: `تمت المزايدة بسعر أعلى منك على منتج "${product.name}". السعر الجديد هو ${amount}.`,
            link: `/products/${productId}`
        });
    }

    updateProduct(productId, updatedProduct);
    realtimeService.postEvent({ type: 'auction_bid', payload: { productId, product: updatedProduct }});
    showToast('تمت المزايدة بنجاح!', 'success');
  };
  
  const promoteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const now = new Date();
    const isCurrentlyFeatured = product.isFeatured && product.featuredEndDate && new Date(product.featuredEndDate) > now;

    if (isCurrentlyFeatured) {
        showToast('المنتج مميز بالفعل.', 'info');
        return;
    }

    const featuredCount = products.filter(p => p.isFeatured && p.featuredEndDate && new Date(p.featuredEndDate) > now).length;
    
    if (featuredCount >= MAX_FEATURED_PRODUCTS) {
        showToast(`لقد وصلت إلى الحد الأقصى للمنتجات المميزة (${MAX_FEATURED_PRODUCTS}).`, 'error');
        return;
    }
    
    if (window.confirm(`تمييز هذا المنتج سيكلف ${settings.featuredListingFee} ريال يمني لمدة 7 أيام. هل تريد المتابعة؟`)) {
      const today = new Date();
      const featuredEndDate = new Date(today.setDate(today.getDate() + 7)).toISOString();

      updateProduct(productId, { isFeatured: true, featuredEndDate });
      showToast('تم تمييز المنتج بنجاح!', 'success');
    }
  };

  const deleteProduct = (productId: string) => {
    setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
  };

  const decreaseStock = (productId: string, quantity: number) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock - quantity) } : p
      )
    );
  };

  return (
    <ProductContext.Provider value={{ products, loading, error, refetchProducts: fetchProducts, addProduct, updateProduct, deleteProduct, decreaseStock, promoteProduct, placeBid }}>
      {children}
    </ProductContext.Provider>
  );
};

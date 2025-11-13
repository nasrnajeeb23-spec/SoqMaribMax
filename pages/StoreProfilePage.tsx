import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { useRating } from '../hooks/useRating';
import { useToast } from '../hooks/useToast';
import ProductList from '../components/product/ProductList';
import StarRating from '../components/common/StarRating';
import { useStoreStore } from '../store/storeStore';
import PageLoader from '../components/common/PageLoader';

const StoreProfilePage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  
  const { products } = useProducts();
  const { users, user: currentUser, followSeller, unfollowSeller } = useAuth();
  const { getRatingsForUser } = useRating();
  const { showToast } = useToast();
  const { stores, getStoreById } = useStoreStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const store = useMemo(() => storeId ? getStoreById(storeId) : undefined, [storeId, getStoreById]);
  const seller = useMemo(() => store ? users.find(u => u.id === store.ownerId) : undefined, [store, users]);
  
  const storeProducts = useMemo(() => {
      if (!store) return [];
      let filtered = products.filter(p => p.storeId === store.id);
      if (selectedCategory) {
          filtered = filtered.filter(p => p.storeCategory === selectedCategory);
      }
      return filtered;
  }, [store, products, selectedCategory]);

  const { averageRating, ratings } = useMemo(() => {
    if (!seller) return { averageRating: 0, ratings: [] };
    const sellerRatings = getRatingsForUser(seller.id);
    const avgRating = sellerRatings.length > 0 ? sellerRatings.reduce((sum, r) => sum + r.rating, 0) / sellerRatings.length : 0;
    return { averageRating: avgRating, ratings: sellerRatings };
  }, [seller, getRatingsForUser]);

  if (!store || !seller) {
    return <PageLoader />;
  }

  const isFollowing = currentUser?.following?.includes(seller.id) ?? false;

  const handleFollowToggle = () => {
    if (isFollowing) {
      unfollowSeller(seller.id);
      showToast(`تم إلغاء متابعة ${seller.name}.`, 'info');
    } else {
      followSeller(seller.id);
      showToast(`أنت تتابع الآن ${seller.name}!`, 'success');
    }
  };

  const canInteract = currentUser && currentUser.id !== seller.id;
  const canFollow = canInteract && currentUser.role === 'BUYER';

  return (
    <div className="space-y-8">
      {/* Store Header */}
      <div className="bg-[var(--color-surface)] rounded-xl shadow-lg overflow-hidden border border-transparent dark:border-[var(--color-border)]">
        <div className="h-48 md:h-64 bg-gray-200">
            <img src={store.bannerUrl} alt={`${store.name} banner`} className="w-full h-full object-cover"/>
        </div>
        <div className="p-4 md:p-6 -mt-16 md:-mt-20">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
                 <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[var(--color-surface)] bg-gray-300 flex-shrink-0">
                    <img src={store.logoUrl} alt={`${store.name} logo`} className="w-full h-full object-cover rounded-full"/>
                 </div>
                 <div className="flex-grow text-center md:text-right">
                    <h1 className="text-2xl md:text-4xl font-bold text-[var(--color-text-base)]">{store.name}</h1>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">بإدارة: {seller.name}</p>
                    <div className="flex items-center justify-center md:justify-start mt-2 gap-2">
                        <StarRating rating={averageRating} readOnly size="sm" />
                        <span className="text-xs text-[var(--color-text-muted)]">({ratings.length} تقييمات)</span>
                    </div>
                 </div>
                 <div className="flex-shrink-0 mt-4 md:mt-0">
                    {canFollow && (
                       <button onClick={handleFollowToggle} className={`font-bold py-2 px-6 rounded-lg transition-colors duration-300 text-sm ${isFollowing ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-teal-500 text-white hover:bg-teal-600'}`}>
                         {isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
                       </button>
                    )}
                 </div>
            </div>
            <p className="mt-4 text-center md:text-right text-[var(--color-text-muted)] max-w-2xl">{store.description}</p>
        </div>
      </div>
      
      {/* Main Content */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
            {/* Categories Sidebar */}
            <aside className="md:col-span-1 bg-[var(--color-surface)] p-4 rounded-lg shadow-md h-fit sticky top-24 border border-transparent dark:border-[var(--color-border)]">
                <h2 className="text-lg font-bold mb-4">أقسام المتجر</h2>
                <ul className="space-y-1">
                    <li><button onClick={() => setSelectedCategory(null)} className={`w-full text-right p-2 rounded-md font-semibold text-sm transition-colors ${!selectedCategory ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'hover:bg-[var(--color-background)]'}`}>كل المنتجات</button></li>
                    {store.categories.map(cat => (
                        <li key={cat}><button onClick={() => setSelectedCategory(cat)}  className={`w-full text-right p-2 rounded-md font-semibold text-sm transition-colors ${selectedCategory === cat ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'hover:bg-[var(--color-background)]'}`}>{cat}</button></li>
                    ))}
                </ul>
            </aside>
            
            {/* Products */}
            <main className="md:col-span-3">
                 <h2 className="text-2xl font-bold text-center md:text-right mb-6">منتجات متجر {store.name}</h2>
                {storeProducts.length > 0 ? (
                  <ProductList products={storeProducts} />
                ) : (
                  <div className="text-center text-[var(--color-text-muted)] bg-[var(--color-surface)] p-10 rounded-lg shadow-md border border-transparent dark:border-[var(--color-border)]">
                    <p className="text-lg">لا توجد منتجات في هذا القسم حالياً.</p>
                  </div>
                )}
            </main>
       </div>
    </div>
  );
};

export default StoreProfilePage;
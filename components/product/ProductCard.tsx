import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';
import { useComparison } from '../../hooks/useComparison';
import { useAuthPrompt } from '../../hooks/useAuthPrompt';

interface ProductCardProps {
  product: Product;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { user } = useAuth();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { comparisonItems, toggleComparison } = useComparison();
  const prompt = useAuthPrompt();

  const isWishlisted = wishlistItems.includes(product.id);
  const isInCompare = comparisonItems.includes(product.id);
  const isAuction = product.listingType === 'AUCTION';
  const displayPrice = isAuction ? product.auctionDetails?.currentBid : product.price;

  const handleWishlistToggleAction = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      showToast('تمت الإزالة من المفضلة.', 'info');
    } else {
      addToWishlist(product.id);
      showToast('تمت الإضافة إلى المفضلة!', 'success');
    }
  };

  const handleCompareToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleComparison(product.id, showToast);
  };

  const handleAddToCartAction = () => {
    if (product.stock > 0) {
      addToCart(product.id);
      showToast(`تمت إضافة "${product.name}" إلى السلة!`, 'success');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: 'YER',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const promptedWishlistToggle = prompt(handleWishlistToggleAction, `أنشئ حساباً لحفظ "${product.name}" في قائمتك المفضلة!`);
  const promptedAddToCart = prompt(handleAddToCartAction, 'سجل دخولك أو أنشئ حساباً جديداً لإضافة المنتجات إلى السلة!');

  return (
    <motion.div 
      className="bg-[var(--color-surface)] rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out group flex flex-col relative border border-transparent dark:border-[var(--color-border)]"
      style={{ boxShadow: 'var(--shadow-md)' }}
      variants={itemVariants}
      whileHover={{ y: -5, boxShadow: 'var(--shadow-lg)' }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {product.isFeatured && (
        <div className="absolute top-0 right-0 bg-[var(--color-accent)] text-white text-xs font-bold px-3 py-1 rounded-tr-xl rounded-bl-xl z-10">
          مميز
        </div>
      )}
      <div className="relative">
        <Link to={`/products/${product.id}`} className="block">
          <div className="aspect-[4/3] overflow-hidden">
            <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={product.imageUrl} alt={product.name} />
          </div>
          <div className="absolute top-3 left-3 flex flex-col gap-2">
              <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${product.isNew ? 'bg-green-500/80' : 'bg-blue-500/80'}`}>
                {product.isNew ? 'جديد' : 'مستعمل'}
              </span>
              {isAuction && (
                <span className="px-2 py-1 text-xs font-bold text-white rounded-full bg-purple-600/80">
                    مزاد
                </span>
              )}
          </div>
           {product.stock === 0 && !isAuction && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="text-white text-lg font-bold">نفدت الكمية</span>
            </div>
          )}
        </Link>
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={promptedWishlistToggle} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full p-2 text-gray-600 dark:text-slate-300 hover:text-red-500 transition-colors" aria-label="إضافة للمفضلة">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: isWishlisted ? '#ef4444' : 'currentColor' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z" />
            </svg>
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleCompareToggle} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full p-2 text-gray-600 dark:text-slate-300 hover:text-[var(--color-primary)] transition-colors" aria-label="إضافة للمقارنة">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isInCompare ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: isInCompare ? 'var(--color-primary)' : 'currentColor' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </motion.button>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
          <p className="text-sm text-[var(--color-text-muted)]">{product.category.name}</p>
          <h3 className="text-lg font-bold text-[var(--color-text-base)] group-hover:text-[var(--color-primary)] transition-colors duration-300 mt-1 h-14">
             <Link to={`/products/${product.id}`} className="block">{product.name}</Link>
          </h3>
          <div className="flex-grow"></div>
          <div className="flex items-center justify-between mt-4">
              <div>
                 {isAuction && <span className="text-xs text-[var(--color-text-muted)] block">السعر الحالي</span>}
                 <p className="text-2xl font-extrabold text-[var(--color-primary)]">{formatPrice(displayPrice || 0)}</p>
              </div>
              <div className="flex items-center text-sm text-[var(--color-text-muted)]">
              <svg className="w-4 h-4 ml-1 " fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
              <span>{product.city}</span>
              </div>
          </div>
           <div className="mt-4">
            {isAuction ? (
            <Link 
                to={`/products/${product.id}`} 
                className="w-full text-center block bg-purple-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-300"
            >
                ادخل المزاد
            </Link>
            ) : product.sellerId !== user?.id ? (
            <button 
                onClick={promptedAddToCart}
                disabled={product.stock === 0}
                className="w-full text-center block bg-[var(--color-primary)] text-white font-bold py-2.5 px-4 rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {product.stock > 0 ? 'أضف إلى السلة' : 'نفدت الكمية'}
            </button>
            ) : (
            <Link 
                to={`/products/${product.id}`} 
                className="w-full text-center block bg-slate-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300"
            >
                عرض التفاصيل
            </Link>
            )}
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(ProductCard);
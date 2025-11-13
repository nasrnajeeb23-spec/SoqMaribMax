import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { useProducts } from '../hooks/useProducts';
import ProductList from '../components/product/ProductList';

const WishlistPage: React.FC = () => {
  const { wishlistItems } = useWishlist();
  const { products } = useProducts();

  const favoriteProducts = products.filter(product => wishlistItems.includes(product.id));

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
        قائمة المفضلة
      </h1>

      {favoriteProducts.length > 0 ? (
        <ProductList products={favoriteProducts} />
      ) : (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">قائمة المفضلة فارغة</h3>
          <p className="mt-1 text-sm text-gray-500">
            يمكنك إضافة المنتجات التي تعجبك بالضغط على أيقونة القلب.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
            >
              تصفح المنتجات
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
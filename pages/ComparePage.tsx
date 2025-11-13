

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useComparison } from '../hooks/useComparison';
import { useProducts } from '../hooks/useProducts';
import StarRating from '../components/common/StarRating';
import { Product } from '../types';
// FIX: Import useAuth to get user details
import { useAuth } from '../hooks/useAuth';

interface CompareAttributeProps {
    label: string;
    value: React.ReactNode;
    isBest?: boolean;
}

const CompareAttribute: React.FC<CompareAttributeProps> = ({ label, value, isBest }) => (
    <div className={`flex justify-between items-center p-3 border-b last:border-b-0 ${isBest ? 'bg-green-50' : 'bg-white'}`}>
        <dt className="font-medium text-gray-600">{label}</dt>
        <dd className="text-gray-800 text-left">{value}</dd>
    </div>
);


const ComparePage: React.FC = () => {
  const { comparisonItems, clearComparison, toggleComparison } = useComparison();
  const { products } = useProducts();
  // FIX: Get all users to look up seller information.
  const { users } = useAuth();

  const itemsToCompare = products.filter(p => comparisonItems.includes(p.id));

  const bestValues = useMemo(() => {
    if (itemsToCompare.length < 2) return {};
    
    const prices = itemsToCompare.map(p => p.listingType === 'AUCTION' ? p.auctionDetails!.currentBid : p.price);
    // FIX: Get seller rating by finding the seller in the users list via sellerId.
    const sellerRatings = itemsToCompare.map(p => (users.find(u => u.id === p.sellerId)?.averageRating || 0));

    return {
      price: Math.min(...prices),
      sellerRating: Math.max(...sellerRatings),
    };
  }, [itemsToCompare, users]);

  const formatPrice = (price: number) => new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER', minimumFractionDigits: 0 }).format(price);

  if (itemsToCompare.length === 0) {
    return (
      <div className="text-center py-20 bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold">قائمة المقارنة فارغة!</h2>
        <p className="text-gray-500 mt-2">أضف بعض المنتجات للمقارنة بينها.</p>
        <Link to="/" className="text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] font-bold py-2 px-6 rounded-md mt-6 inline-block">
          العودة للتسوق
        </Link>
      </div>
    );
  }

  const attributes = [
    { key: 'name', label: 'الاسم' },
    { key: 'price', label: 'السعر' },
    { key: 'isNew', label: 'الحالة' },
    { key: 'category', label: 'التصنيف' },
    { key: 'city', label: 'المدينة' },
    { key: 'seller', label: 'البائع' },
    { key: 'sellerRating', label: 'تقييم البائع' },
  ];
  
  const getAttributeValue = (item: Product, attrKey: string) => {
        // FIX: Find the seller from the users list using sellerId.
        const seller = users.find(u => u.id === item.sellerId);

        switch (attrKey) {
            case 'name': return <Link to={`/products/${item.id}`} className="font-semibold text-[var(--color-primary)] hover:underline">{item.name}</Link>;
            case 'price':
                const price = item.listingType === 'AUCTION' ? item.auctionDetails!.currentBid : item.price;
                return formatPrice(price);
            case 'isNew': return <span className={`px-2 py-1 text-xs font-bold text-white rounded-md ${item.isNew ? 'bg-green-500' : 'bg-blue-500'}`}>{item.isNew ? 'جديد' : 'مستعمل'}</span>;
            case 'category': return item.category.name;
            case 'city': return item.city;
            // FIX: Use the found seller object.
            case 'seller': return seller ? <Link to={`/sellers/${seller.id}`} className="hover:underline">{seller.name}</Link> : '-';
            case 'sellerRating':
                // FIX: Use the found seller object.
                const rating = seller?.averageRating || 0;
                return <div className="flex flex-col items-end"><StarRating rating={rating} readOnly size="sm" /><span className="text-xs text-gray-500">({rating.toFixed(1)})</span></div>;
            default: return '-';
        }
  };
  
  const isBestValue = (item: Product, attrKey: string): boolean => {
      if (itemsToCompare.length < 2) return false;
       switch (attrKey) {
            case 'price':
                const price = item.listingType === 'AUCTION' ? item.auctionDetails!.currentBid : item.price;
                return price === bestValues.price;
            case 'sellerRating':
                // FIX: Find the seller to get their rating for comparison.
                const seller = users.find(u => u.id === item.sellerId);
                return (seller?.averageRating || 0) === bestValues.sellerRating;
            default: return false;
       }
  };

  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">مقارنة المنتجات ({itemsToCompare.length})</h1>
        <button onClick={clearComparison} className="text-sm text-red-600 hover:underline">مسح الكل</button>
      </div>
      
      {/* Mobile View */}
      <div className="md:hidden space-y-6">
        {itemsToCompare.map(item => (
            <div key={item.id} className="border rounded-lg overflow-hidden">
                <div className="p-3 bg-gray-50 border-b relative">
                     <Link to={`/products/${item.id}`}>
                        <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover rounded-md mx-auto mb-2" />
                     </Link>
                     <button onClick={() => toggleComparison(item.id)} className="absolute top-2 left-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold">&times;</button>
                </div>
                 <dl>
                    {attributes.map(attr => (
                         <CompareAttribute 
                            key={attr.key}
                            label={attr.label}
                            value={getAttributeValue(item, attr.key)}
                            isBest={isBestValue(item, attr.key)}
                        />
                    ))}
                </dl>
            </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border-collapse text-center">
          <thead>
            <tr>
              <th className="sticky right-0 bg-white p-4 border-b border-l font-semibold w-40">الخاصية</th>
              {itemsToCompare.map(item => (
                <th key={item.id} className="p-4 border-b relative">
                  <Link to={`/products/${item.id}`}>
                    <img src={item.imageUrl} alt={item.name} className="w-32 h-32 object-cover rounded-md mx-auto mb-2" />
                  </Link>
                  <button onClick={() => toggleComparison(item.id)} className="absolute top-2 left-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold hover:bg-red-600">&times;</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attributes.map(attr => (
              <tr key={attr.key}>
                <td className="sticky right-0 bg-white p-4 border-b border-l font-medium text-gray-700">{attr.label}</td>
                {itemsToCompare.map(item => (
                  <td key={item.id} className={`p-4 border-b ${isBestValue(item, attr.key) ? 'bg-green-50' : ''}`}>
                    {getAttributeValue(item, attr.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;

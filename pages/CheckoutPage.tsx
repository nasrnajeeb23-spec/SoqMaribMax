import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { Store } from '../types';
import { useSettings } from '../hooks/useSettings'; 
import { useStoreStore } from '../store/storeStore';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { cartItems } = useCart();
  const { settings } = useSettings();
  const { getStoreById } = useStoreStore();
  
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }
  
  const cartProductDetails = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId && p.listingType === 'FIXED_PRICE');
    if (product) {
      return { ...item, product }; // Combine cart item (with customPrice) and product details
    }
    return null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);


  const groupedByStore = useMemo(() => {
    return cartProductDetails.reduce((acc, item) => {
        const storeId = item.product.storeId;
        if (!acc[storeId]) {
            const store = getStoreById(storeId);
            if (store) {
                acc[storeId] = {
                    store: store,
                    items: [],
                    subtotal: 0,
                };
            }
        }
        if (acc[storeId]) {
            const price = item.customPrice ?? item.product.price;
            acc[storeId].items.push(item);
            acc[storeId].subtotal += price * item.quantity;
        }
        return acc;
    }, {} as Record<string, { store: Store; items: typeof cartProductDetails; subtotal: number }>);
  }, [cartProductDetails, getStoreById]);

  const storeGroups = Object.values(groupedByStore);

  const subtotal = cartProductDetails.reduce((sum, item) => {
    const price = item.customPrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const deliveryFee = 1500; // Mock delivery fee for the whole order (Reduced for local delivery)
  const platformFee = subtotal * settings.commissionRate; // 5% platform fee on subtotal
  const total = subtotal + deliveryFee + platformFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: 'YER',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">مراجعة الطلب</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">السلع المطلوبة ({cartProductDetails.length})</h2>
          {storeGroups.map(({ store, items, subtotal: storeSubtotal }) => (
            <div key={store.id} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50/50">
                <h3 className="font-bold mb-3 text-gray-700">
                    طلب من متجر: <Link to={`/stores/${store.id}`} className="text-[var(--color-primary)] hover:underline">{store.name}</Link>
                </h3>
                <div className="space-y-3">
                    {items.map(item => {
                      const price = item.customPrice ?? item.product.price;
                      return (
                        <div key={item.productId} className="flex items-start space-x-4 space-x-reverse border-b pb-3 last:border-b-0 last:pb-0">
                            <img src={item.product.imageUrl} alt={item.product.name} className="w-16 h-16 object-cover rounded-md" />
                            <div className="flex-1">
                                <h3 className="font-semibold">{item.product.name}</h3>
                                <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                                <p className={`text-md font-bold mt-1 ${item.customPrice ? 'text-green-600' : 'text-[var(--color-primary)]'}`}>{formatPrice(price * item.quantity)}</p>
                                {item.customPrice && <span className="text-xs bg-green-100 text-green-800 font-medium px-2 py-0.5 rounded">سعر العرض</span>}
                            </div>
                        </div>
                      )
                    })}
                </div>
                <div className="text-left font-semibold mt-3 text-gray-600">
                    مجموع المتجر: {formatPrice(storeSubtotal)}
                </div>
            </div>
        ))}

        </div>

        <div className="bg-white p-6 rounded-lg shadow-md h-fit sticky top-24">
          <h2 className="text-xl font-bold text-gray-800 mb-4">ملخص التكاليف</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600"><span>مجموع أسعار السلع</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-gray-600"><span>رسوم المنصة ({settings.commissionRate * 100}%)</span><span className="font-medium">{formatPrice(platformFee)}</span></div>
            <div className="flex justify-between text-gray-600"><span>رسوم التوصيل</span><span className="font-medium">{formatPrice(deliveryFee)}</span></div>
            <div className="border-t border-gray-200 my-3"></div>
            <div className="flex justify-between text-gray-900 font-bold text-xl"><span>المبلغ الإجمالي</span><span>{formatPrice(total)}</span></div>
          </div>
          <div className="mt-6">
            <Link to="/payment" className="w-full block text-center bg-[var(--color-primary)] text-white font-bold py-3 px-6 rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors duration-300 text-lg">
              المتابعة إلى الدفع
            </Link>
            <p className="text-center text-xs text-gray-500 mt-2">بالضغط على الزر، أنت توافق على شروط الخدمة.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
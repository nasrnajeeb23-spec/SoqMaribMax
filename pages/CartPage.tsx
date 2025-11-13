import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { products } = useProducts();
  const { users } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const cartProductDetails = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    // Only include non-auction items in the cart display
    if (product && product.listingType === 'FIXED_PRICE') {
      const seller = users.find(u => u.id === product.sellerId);
      return { ...item, product, seller }; // Combine cart item (with customPrice) and product details
    }
    return null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  const subtotal = cartProductDetails.reduce((sum, item) => {
      const price = item.customPrice ?? item.product.price;
      return sum + price * item.quantity;
  }, 0);

  const deliveryFee = 5000; // Mock, can be made more complex
  const total = subtotal + deliveryFee;

  const handleUpdateQuantity = (productId: string, newQuantity: number, stock: number) => {
      if (newQuantity > stock) {
          showToast(`لا يمكن طلب أكثر من الكمية المتوفرة (${stock})`, 'error');
          return;
      }
      updateQuantity(productId, newQuantity);
  };
  
  const handleCheckout = () => {
      if (cartProductDetails.length === 0) {
          showToast('سلة المشتريات فارغة!', 'error');
          return;
      }
      navigate('/checkout');
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">سلة المشتريات</h1>

      {cartProductDetails.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartProductDetails.map(item => (
              <div key={item.productId} className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm">
                <img src={item.product.imageUrl} alt={item.product.name} className="w-20 h-20 object-cover rounded-md" />
                <div className="flex-grow mx-4">
                  <Link to={`/products/${item.productId}`} className="font-semibold text-gray-800 hover:text-sky-600">{item.product.name}</Link>
                  <p className="text-sm text-gray-500">البائع: {item.seller?.name}</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-md font-bold ${item.customPrice ? 'text-green-600' : 'text-sky-600'}`}>{formatPrice(item.customPrice ?? item.product.price)}</p>
                    {item.customPrice && <p className="text-sm text-gray-500 line-through">{formatPrice(item.product.price)}</p>}
                  </div>
                   {item.customPrice && <span className="text-xs bg-green-100 text-green-800 font-medium px-2 py-0.5 rounded">سعر العرض</span>}
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                   <input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value), item.product.stock ?? 0)}
                      min="1"
                      max={item.product.stock}
                      className="w-16 p-1 border rounded-md text-center"
                      aria-label="الكمية"
                   />
                   <button onClick={() => removeFromCart(item.productId)} className="text-gray-500 hover:text-red-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                   </button>
                </div>
              </div>
            ))}
             <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 text-sm">
                <p>ملاحظة: المنتجات المعروضة في المزاد لا يمكن إضافتها إلى السلة ويجب الفوز بها عبر المزايدة.</p>
             </div>
          </div>

          <div className="bg-sky-50 p-6 rounded-lg shadow-inner h-fit sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">ملخص الطلب</h2>
            <div className="space-y-3">
              <div className="flex justify-between"><span>المجموع الفرعي</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span>رسوم التوصيل (تقريبي)</span><span>{formatPrice(deliveryFee)}</span></div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between text-xl font-bold"><span>الإجمالي</span><span>{formatPrice(total)}</span></div>
            </div>
            <button onClick={handleCheckout} className="mt-6 w-full bg-sky-600 text-white font-bold py-3 rounded-md hover:bg-sky-700 transition-colors">
              المتابعة إلى الدفع
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">سلة مشترياتك فارغة</h3>
          <p className="mt-1 text-sm text-gray-500">أضف بعض المنتجات لتبدأ التسوق.</p>
          <div className="mt-6">
            <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700">
              تصفح المنتجات
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
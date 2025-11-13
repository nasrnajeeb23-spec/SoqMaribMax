import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useDeliveries } from '../hooks/useDeliveries';
import { usePayments } from '../hooks/usePayments';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { PaymentMethod, User } from '../types';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/common/Spinner';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, decreaseStock } = useProducts();
  const { addDelivery } = useDeliveries();
  const { addPayment } = usePayments();
  const { cartItems, clearCart } = useCart();
  const { showToast } = useToast();
  const { user, users } = useAuth();
  const { addNotification } = useNotifications();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [isProcessing, setIsProcessing] = useState(false);

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const cartProductDetails = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    const seller = product ? users.find(u => u.id === product.sellerId) : undefined;
    return { ...item, product, seller };
  }).filter(item => item.product && item.seller);

  const subtotal = cartProductDetails.reduce((sum, item) => sum + ((item.customPrice ?? item.product!.price) * item.quantity), 0);
  const deliveryFee = 5000;
  const platformFee = subtotal * 0.05;
  const total = subtotal + deliveryFee + platformFee;

  const handleConfirmPayment = () => {
    if(!user) return;
    
    setIsProcessing(true);

    // Simulate payment processing delay
    setTimeout(() => {
        let firstDeliveryId = '';
        
        cartProductDetails.forEach((item, index) => {
          const newDelivery = addDelivery(item.product!.id, item.product!.sellerId, (item.customPrice ?? item.product!.price) * item.quantity);
          
          if (newDelivery) {
            if (index === 0) {
              firstDeliveryId = newDelivery.id;
            }
            addPayment({
              deliveryId: newDelivery.id,
              amount: newDelivery.totalPrice,
              method: paymentMethod,
            });
            decreaseStock(item.product!.id, item.quantity);
          }
        });

        if (firstDeliveryId) {
          addNotification({
              userId: user.id,
              message: `تم استلام طلبك بنجاح وهو قيد المراجعة من قبل البائعين.`,
              link: `/buyer-dashboard`
          });

          clearCart();
          showToast('تم إتمام عملية الشراء بنجاح! أموالك في أمان مع نظام الضمان.', 'success');
          navigate(`/order-confirmation/${firstDeliveryId}`);
        } else {
          showToast('حدث خطأ أثناء إنشاء طلبات التوصيل.', 'error');
        }
        setIsProcessing(false);
    }, 2500);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="max-w-2xl mx-auto bg-[var(--color-surface)] p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-extrabold text-[var(--color-text-base)] mb-2 text-center">إتمام عملية الشراء</h1>
      <p className="text-center text-[var(--color-text-muted)] mb-8">الخطوة الأخيرة لتأكيد طلبك.</p>
      
      <div className="bg-green-500/10 p-4 rounded-lg mb-6 border border-green-500/20 text-center">
        <h3 className="font-bold text-green-800 dark:text-green-300">🔒 أنت محمي بنظام الضمان المالي</h3>
        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
            سيتم حجز المبلغ لدينا ولن يتم تحويله للبائع إلا بعد تأكيدك استلام المنتج.
        </p>
      </div>

      <div className="bg-[var(--color-background)] p-6 rounded-lg mb-6 border border-[var(--color-border)]">
        <h2 className="text-xl font-bold text-[var(--color-text-base)] mb-4">ملخص الطلب</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-[var(--color-text-muted)]"><span>المبلغ الإجمالي:</span><span className="font-bold text-2xl text-[var(--color-primary)]">{formatPrice(total)}</span></div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-base)] mb-4">اختر طريقة الدفع</h2>
         <div className="space-y-3">
            <div className="p-4 border rounded-lg border-[var(--color-border)]">
                <label className="flex items-center cursor-pointer">
                    <input type="radio" name="paymentMethod" value="BANK_TRANSFER" checked={true} readOnly className="form-radio text-[var(--color-primary)]"/>
                    <span className="mr-3 font-medium">بطاقة ائتمانية / دفع إلكتروني (محاكاة)</span>
                </label>
                <div className="mt-4 space-y-3 p-4 bg-[var(--color-background)] rounded-md">
                    <div>
                        <label className="text-sm font-medium text-[var(--color-text-muted)]">رقم البطاقة</label>
                        <input type="text" placeholder=".... .... .... ...." className="w-full mt-1 p-2 border rounded-md" defaultValue="4242 4242 4242 4242" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-[var(--color-text-muted)]">تاريخ الانتهاء</label>
                            <input type="text" placeholder="MM / YY" className="w-full mt-1 p-2 border rounded-md" defaultValue="12 / 25" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-[var(--color-text-muted)]">CVV</label>
                            <input type="text" placeholder="123" className="w-full mt-1 p-2 border rounded-md" defaultValue="123" />
                        </div>
                     </div>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-8">
        <button 
            onClick={handleConfirmPayment} 
            disabled={isProcessing}
            className="w-full flex justify-center items-center bg-[var(--color-primary)] text-white font-bold py-3 px-6 rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors duration-300 text-lg disabled:bg-sky-400 disabled:cursor-wait"
        >
          {isProcessing ? <><Spinner size="md" className="ml-3" /> جاري معالجة الدفع...</> : `تأكيد ودفع ${formatPrice(total)}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
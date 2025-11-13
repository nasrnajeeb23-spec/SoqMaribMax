import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDeliveries } from '../hooks/useDeliveries';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { usePayments } from '../hooks/usePayments';
import { PaymentMethod, PaymentStatus } from '../types';

const InvoicePage: React.FC = () => {
    const { deliveryId } = useParams<{ deliveryId: string }>();
    const navigate = useNavigate();
    const { deliveries } = useDeliveries();
    const { products } = useProducts();
    const { users } = useAuth();
    const { payments } = usePayments();

    const delivery = deliveries.find(d => d.id === deliveryId);
    const payment = payments.find(p => p.deliveryId === deliveryId);
    const product = delivery ? products.find(p => p.id === delivery.productId) : undefined;
    const buyer = delivery ? users.find(u => u.id === delivery.buyerId) : undefined;
    const seller = delivery ? users.find(u => u.id === delivery.sellerId) : undefined;

    const handlePrint = () => {
        window.print();
    };

    if (!delivery || !product || !buyer || !seller) {
        return (
            <div className="text-center py-20 bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold">عذراً، الفاتورة غير موجودة!</h2>
                <p className="text-gray-500 mt-2">قد يكون الطلب غير مكتمل أو أنك لا تملك صلاحية الوصول.</p>
                <button onClick={() => navigate(-1)} className="text-white bg-sky-600 hover:bg-sky-700 font-bold py-2 px-6 rounded-md mt-6 inline-block">
                    العودة
                </button>
            </div>
        );
    }
    
    const paymentMethodTranslations: { [key in PaymentMethod]: string } = {
        CASH_ON_DELIVERY: 'الدفع عند الاستلام',
        BANK_TRANSFER: 'حوالة بنكية'
    };

    // FIX: Added missing properties to match the PaymentStatus type.
    const paymentStatusTranslations: { [key in PaymentStatus]: string } = {
        PENDING: 'قيد الانتظار',
        HELD_IN_ESCROW: 'محجوز بالضمان',
        RELEASED_TO_SELLER: 'تم تحويله للبائع',
        REFUNDED: 'معاد للمشتري',
        COMPLETED: 'مكتمل',
        FAILED: 'فشل'
    };
    
    const formatPrice = (price: number) => new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER', minimumFractionDigits: 0 }).format(price);

    return (
        <div>
            <div className="flex justify-between items-center mb-6 no-print">
                <h1 className="text-2xl font-bold">تفاصيل الفاتورة</h1>
                <div>
                     <button onClick={() => navigate(-1)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors ml-3">
                        العودة
                    </button>
                    <button onClick={handlePrint} className="bg-sky-600 text-white font-bold py-2 px-4 rounded-md hover:bg-sky-700 transition-colors">
                        طباعة / تنزيل PDF
                    </button>
                </div>
            </div>

            <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg border border-gray-200 invoice-container">
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-sky-600">سوق مارب</h1>
                        <p className="text-gray-500">منصة السوق المفتوح</p>
                    </div>
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-gray-800">فاتورة شراء</h2>
                        <p className="text-gray-500 mt-1">رقم الفاتورة: <span className="font-mono">{delivery.id}</span></p>
                        <p className="text-gray-500">تاريخ الإصدار: {new Date(delivery.date).toLocaleDateString('ar-EG')}</p>
                    </div>
                </div>

                {/* Seller & Buyer Info */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold text-gray-600 mb-2">فاتورة من (البائع):</h3>
                        <p className="font-semibold text-gray-800">{seller.name}</p>
                        <p className="text-gray-500">{seller.city}</p>
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-600 mb-2">فاتورة إلى (المشتري):</h3>
                        <p className="font-semibold text-gray-800">{buyer.name}</p>
                        <p className="text-gray-500">{buyer.city}</p>
                    </div>
                </div>
                
                {/* Items Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-right border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 font-semibold text-sm text-gray-600 uppercase">المنتج</th>
                                <th className="py-3 px-4 font-semibold text-sm text-gray-600 uppercase">الكمية</th>
                                <th className="py-3 px-4 font-semibold text-sm text-gray-600 uppercase">سعر الوحدة</th>
                                <th className="py-3 px-4 font-semibold text-sm text-gray-600 uppercase text-left">الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            <tr className="border-b">
                                <td className="py-3 px-4">{product.name}</td>
                                <td className="py-3 px-4">1</td>
                                <td className="py-3 px-4">{formatPrice(delivery.productPrice)}</td>
                                <td className="py-3 px-4 text-left">{formatPrice(delivery.productPrice)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mt-8">
                    <div className="w-full max-w-sm space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600">المجموع الفرعي:</span>
                            <span className="font-semibold">{formatPrice(delivery.productPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">رسوم المنصة:</span>
                            <span className="font-semibold">{formatPrice(delivery.platformFee)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-gray-600">رسوم التوصيل:</span>
                            <span className="font-semibold">{formatPrice(delivery.deliveryFee)}</span>
                        </div>
                        <div className="border-t my-2"></div>
                        <div className="flex justify-between text-xl font-bold text-sky-600">
                            <span>المبلغ الإجمالي:</span>
                            <span>{formatPrice(delivery.totalPrice)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Info & Footer */}
                <div className="mt-12 pt-6 border-t text-sm text-gray-500">
                     {payment && (
                        <div className="mb-4">
                            <p><strong>طريقة الدفع:</strong> {paymentMethodTranslations[payment.method]}</p>
                            <p><strong>حالة الدفع:</strong> <span className="font-semibold text-green-600">{paymentStatusTranslations[payment.status]}</span></p>
                        </div>
                    )}
                    <p className="text-center">شكراً لتسوقكم عبر منصة سوق مارب!</p>
                </div>
            </div>
        </div>
    );
};

export default InvoicePage;

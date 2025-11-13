import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const OrderConfirmationPage: React.FC = () => {
    const { deliveryId } = useParams<{ deliveryId: string }>();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center"
        >
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">شكراً لك!</h1>
                <p className="text-lg text-gray-600 mt-2">لقد تم استلام طلبك بنجاح.</p>
                <div className="mt-6 bg-gray-50 p-4 rounded-md border">
                    <p className="text-sm text-gray-500">الرقم المرجعي لطلبك هو:</p>
                    <p className="text-lg font-bold text-gray-800 font-mono tracking-wider">{deliveryId}</p>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                    ستصلك إشعارات عند تحديث حالة الطلب. يمكنك متابعة طلباتك من خلال لوحة التحكم.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        to={`/invoice/${deliveryId}`}
                        target="_blank"
                        className="bg-sky-600 text-white font-bold py-3 px-6 rounded-md hover:bg-sky-700 transition-colors"
                    >
                        عرض الفاتورة
                    </Link>
                     <Link
                        to="/buyer-dashboard"
                        className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        الذهاب إلى لوحة التحكم
                    </Link>
                </div>
                 <Link to="/" className="text-sm text-gray-500 hover:text-sky-600 mt-6 inline-block">
                    &larr; العودة إلى الصفحة الرئيسية
                </Link>
            </div>
        </motion.div>
    );
};

export default OrderConfirmationPage;

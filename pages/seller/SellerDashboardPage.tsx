import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useProducts } from '../../hooks/useProducts';
import { useDeliveries } from '../../hooks/useDeliveries';
import { useOffers } from '../../hooks/useOffers';
import { OfferStatus, Offer, Product, Delivery } from '../../types';
import SellerAnalyticsTab from '../../components/seller/SellerAnalyticsTab';
import SellerDeliveriesTab from '../../components/seller/SellerDeliveriesTab';
import FinancialsTab from '../../components/seller/tabs/FinancialsTab';
import { useStoreStore } from '../../store/storeStore';

type Tab = 'analytics' | 'products' | 'deliveries' | 'offers' | 'financials';

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER', minimumFractionDigits: 0 }).format(price);
};

// --- Sub-components for each tab ---

const ProductsTab: React.FC<{
    products: Product[];
    onPromote: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ products, onPromote, onDelete }) => {
    if (products.length === 0) {
        return (
            <div className="text-center py-10 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                <p className="text-[var(--color-text-muted)] text-lg">لم تقم بإضافة أي سلع بعد.</p>
                <Link to="/seller-dashboard/add" className="mt-4 inline-block bg-[var(--color-primary)] text-white font-bold py-2 px-5 rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
                    إضافة سلعتك الأولى
                </Link>
            </div>
        );
    }
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-transparent divide-y divide-[var(--color-border)] responsive-table">
                <thead className="bg-gray-50 dark:bg-slate-900/50">
                    <tr>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">المنتج</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">الحالة</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">تاريخ الانتهاء</th>
                        <th className="py-3 px-4 text-center font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">مميز</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="text-[var(--color-text-base)] divide-y divide-[var(--color-border)] md:divide-y-0">
                    {products.map(product => {
                        const now = new Date();
                        const listingEndDate = product.listingEndDate ? new Date(product.listingEndDate) : null;
                        const featuredEndDate = product.featuredEndDate ? new Date(product.featuredEndDate) : null;
                        let statusText = 'غير معروف', statusColor = 'bg-gray-200 text-gray-800', isExpired = false;
                        if (listingEndDate && listingEndDate < now) {
                            statusText = 'منتهي الصلاحية'; statusColor = 'bg-red-200 text-red-800'; isExpired = true;
                        } else if (listingEndDate) {
                            statusText = 'نشط'; statusColor = 'bg-green-200 text-green-800';
                        }
                        const isCurrentlyFeatured = product.isFeatured && featuredEndDate && featuredEndDate > now;

                        return (
                            <tr key={product.id} className="hover:bg-[var(--color-background)]">
                                <td data-label="المنتج" className="py-4 px-4 flex items-center">
                                    <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md ml-4" />
                                    <div>
                                        <p className="font-semibold">{product.name}</p>
                                        <p className="text-sm text-[var(--color-text-muted)]">{product.category.name} - {formatPrice(product.price)}</p>
                                    </div>
                                </td>
                                <td data-label="الحالة" className="py-4 px-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{statusText}</span></td>
                                <td data-label="تاريخ الانتهاء" className="py-4 px-4 text-sm text-[var(--color-text-muted)]">{listingEndDate?.toLocaleDateString('ar-EG')}</td>
                                <td data-label="مميز" className="py-4 px-4 text-center">
                                    {isCurrentlyFeatured && (
                                        <div className="flex flex-col items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--color-accent)]" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            <span className="text-xs text-[var(--color-text-muted)]">ينتهي {featuredEndDate?.toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    )}
                                </td>
                                <td data-label="إجراءات" className="py-4 px-4">
                                    <div className="flex items-center space-x-2 space-x-reverse">
                                        {!isExpired && !isCurrentlyFeatured && <button onClick={() => onPromote(product.id)} className="text-white text-sm font-bold py-1 px-3 rounded-md transition bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]">تمييز</button>}
                                        <Link to={`/seller-dashboard/edit/${product.id}`} className="bg-blue-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-blue-600 transition">تعديل</Link>
                                        <button onClick={() => onDelete(product.id)} className="bg-red-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-red-600 transition">حذف</button>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

const OffersTab: React.FC<{
    offers: Offer[];
    onStatusUpdate: (id: string, status: OfferStatus, price?: number) => void;
    onCounterOffer: (state: { offerId: string; value: string } | null) => void;
    products: Product[];
    users: any[];
}> = ({ offers, onStatusUpdate, onCounterOffer, products, users }) => {
    const offerStatusColors: { [key in OfferStatus]: string } = { PENDING: 'bg-yellow-200 text-yellow-800', ACCEPTED: 'bg-green-200 text-green-800', REJECTED: 'bg-red-200 text-red-800', COUNTER_OFFERED: 'bg-blue-200 text-blue-800' };
    const offerStatusTranslations: { [key in OfferStatus]: string } = { PENDING: 'معلّق', ACCEPTED: 'مقبول', REJECTED: 'مرفوض', COUNTER_OFFERED: 'عرض مضاد' };
    if(offers.length === 0) return <div className="text-center py-10 border-2 border-dashed border-[var(--color-border)] rounded-lg"><p className="text-[var(--color-text-muted)] text-lg">لا توجد لديك أي عروض واردة.</p></div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-transparent divide-y divide-[var(--color-border)] responsive-table">
                <thead className="bg-gray-50 dark:bg-slate-900/50">
                    <tr>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">المنتج</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">المشتري</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">الأسعار</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">الحالة</th>
                        <th className="py-3 px-4 text-right font-semibold text-sm text-[var(--color-text-muted)] uppercase tracking-wider">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="text-[var(--color-text-base)] divide-y divide-[var(--color-border)] md:divide-y-0">
                    {offers.map(offer => {
                        const product = products.find(p => p.id === offer.productId);
                        const buyer = users.find(u => u.id === offer.buyerId);
                        return (
                        <tr key={offer.id} className="hover:bg-[var(--color-background)]">
                            <td data-label="المنتج" className="py-4 px-4">{product?.name || 'منتج محذوف'}</td>
                            <td data-label="المشتري" className="py-4 px-4">{buyer?.name || 'مشتري غير معروف'}</td>
                            <td data-label="الأسعار" className="py-4 px-4">
                                <p className="text-xs text-[var(--color-text-muted)]">الأصلي: {formatPrice(product?.price || 0)}</p>
                                <p className="font-semibold">المعروض: {formatPrice(offer.offerPrice)}</p>
                            </td>
                            <td data-label="الحالة" className="py-4 px-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${offerStatusColors[offer.status]}`}>{offerStatusTranslations[offer.status]}</span></td>
                            <td data-label="إجراءات" className="py-4 px-4">
                                {offer.status === 'PENDING' && (
                                    <div className="flex gap-2 flex-wrap">
                                        <button onClick={() => onStatusUpdate(offer.id, 'ACCEPTED')} className="bg-green-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-green-600">قبول</button>
                                        <button onClick={() => onStatusUpdate(offer.id, 'REJECTED')} className="bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-red-600">رفض</button>
                                        <button onClick={() => onCounterOffer({ offerId: offer.id, value: ''})} className="bg-blue-500 text-white text-xs font-bold py-1 px-2 rounded-md hover:bg-blue-600">عرض مضاد</button>
                                    </div>
                                )}
                            </td>
                        </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

// ... other tab components will follow similar structure

const VerificationStatusCard = () => {
    const { user } = useAuth();
    if (!user || user.role !== 'SELLER') return null;
    switch (user.verificationStatus) {
        case 'VERIFIED': return <div className="bg-green-500/10 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 rounded-lg flex items-center gap-4"><svg className="w-8 h-8 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg><div><h3 className="font-bold">حسابك موثوق</h3><p className="text-sm">يمكن للمشترين الآن رؤية شارة "بائع موثوق" على ملفك الشخصي ومنتجاتك.</p></div></div>;
        case 'PENDING_VERIFICATION': return <div className="bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded-lg flex items-center gap-4"><svg className="w-8 h-8 text-yellow-500 flex-shrink-0 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><div><h3 className="font-bold">طلب التوثيق قيد المراجعة</h3><p className="text-sm">لقد استلمنا طلبك ومستنداتك، وسيقوم فريقنا بمراجعتها في أقرب وقت.</p></div></div>;
        default: return <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-lg flex flex-col sm:flex-row items-center gap-4 text-blue-700 dark:text-blue-300"><svg className="w-8 h-8 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><div className="flex-grow text-center sm:text-right"><h3 className="font-bold">وثّق حسابك وزد من ثقة عملائك!</h3><p className="text-sm">قدم طلب التوثيق الآن لتحصل على شارة "بائع موثوق" وتزيد من مبيعاتك.</p></div><Link to="/seller-dashboard/verification" className="bg-blue-500 text-white font-bold py-2 px-5 rounded-md hover:bg-blue-600 transition-colors w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0 no-underline">قدم طلب الآن</Link></div>;
    }
};

const SellerDashboardPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('analytics');
    const { user, users } = useAuth();
    const { products, deleteProduct, promoteProduct } = useProducts();
    const { deliveries } = useDeliveries();
    const { getOffersForSeller, updateOfferStatus } = useOffers();
    const [counterOffer, setCounterOffer] = useState<{ offerId: string; value: string } | null>(null);

    const hasStore = useMemo(() => !!user?.storeId, [user]);

    const memoizedData = useMemo(() => {
        if (!user) return { sellerProducts: [], sellerDeliveries: [], sellerOffers: [] };
        return {
            sellerProducts: products.filter(p => p.sellerId === user.id),
            sellerDeliveries: deliveries.filter(d => d.sellerId === user.id),
            sellerOffers: getOffersForSeller(user.id),
        };
    }, [user, products, deliveries, getOffersForSeller]);

    const { sellerProducts, sellerDeliveries, sellerOffers } = memoizedData;

    const handleDeleteProduct = (productId: string) => {
        if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟')) deleteProduct(productId);
    };

    const handleCounterOfferSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(counterOffer) {
            const price = parseFloat(counterOffer.value);
            if(!isNaN(price) && price > 0) {
                updateOfferStatus(counterOffer.offerId, 'COUNTER_OFFERED', undefined, price);
                setCounterOffer(null);
            }
        }
    };
    
    const renderTabContent = () => {
        if (!hasStore) {
            return (
                <div className="text-center py-10 border-2 border-dashed border-[var(--color-border)] rounded-lg">
                    <h2 className="text-xl font-bold">الخطوة الأولى: أنشئ متجرك!</h2>
                    <p className="text-[var(--color-text-muted)] text-lg mt-2">يجب عليك إنشاء متجر أولاً لتتمكن من إضافة سلعك وعرضها للبيع.</p>
                    <Link to="/seller-dashboard/create-store" className="mt-4 inline-block bg-[var(--color-primary)] text-white font-bold py-2 px-5 rounded-md hover:bg-[var(--color-primary-hover)] transition-colors">
                        إنشاء متجر الآن
                    </Link>
                </div>
            );
        }

        switch(activeTab) {
            case 'analytics': return <SellerAnalyticsTab />;
            case 'products': return <ProductsTab products={sellerProducts} onPromote={() => {}} onDelete={handleDeleteProduct} />;
            case 'deliveries': return <SellerDeliveriesTab deliveries={sellerDeliveries} />;
            case 'offers': return <OffersTab offers={sellerOffers} onStatusUpdate={()=>{}} onCounterOffer={setCounterOffer} products={products} users={users} />;
            case 'financials': return <FinancialsTab />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-[var(--color-text-base)]">لوحة تحكم البائع</h1>
                {hasStore && <Link to="/seller-dashboard/add" className="bg-[var(--color-primary)] text-white font-bold py-2 px-4 rounded-md hover:bg-[var(--color-primary-hover)] transition-colors duration-300 text-center">+ أضف سلعة</Link>}
            </div>
            <VerificationStatusCard />
            <div className="bg-[var(--color-surface)] p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-transparent dark:border-[var(--color-border)]">
                <div className="border-b border-[var(--color-border)]">
                    <nav className="-mb-px flex space-x-6 space-x-reverse overflow-x-auto" aria-label="Tabs">
                        <button onClick={() => setActiveTab('analytics')} className={`${activeTab === 'analytics' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>التحليلات</button>
                        <button onClick={() => setActiveTab('financials')} className={`${activeTab === 'financials' ? 'border-green-500 text-green-600' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>الأموال</button>
                        <button onClick={() => setActiveTab('products')} className={`${activeTab === 'products' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>سلعي ({sellerProducts.length})</button>
                        <button onClick={() => setActiveTab('deliveries')} className={`${activeTab === 'deliveries' ? 'border-green-500 text-green-600' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>طلباتي ({sellerDeliveries.length})</button>
                        <button onClick={() => setActiveTab('offers')} className={`${activeTab === 'offers' ? 'border-orange-500 text-orange-600' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-base)] hover:border-gray-300 dark:hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>العروض الواردة ({sellerOffers.length})</button>
                    </nav>
                </div>
                <div className="mt-6">
                    {renderTabContent()}
                </div>
            </div>
            {counterOffer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <form onSubmit={handleCounterOfferSubmit} className="bg-[var(--color-surface)] rounded-lg shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">تقديم عرض مضاد</h3>
                        <p className="text-sm text-[var(--color-text-muted)] mb-2">أدخل السعر الجديد الذي تقترحه على المشتري.</p>
                        <input type="number" value={counterOffer.value} onChange={(e) => setCounterOffer({ ...counterOffer, value: e.target.value })} className="w-full p-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md" placeholder="السعر الجديد" required />
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setCounterOffer(null)} className="bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200 font-bold py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500">إلغاء</button>
                            <button type="submit" className="bg-[var(--color-primary)] text-white font-bold py-2 px-4 rounded-md hover:bg-[var(--color-primary-hover)]">إرسال</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SellerDashboardPage;
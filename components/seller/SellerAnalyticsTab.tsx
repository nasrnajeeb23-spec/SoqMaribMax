import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { useDeliveries } from '../../hooks/useDeliveries';
import { useProducts } from '../../hooks/useProducts';
import SellerStatCard from './SellerStatCard';
import { Product } from '../../types';

const SellerAnalyticsTab: React.FC = () => {
    const { user } = useAuth();
    const { deliveries } = useDeliveries();
    const { products } = useProducts();

    const analyticsData = useMemo(() => {
        if (!user) return null;

        const sellerProducts = products.filter(p => p.sellerId === user.id);
        const sellerCompletedDeliveries = deliveries.filter(
            d => d.sellerId === user.id && d.status === 'COMPLETED'
        );

        const totalSalesValue = sellerCompletedDeliveries.reduce((sum, d) => sum + d.productPrice, 0);
        const productsSoldCount = sellerCompletedDeliveries.length;

        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d;
        }).reverse();

        const dailySalesData = last7Days.map(day => {
            const dayString = day.toISOString().split('T')[0];
            const sales = sellerCompletedDeliveries
                .filter(d => d.date.startsWith(dayString))
                .reduce((sum, d) => sum + d.productPrice, 0);
            return {
                name: day.toLocaleDateString('ar-EG', { weekday: 'short' }),
                'المبيعات': sales,
            };
        });

        const productSales = sellerCompletedDeliveries.reduce<Record<string, number>>((acc, delivery) => {
            acc[delivery.productId] = (acc[delivery.productId] || 0) + 1;
            return acc;
        }, {});
        
        const topSellingProducts = Object.entries(productSales)
            // FIX: Explicitly cast to number to allow sorting, as TypeScript's inference for Object.entries might be too loose.
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .slice(0, 5)
            .map(([productId, count]) => {
                const product = products.find(p => p.id === productId);
                return { product, count };
            }).filter(item => item.product);

        const productPerformance = sellerProducts.map(product => {
            const sales = sellerCompletedDeliveries.filter(d => d.productId === product.id);
            const revenue = sales.reduce((sum, d) => sum + d.productPrice, 0);
            return {
                ...product,
                salesCount: sales.length,
                revenue,
            };
        }).sort((a,b) => b.revenue - a.revenue);

        return {
            totalSalesValue,
            productsSoldCount,
            dailySalesData,
            topSellingProducts,
            productPerformance
        };
    }, [user, deliveries, products]);

    const formatPrice = (price: number) => new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER', minimumFractionDigits: 0 }).format(price);

    if (!user || !analyticsData) {
        return <p className="text-center text-[var(--color-text-muted)]">جاري تحميل بيانات التحليلات...</p>;
    }

    const { totalSalesValue, productsSoldCount, dailySalesData, topSellingProducts, productPerformance } = analyticsData;

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <SellerStatCard title="إجمالي الأرباح" value={formatPrice(user.balance)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <SellerStatCard title="قيمة المبيعات" value={formatPrice(totalSalesValue)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
                <SellerStatCard title="المنتجات المباعة" value={String(productsSoldCount)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} />
                <SellerStatCard title="متوسط التقييم" value={user.averageRating?.toFixed(1) || 'N/A'} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">المبيعات (آخر 7 أيام)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailySalesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `${value / 1000} ألف`} />
                            <Tooltip formatter={(value: number) => formatPrice(value)} />
                            <Legend />
                            <Bar dataKey="المبيعات" fill="#0284c7" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">المنتجات الأكثر مبيعاً</h3>
                    {topSellingProducts.length > 0 ? (
                        <ul className="space-y-3">
                            {topSellingProducts.map(({ product, count }) => (
                                <li key={product!.id} className="flex items-center justify-between text-sm">
                                    <span className="truncate font-medium">{product!.name}</span>
                                    <span className="font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">{count} مبيعات</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 pt-10">لا توجد بيانات مبيعات كافية.</p>
                    )}
                </div>
            </div>

            {/* Product Performance Table */}
            <div>
                 <h2 className="text-xl font-semibold text-gray-700 mb-4">أداء المنتجات</h2>
                <div className="overflow-x-auto bg-white p-4 rounded-lg shadow-md border">
                    <table className="min-w-full responsive-table">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-gray-600 uppercase">المنتج</th>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-gray-600 uppercase">السعر</th>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-gray-600 uppercase">المخزون</th>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-gray-600 uppercase">عدد المبيعات</th>
                                <th className="py-3 px-4 text-right font-semibold text-sm text-gray-600 uppercase">الإيرادات</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 divide-y md:divide-y-0">
                            {productPerformance.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td data-label="المنتج" className="py-3 px-4 font-medium">{item.name}</td>
                                    <td data-label="السعر" className="py-3 px-4">{formatPrice(item.price)}</td>
                                    <td data-label="المخزون" className="py-3 px-4">{item.stock > 0 ? item.stock : <span className="text-red-500 font-semibold">نفدت</span>}</td>
                                    <td data-label="عدد المبيعات" className="py-3 px-4 font-semibold">{item.salesCount}</td>
                                    <td data-label="الإيرادات" className="py-3 px-4 font-bold text-green-600">{formatPrice(item.revenue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SellerAnalyticsTab;

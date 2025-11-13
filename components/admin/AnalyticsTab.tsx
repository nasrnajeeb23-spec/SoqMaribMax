import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { User, Product, Delivery, UserRole, Service, Payment } from '../../types';
import { usePayments } from '../../hooks/usePayments';
import { useServices } from '../../hooks/useServices';
import StatCard from './StatCard';

interface AnalyticsTabProps {
  users: User[];
  products: Product[];
  deliveries: Delivery[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ users, products, deliveries }) => {
  const { payments } = usePayments();
  const { services } = useServices();
  const totalRevenue = deliveries.reduce((acc, delivery) => acc + delivery.platformFee, 0);
  const totalUsers = users.length;
  const totalProducts = products.length;
  const totalDeliveries = deliveries.length;
  
  const escrowedFunds = payments.filter(p => p.status === 'HELD_IN_ESCROW').reduce((sum, p) => sum + p.amount, 0);
  const releasedToSellers = payments.filter(p => p.status === 'RELEASED_TO_SELLER').reduce((sum, p) => sum + p.amount, 0);


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER', minimumFractionDigits: 0 }).format(price);
  };

  // --- Chart Data Processing ---

  // 1. Daily Revenue for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  const dailyRevenue = last7Days.map(day => {
    const dayString = day.toISOString().split('T')[0];
    const revenue = deliveries
      .filter(d => d.date.startsWith(dayString))
      .reduce((sum, d) => sum + d.platformFee, 0);
    return {
      name: day.toLocaleDateString('ar-EG', { weekday: 'short' }),
      revenue: revenue,
    };
  });

  // 2. User Role Distribution
  const userRoleDistribution = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<UserRole, number>);

  // FIX: Added 'PROVIDER' to roleTranslations to match UserRole type.
  const roleTranslations: { [key in UserRole]: string } = {
    ADMIN: 'مسؤول',
    SELLER: 'بائع',
    BUYER: 'مشتري',
    DELIVERY: 'مندوب',
    PROVIDER: 'مقدم خدمة',
  };

  const pieData = Object.entries(userRoleDistribution).map(([role, count]) => ({
    name: roleTranslations[role as UserRole],
    value: count,
  }));
  
  const PIE_COLORS: Record<UserRole, string> = {
    BUYER: '#10B981', // Emerald
    SELLER: '#3B82F6', // Blue
    DELIVERY: '#8B5CF6', // Violet
    ADMIN: '#EF4444', // Red
    PROVIDER: '#14B8A6', // Teal
  };
  const pieChartColors = Object.keys(userRoleDistribution).map(role => PIE_COLORS[role as UserRole]);

  const escapeCSV = (str: string | number | undefined) => {
      if (str === undefined || str === null) return '""';
      const s = String(str);
      if (s.includes('"') || s.includes(',') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`;
      }
      return `"${s}"`;
  };

  const downloadCSV = (csvString: string, filename: string) => {
      const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleExportCSV = (data: any[], headers: string[], filename: string) => {
      const csvRows = [headers.map(escapeCSV).join(',')];
      data.forEach(item => {
          const row = headers.map(header => escapeCSV(item[header.toLowerCase().replace(/\s/g, '')])).join(',');
          csvRows.push(row);
      });
      downloadCSV(csvRows.join('\n'), filename);
  };
  
  const handleExportUsers = () => handleExportCSV(users.map(u => ({...u, role: roleTranslations[u.role]})), ['id', 'name', 'email', 'role', 'city', 'joinDate'], 'users');
  const handleExportProducts = () => handleExportCSV(products.map(p => ({...p, seller: p.seller.name, category: p.category.name})), ['id', 'name', 'price', 'seller', 'category', 'city'], 'products');
  const handleExportServices = () => handleExportCSV(services.map(s => ({...s, provider: s.provider.name, category: s.category.name})), ['id', 'title', 'price', 'provider', 'category', 'city'], 'services');
  const handleExportDeliveries = () => handleExportCSV(deliveries.map(d => ({...d, buyer: users.find(u=>u.id===d.buyerId)?.name, seller: users.find(u=>u.id===d.sellerId)?.name, product: products.find(p=>p.id===d.productId)?.name })), ['id', 'product', 'buyer', 'seller', 'totalPrice', 'status', 'date'], 'deliveries');
  const handleExportPayments = () => handleExportCSV(payments, ['id', 'deliveryId', 'amount', 'method', 'status', 'date'], 'payments');


  return (
    <div className="printable-area">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">نظرة عامة على أداء المنصة</h2>
        <div className="flex gap-2 no-print flex-wrap justify-end">
            <button onClick={handleExportUsers} className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm">تصدير المستخدمين</button>
            <button onClick={handleExportProducts} className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm">تصدير السلع</button>
            <button onClick={handleExportServices} className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm">تصدير الخدمات</button>
            <button onClick={handleExportDeliveries} className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm">تصدير الطلبات</button>
            <button onClick={handleExportPayments} className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm">تصدير المدفوعات</button>
            <button onClick={() => window.print()} className="bg-[var(--color-primary)] text-white font-bold py-2 px-4 rounded-md hover:bg-[var(--color-primary-hover)] transition-colors text-sm">طباعة</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard title="إجمالي أرباح المنصة" value={formatPrice(totalRevenue)} />
        <StatCard title="أموال محجوزة بالضمان" value={formatPrice(escrowedFunds)} />
        <StatCard title="أموال تم تحويلها" value={formatPrice(releasedToSellers)} />
        <StatCard title="إجمالي المستخدمين" value={totalUsers.toString()} />
        <StatCard title="إجمالي السلع" value={totalProducts.toString()} />
        <StatCard title="إجمالي الطلبات" value={totalDeliveries.toString()} />
      </div>
       {/* Chart section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
           <h3 className="text-xl font-semibold text-gray-700 mb-4">أرباح آخر 7 أيام</h3>
           <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyRevenue} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatPrice(value as number)} />
                    <Tooltip formatter={(value) => formatPrice(value as number)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#0284c7" name="الأرباح" />
                </BarChart>
            </ResponsiveContainer>
        </div>
         <div className="bg-white p-6 rounded-lg shadow-md">
           <h3 className="text-xl font-semibold text-gray-700 mb-4">توزيع المستخدمين</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieChartColors[index % pieChartColors.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;

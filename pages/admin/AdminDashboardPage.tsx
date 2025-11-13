import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProducts } from '../../hooks/useProducts';
import { useDeliveries } from '../../hooks/useDeliveries';
import { usePayments } from '../../hooks/usePayments';
import { useServices } from '../../hooks/useServices';
import { useCommunity } from '../../hooks/useCommunity';
import { useCategories } from '../../hooks/useCategories';
import { useContent } from '../../hooks/useContent';
import { Delivery, UserRole, DeliveryStatus, PaymentMethod, PaymentStatus, VerificationStatus } from '../../types';
import AnalyticsTab from '../../components/admin/AnalyticsTab';
import FinancialManagementTab from '../../components/admin/FinancialManagementTab';
import SettingsTab from '../../components/admin/SettingsTab';
import UsersTab from '../../components/admin/tabs/UsersTab';
import ProductsTab from '../../components/admin/tabs/ProductsTab';
import ServicesTab from '../../components/admin/tabs/ServicesTab';
import CommunityTab from '../../components/admin/tabs/CommunityTab';
import DeliveriesTab from '../../components/admin/tabs/DeliveriesTab';
import PaymentsTab from '../../components/admin/tabs/PaymentsTab';
import DisputesTab from '../../components/admin/tabs/DisputesTab';
import CategoriesTab from '../../components/admin/tabs/CategoriesTab';
import CommunicationTab from '../../components/admin/tabs/CommunicationTab';
import ContentManagementTab from '../../components/admin/tabs/ContentManagementTab';
import FeaturedContentTab from '../../components/admin/tabs/FeaturedContentTab';
import LiveMonitoringMapTab from '../../components/admin/tabs/LiveMonitoringMapTab';
import { useToast } from '../../hooks/useToast';
import { useNotifications } from '../../hooks/useNotifications';

type Tab = 'stats' | 'users' | 'products' | 'services' | 'community' | 'deliveries' | 'payments' | 'disputes' | 'categories' | 'communication' | 'content' | 'featured' | 'financial' | 'settings' | 'live';

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const { user: adminUser, users, deleteUser, approveVerification, revokeVerification, suspendUser, unsuspendUser } = useAuth();
  const { products, deleteProduct, updateProduct } = useProducts();
  const { deliveries, updateDeliveryStatus } = useDeliveries();
  const { payments, releasePaymentToSeller, refundPaymentToBuyer } = usePayments();
  const { services, deleteService, updateService } = useServices();
  const { posts, deletePost } = useCommunity();
  const { productCategories, serviceCategories, addProductCategory, updateProductCategory, deleteProductCategory, addServiceCategory, updateServiceCategory, deleteServiceCategory } = useCategories();
  const { getPageContent, updatePageContent, allPages } = useContent();
  const { showToast } = useToast();
  const { addNotification, addBulkNotifications } = useNotifications();


  const disputedDeliveries = useMemo(() => deliveries.filter(d => d.status === 'IN_DISPUTE'), [deliveries]);
  const getProductById = useMemo(() => (productId: string) => products.find(p => p.id === productId), [products]);
  const getUserById = useMemo(() => (userId: string) => users.find(u => u.id === userId), [users]);


  const handleDeleteUser = (userId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المستخدم؟ سيتم حذف جميع بياناته.')) {
      deleteUser(userId);
      showToast('تم حذف المستخدم بنجاح.', 'info');
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج؟')) {
      deleteProduct(productId);
       showToast('تم حذف المنتج بنجاح.', 'info');
    }
  };
  
  const handleResolveDispute = (delivery: Delivery, resolution: 'BUYER' | 'SELLER') => {
      if (resolution === 'BUYER') {
          refundPaymentToBuyer(delivery);
          updateDeliveryStatus(delivery.id, 'CANCELED');
          addNotification({
              userId: delivery.buyerId,
              message: 'تم حل النزاع لصالحك وإعادة المبلغ إلى حسابك.',
              link: '/buyer-dashboard'
          });
          addNotification({
              userId: delivery.sellerId,
              message: `تم حل النزاع بخصوص المنتج "${getProductById(delivery.productId)?.name}" لصالح المشتري.`,
              link: '/seller-dashboard'
          });
          showToast('تم حل النزاع لصالح المشتري.', 'info');
      } else { // 'SELLER'
          releasePaymentToSeller(delivery);
          updateDeliveryStatus(delivery.id, 'COMPLETED');
           addNotification({
              userId: delivery.sellerId,
              message: 'تم حل النزاع لصالحك وتحويل المبلغ إلى محفظتك.',
              link: '/seller-dashboard'
          });
           addNotification({
              userId: delivery.buyerId,
              message: `تم حل النزاع بخصوص المنتج "${getProductById(delivery.productId)?.name}" لصالح البائع.`,
              link: '/buyer-dashboard'
          });
          showToast('تم حل النزاع لصالح البائع.', 'info');
      }
  };


  const roleTranslations: { [key in UserRole]: string } = { ADMIN: 'مسؤول', SELLER: 'بائع', PROVIDER: 'مقدم خدمة', BUYER: 'مشتري', DELIVERY: 'مندوب توصيل' };
  const statusTranslations: { [key in DeliveryStatus]: string } = { PENDING: 'بانتظار البائع', READY_FOR_PICKUP: 'جاهز للاستلام', IN_TRANSIT: 'قيد التوصيل', DELIVERED: 'بانتظار تأكيد المشتري', COMPLETED: 'مكتمل', CANCELED: 'ملغي', IN_DISPUTE: 'قيد النزاع' };
  const paymentMethodTranslations: { [key in PaymentMethod]: string } = { CASH_ON_DELIVERY: 'الدفع عند الاستلام', BANK_TRANSFER: 'حوالة بنكية' };
  const paymentStatusTranslations: { [key in PaymentStatus]: string } = { PENDING: 'قيد الانتظار', HELD_IN_ESCROW: 'محجوز بالضمان', RELEASED_TO_SELLER: 'تم تحويله للبائع', REFUNDED: 'معاد للمشتري', FAILED: 'فشل', COMPLETED: 'مكتمل' };
  const verificationStatusTranslations: { [key in VerificationStatus]: string } = { NOT_VERIFIED: 'غير موثق', PENDING_VERIFICATION: 'قيد المراجعة', VERIFIED: 'موثق' };
  const verificationStatusColors: { [key in VerificationStatus]: string } = { NOT_VERIFIED: 'bg-gray-200 text-gray-800', PENDING_VERIFICATION: 'bg-yellow-200 text-yellow-800', VERIFIED: 'bg-green-200 text-green-800' };
  const statusColors: { [key in DeliveryStatus]: string } = { PENDING: 'bg-yellow-200 text-yellow-800', READY_FOR_PICKUP: 'bg-sky-200 text-sky-800', IN_TRANSIT: 'bg-blue-200 text-blue-800', DELIVERED: 'bg-cyan-200 text-cyan-800', COMPLETED: 'bg-green-200 text-green-800', CANCELED: 'bg-red-200 text-red-800', IN_DISPUTE: 'bg-orange-200 text-orange-800' };
  const paymentStatusColors: { [key in PaymentStatus]: string } = { PENDING: 'bg-yellow-200 text-yellow-800', HELD_IN_ESCROW: 'bg-blue-200 text-blue-800', RELEASED_TO_SELLER: 'bg-green-200 text-green-800', REFUNDED: 'bg-purple-200 text-purple-800', FAILED: 'bg-red-200 text-red-800', COMPLETED: 'bg-green-200 text-green-800' };
  const roleColors: { [key in UserRole]: string } = { ADMIN: 'bg-red-200 text-red-800', SELLER: 'bg-blue-200 text-blue-800', PROVIDER: 'bg-teal-200 text-teal-800', BUYER: 'bg-green-200 text-green-800', DELIVERY: 'bg-purple-200 text-purple-800' };
  const formatPrice = (price: number) => new Intl.NumberFormat('ar-YE', { style: 'currency', currency: 'YER', minimumFractionDigits: 0 }).format(price);


  const renderTabContent = () => {
      switch(activeTab) {
          case 'stats': return <AnalyticsTab users={users} products={products} deliveries={deliveries} />;
          case 'financial': return <FinancialManagementTab />;
          case 'settings': return <SettingsTab />;
          case 'live': return <LiveMonitoringMapTab />;
          case 'users': return <UsersTab users={users} adminUser={adminUser} approveVerification={approveVerification} revokeVerification={revokeVerification} suspendUser={suspendUser} unsuspendUser={unsuspendUser} handleDeleteUser={handleDeleteUser} roleTranslations={roleTranslations} roleColors={roleColors} verificationStatusTranslations={verificationStatusTranslations} verificationStatusColors={verificationStatusColors} />;
          case 'products': return <ProductsTab products={products} formatPrice={formatPrice} handleDeleteProduct={handleDeleteProduct} />;
          case 'services': return <ServicesTab services={services} formatPrice={formatPrice} deleteService={deleteService} showToast={showToast} />;
          case 'community': return <CommunityTab posts={posts} getUserById={getUserById} deletePost={deletePost} showToast={showToast} />;
          case 'deliveries': return <DeliveriesTab deliveries={deliveries} getProductById={getProductById} getUserById={getUserById} updateDeliveryStatus={updateDeliveryStatus} statusColors={statusColors} statusTranslations={statusTranslations} />;
          case 'payments': return <PaymentsTab payments={payments} formatPrice={formatPrice} paymentMethodTranslations={paymentMethodTranslations} paymentStatusColors={paymentStatusColors} paymentStatusTranslations={paymentStatusTranslations} />;
          case 'disputes': return <DisputesTab disputedDeliveries={disputedDeliveries} getProductById={getProductById} getUserById={getUserById} handleResolveDispute={handleResolveDispute} />;
          case 'categories': return <CategoriesTab productCategories={productCategories} serviceCategories={serviceCategories} addProductCategory={addProductCategory} updateProductCategory={updateProductCategory} deleteProductCategory={deleteProductCategory} addServiceCategory={addServiceCategory} updateServiceCategory={updateServiceCategory} deleteServiceCategory={deleteServiceCategory} showToast={showToast} />;
          case 'communication': return <CommunicationTab users={users} addBulkNotifications={addBulkNotifications} showToast={showToast} />;
          case 'content': return <ContentManagementTab getPageContent={getPageContent} updatePageContent={updatePageContent} allPages={allPages} showToast={showToast} />;
          case 'featured': return <FeaturedContentTab products={products} updateProduct={updateProduct} services={services} updateService={updateService} showToast={showToast} />;
          default: return null;
      }
  }

  return (
    <div className="bg-[var(--color-surface)] p-4 sm:p-6 md:p-8 rounded-lg shadow-lg border border-transparent dark:border-[var(--color-border)]">
      <h1 className="text-3xl font-bold text-[var(--color-text-base)] mb-6">لوحة تحكم الإدارة</h1>

      {/* Tabs */}
      <div className="border-b border-[var(--color-border)] no-print">
        <nav className="-mb-px flex space-x-6 space-x-reverse overflow-x-auto" aria-label="Tabs">
           <button onClick={() => setActiveTab('stats')} className={`${ activeTab === 'stats' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>الإحصاءات</button>
           <button onClick={() => setActiveTab('live')} className={`${ activeTab === 'live' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>المراقبة الحية</button>
           <button onClick={() => setActiveTab('financial')} className={`${ activeTab === 'financial' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>الإدارة المالية</button>
           <button onClick={() => setActiveTab('settings')} className={`${ activeTab === 'settings' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>الإعدادات</button>
           <button onClick={() => setActiveTab('disputes')} className={`${ activeTab === 'disputes' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm relative`}>
            النزاعات {disputedDeliveries.length > 0 && <span className="absolute -top-1 -right-3 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{disputedDeliveries.length}</span>}
          </button>
           <button onClick={() => setActiveTab('categories')} className={`${ activeTab === 'categories' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>إدارة التصنيفات</button>
           <button onClick={() => setActiveTab('communication')} className={`${ activeTab === 'communication' ? 'border-pink-500 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>التواصل</button>
           <button onClick={() => setActiveTab('content')} className={`${ activeTab === 'content' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>إدارة المحتوى</button>
           <button onClick={() => setActiveTab('featured')} className={`${ activeTab === 'featured' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>المحتوى المميز</button>
           <button onClick={() => setActiveTab('users')} className={`${ activeTab === 'users' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>المستخدمون ({users.length})</button>
           <button onClick={() => setActiveTab('products')} className={`${ activeTab === 'products' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>السلع ({products.length})</button>
           <button onClick={() => setActiveTab('services')} className={`${ activeTab === 'services' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>الخدمات ({services.length})</button>
           <button onClick={() => setActiveTab('community')} className={`${ activeTab === 'community' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>المجتمع ({posts.length})</button>
           <button onClick={() => setActiveTab('deliveries')} className={`${ activeTab === 'deliveries' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>التوصيل ({deliveries.length})</button>
           <button onClick={() => setActiveTab('payments')} className={`${ activeTab === 'payments' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>المدفوعات ({payments.length})</button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
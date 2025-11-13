import React, { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ToastContainer from './components/common/ToastContainer';
import ComparisonBar from './components/common/ComparisonBar';
import PageLoader from './components/common/PageLoader';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useSettings } from './hooks/useSettings';
import { useAuth } from './hooks/useAuth';
import { useThemeStore } from './store/themeStore';
import AuthPromptModal from './components/auth/AuthPromptModal';
import ScrollToTop from './components/common/ScrollToTop';

// Lazy load page components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const SellerDashboardPage = lazy(() => import('./pages/seller/SellerDashboardPage'));
const CreateStorePage = lazy(() => import('./pages/seller/CreateStorePage')); // New
const AddProductPage = lazy(() => import('./pages/seller/AddProductPage'));
const EditProductPage = lazy(() => import('./pages/seller/EditProductPage'));
const SellerVerificationPage = lazy(() => import('./pages/seller/VerificationPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const BuyerDashboardPage = lazy(() => import('./pages/buyer/BuyerDashboardPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const DeliveryDashboardPage = lazy(() => import('./pages/delivery/DeliveryDashboardPage'));
const DeliveryVerificationPage = lazy(() => import('./pages/delivery/VerificationPage'));
const JoinDeliveryPage = lazy(() => import('./pages/delivery/JoinDeliveryPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const StoreProfilePage = lazy(() => import('./pages/StoreProfilePage')); // Changed
const CartPage = lazy(() => import('./pages/CartPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const AdvertisePage = lazy(() => import('./pages/AdvertisePage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const ServicesHomePage = lazy(() => import('./pages/ServicesHomePage'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const AddServicePage = lazy(() => import('./pages/seller/AddServicePage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const InvoicePage = lazy(() => import('./pages/InvoicePage'));
const AboutUsPage = lazy(() => import('./pages/AboutUsPage'));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfUsePage = lazy(() => import('./pages/TermsOfUsePage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));

// New lazy loads for Provider role
const ProviderDashboardPage = lazy(() => import('./pages/provider/ProviderDashboardPage'));
const ProviderAddServicePage = lazy(() => import('./pages/seller/AddServicePage')); // Can be reused for now
const ProviderEditServicePage = lazy(() => import('./pages/seller/EditProductPage')); // FIXME: Should be EditServicePage

const PageRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/stores/:storeId" element={<StoreProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/join-delivery" element={<JoinDeliveryPage />} />
        <Route path="/advertise" element={<AdvertisePage />} /> 
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/services" element={<ServicesHomePage />} />
        <Route path="/services/:serviceId" element={<ServiceDetailPage />} />
        <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
        <Route path="/community/:postId" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
        
        {/* Static Pages */}
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfUsePage />} />

        {/* Generic Protected Route */}
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/chat/:contactId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/invoice/:deliveryId" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
        
        {/* Buyer Protected Routes */}
        <Route path="/buyer-dashboard" element={<ProtectedRoute role="BUYER"><BuyerDashboardPage /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute role="BUYER"><CartPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute role="BUYER"><CheckoutPage /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute role="BUYER"><PaymentPage /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute role="BUYER"><WishlistPage /></ProtectedRoute>} />
        <Route path="/order-confirmation/:deliveryId" element={<ProtectedRoute role="BUYER"><OrderConfirmationPage /></ProtectedRoute>} />

        {/* Seller Protected Routes */}
        <Route path="/seller-dashboard" element={<ProtectedRoute role="SELLER"><SellerDashboardPage /></ProtectedRoute>} />
        <Route path="/seller-dashboard/create-store" element={<ProtectedRoute role="SELLER"><CreateStorePage /></ProtectedRoute>} />
        <Route path="/seller-dashboard/add" element={<ProtectedRoute role="SELLER"><AddProductPage /></ProtectedRoute>} />
        <Route path="/seller-dashboard/edit/:productId" element={<ProtectedRoute role="SELLER"><EditProductPage /></ProtectedRoute>} />
        <Route path="/seller-dashboard/verification" element={<ProtectedRoute role="SELLER"><SellerVerificationPage /></ProtectedRoute>} />
        
        {/* Provider Protected Routes */}
        <Route path="/provider-dashboard" element={<ProtectedRoute role="PROVIDER"><ProviderDashboardPage /></ProtectedRoute>} />
        <Route path="/provider-dashboard/add-service" element={<ProtectedRoute role="PROVIDER"><ProviderAddServicePage /></ProtectedRoute>} />
        <Route path="/provider-dashboard/edit-service/:serviceId" element={<ProtectedRoute role="PROVIDER"><ProviderEditServicePage /></ProtectedRoute>} />

        {/* Admin Protected Route */}
        <Route path="/admin-dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboardPage /></ProtectedRoute>} />
        
        {/* Delivery Protected Route */}
        <Route path="/delivery-dashboard" element={<ProtectedRoute role="DELIVERY"><DeliveryDashboardPage /></ProtectedRoute>} />
        <Route path="/delivery-dashboard/verification" element={<ProtectedRoute role="DELIVERY"><DeliveryVerificationPage /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
};

const AppLayout: React.FC = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const location = useLocation();

  const isAllowedDuringMaintenance = user?.role === 'ADMIN' && (location.pathname.startsWith('/admin-dashboard') || location.pathname === '/login');

  if (settings.maintenanceMode && !isAllowedDuringMaintenance) {
    return (
      <Suspense fallback={<PageLoader />}>
        <MaintenancePage />
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)] text-[var(--color-text-base)]">
      <Header />
      <ToastContainer />
      <AuthPromptModal />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <Suspense fallback={<PageLoader />}>
          <PageRoutes />
        </Suspense>
      </motion.main>
      <ComparisonBar />
      <Footer />
    </div>
  );
};

function App() {
  const initializeTheme = useThemeStore(state => state.initializeTheme);

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <HashRouter>
      <ScrollToTop />
      <AppLayout />
    </HashRouter>
  );
}

export default App;
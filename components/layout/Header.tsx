import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useWishlist } from '../../hooks/useWishlist';
import { useCart } from '../../hooks/useCart';
import { useChat } from '../../hooks/useChat';
import { useToast } from '../../hooks/useToast';
import { useTheme } from '../../hooks/useTheme';
import { AnimatePresence, motion } from 'framer-motion';


const MobileMenu = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    showToast('تم تسجيل الخروج بنجاح.', 'info');
    onClose();
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      onClose();
    }
  };

  const dashboardLink = user?.role === 'ADMIN' ? '/admin-dashboard' 
                      : user?.role === 'SELLER' ? '/seller-dashboard' 
                      : user?.role === 'PROVIDER' ? '/provider-dashboard'
                      : user?.role === 'BUYER' ? '/buyer-dashboard'
                      : user?.role === 'DELIVERY' ? '/delivery-dashboard'
                      : '/';

  const dashboardText = user?.role === 'ADMIN' ? 'لوحة الإدارة' 
                      : user?.role === 'PROVIDER' ? 'لوحة الخدمات'
                      : user?.role === 'DELIVERY' ? 'لوحة التوصيل' 
                      : 'لوحة التحكم';

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: "-100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "-100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-0 bg-[var(--color-surface)] z-50 p-6 flex flex-col md:hidden"
    >
      <div className="flex justify-between items-center mb-8">
        <Link to="/" onClick={onClose} className="text-2xl font-bold text-[var(--color-primary)]">سوق مارب</Link>
        <button onClick={onClose} className="p-2">
          <svg className="h-6 w-6 text-[var(--color-text-base)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <div className="flex flex-col space-y-4 flex-grow">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input type="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="ابحث في سوق مارب..." className="w-full bg-[var(--color-background)] border-transparent rounded-full py-3 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-base)]" />
              <div className="absolute right-0 top-0 h-full flex items-center pr-4"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div>
          </form>

          <nav className="flex flex-col space-y-2 mt-4 text-lg">
            <Link to="/" onClick={onClose} className="font-medium text-[var(--color-text-base)] p-3 rounded-md hover:bg-[var(--color-background)]">السلع</Link>
            <Link to="/services" onClick={onClose} className="font-medium text-[var(--color-text-base)] p-3 rounded-md hover:bg-[var(--color-background)]">الخدمات</Link>
            <Link to="/community" onClick={onClose} className="font-medium text-[var(--color-text-base)] p-3 rounded-md hover:bg-[var(--color-background)]">المجتمع</Link>
            <Link to="/advertise" onClick={onClose} className="font-medium text-[var(--color-text-base)] p-3 rounded-md hover:bg-[var(--color-background)]">أعلن معنا</Link>
          </nav>
          
          <div className="border-t my-4 border-[var(--color-border)]"></div>

          {user ? (
             <>
                <Link to="/profile" onClick={onClose} className="font-medium text-[var(--color-text-base)] p-3 rounded-md hover:bg-[var(--color-background)]">الملف الشخصي</Link>
                <Link to={dashboardLink} onClick={onClose} className="font-medium text-[var(--color-text-base)] p-3 rounded-md hover:bg-[var(--color-background)]">{dashboardText}</Link>
                <div className="border-t my-1 border-[var(--color-border)]"></div>
                 <button onClick={toggleTheme} className="w-full text-right flex items-center justify-between p-3 rounded-md text-sm text-[var(--color-text-base)] hover:bg-[var(--color-background)]">
                    <span className="font-medium">الوضع</span>
                    <span className="text-xs">{theme === 'light' ? '☀️ فاتح' : '🌙 مظلم'}</span>
                </button>
                <div className="flex-grow"></div>
                <button onClick={handleLogout} className="w-full text-center font-medium text-red-600 bg-red-500/10 p-3 rounded-md hover:bg-red-500/20">تسجيل الخروج</button>
             </>
          ) : (
            <div className="mt-auto space-y-3">
              <Link to="/login" onClick={onClose} className="block text-center text-lg font-medium text-[var(--color-text-base)] bg-[var(--color-background)] hover:bg-[var(--color-border)] p-3 rounded-md">تسجيل الدخول</Link>
              <Link to="/register" onClick={onClose} className="block text-center text-lg font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] p-3 rounded-md">إنشاء حساب</Link>
            </div>
          )}
      </div>
    </motion.div>
  );
}


const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const { wishlistItems } = useWishlist();
  const { itemCount: cartItemCount } = useCart();
  const { unreadConversationsCount } = useChat();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');


  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const wishlistCount = wishlistItems.length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    showToast('تم تسجيل الخروج بنجاح.', 'info');
    navigate('/');
  };

  const handleNotificationClick = (notificationId: string, link: string) => {
    markAsRead(notificationId);
    setNotificationsOpen(false);
    navigate(link);
  };
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef, profileRef]);


  const dashboardLink = user?.role === 'ADMIN' ? '/admin-dashboard' 
                      : user?.role === 'SELLER' ? '/seller-dashboard' 
                      : user?.role === 'PROVIDER' ? '/provider-dashboard'
                      : user?.role === 'BUYER' ? '/buyer-dashboard'
                      : user?.role === 'DELIVERY' ? '/delivery-dashboard'
                      : '/';

  const dashboardText = user?.role === 'ADMIN' ? 'لوحة الإدارة' 
                      : user?.role === 'PROVIDER' ? 'لوحة الخدمات'
                      : user?.role === 'DELIVERY' ? 'لوحة التوصيل' 
                      : 'لوحة التحكم';

  return (
    <>
    <header className="bg-[var(--color-surface)]/80 backdrop-blur-md border-b border-[var(--color-border)]/80 sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-[var(--color-primary)]">سوق مارب</Link>
            <nav className="hidden md:flex md:gap-6">
              <Link to="/" className="font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">السلع</Link>
              <Link to="/services" className="font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">الخدمات</Link>
              <Link to="/community" className="font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">المجتمع</Link>
              <Link to="/advertise" className="font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">أعلن معنا</Link>
            </nav>
          </div>

          {/* Search Bar */}
           <div className="hidden lg:flex flex-1 justify-center px-8">
            <form onSubmit={handleSearchSubmit} className="w-full max-w-lg relative">
              <input
                type="search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="ابحث في سوق مارب..."
                className="w-full bg-[var(--color-background)] border border-transparent rounded-full py-2.5 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition text-[var(--color-text-base)] placeholder:text-[var(--color-text-muted)]"
              />
              <div className="absolute right-0 top-0 h-full flex items-center pr-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </form>
          </div>


          {/* Actions and Profile */}
          <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link to="/chat" className="relative text-gray-500 hover:text-[var(--color-primary)] p-2 rounded-full hover:bg-[var(--color-primary-light)] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    {unreadConversationsCount > 0 && (
                        <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                        {unreadConversationsCount}
                        </span>
                    )}
                  </Link>
                  
                  {user.role === 'BUYER' && (
                    <>
                    <Link to="/cart" className="relative text-gray-500 hover:text-[var(--color-primary)] p-2 rounded-full hover:bg-[var(--color-primary-light)] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        {cartItemCount > 0 && (
                            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                            {cartItemCount}
                            </span>
                        )}
                    </Link>
                    <Link to="/wishlist" className="relative text-gray-500 hover:text-[var(--color-primary)] p-2 rounded-full hover:bg-[var(--color-primary-light)] transition-colors hidden sm:block">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                      {wishlistCount > 0 && (
                         <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                    </>
                  )}

                  <div className="relative" ref={notificationRef}>
                    <button onClick={() => setNotificationsOpen(!isNotificationsOpen)} className="relative text-gray-500 hover:text-[var(--color-primary)] p-2 rounded-full hover:bg-[var(--color-primary-light)] transition-colors" aria-haspopup="true" aria-expanded={isNotificationsOpen}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      {unreadNotificationsCount > 0 && (
                        <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                          {unreadNotificationsCount}
                        </span>
                      )}
                    </button>
                    {isNotificationsOpen && (
                      <div className="absolute left-0 mt-2 w-80 bg-[var(--color-surface)] rounded-md shadow-lg border border-[var(--color-border)] z-20">
                        <div className="p-3 flex justify-between items-center border-b border-[var(--color-border)]">
                            <h3 className="font-semibold text-[var(--color-text-base)]">الإشعارات</h3>
                            {notifications.length > 0 && unreadNotificationsCount > 0 && <button onClick={() => { markAllAsRead(); setNotificationsOpen(false); }} className="text-sm text-[var(--color-primary)] hover:underline">تعليم الكل كمقروء</button>}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.slice(0, 5).map(n => (
                              <div key={n.id} onClick={() => handleNotificationClick(n.id, n.link)} className={`p-3 border-b border-[var(--color-border)] text-sm cursor-pointer hover:bg-[var(--color-background)] ${!n.isRead ? 'bg-[var(--color-primary-light)]' : ''}`}>
                                <p className="text-[var(--color-text-base)]">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(n.date).toLocaleString('ar-EG')}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-[var(--color-text-muted)] p-4">لا توجد إشعارات.</p>
                          )}
                        </div>
                         <div className="p-2 border-t border-[var(--color-border)] bg-[var(--color-background)]">
                            <Link to="/notifications" onClick={() => setNotificationsOpen(false)} className="text-sm text-center block text-[var(--color-primary)] hover:underline">عرض كل الإشعارات</Link>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative" ref={profileRef}>
                    <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center gap-2 text-[var(--color-text-base)] hover:text-[var(--color-primary)]" aria-haspopup="true" aria-expanded={isProfileOpen}>
                       <div className="w-9 h-9 bg-[var(--color-background)] rounded-full flex items-center justify-center font-bold text-[var(--color-primary)]">{user.name.charAt(0)}</div>
                       <span className="font-semibold hidden sm:inline">{user.name}</span>
                      <svg className={`w-4 h-4 transition-transform text-gray-400 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {isProfileOpen && (
                      <div className="absolute left-0 mt-2 w-48 bg-[var(--color-surface)] rounded-md shadow-lg border border-[var(--color-border)] z-20 py-1">
                         <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-[var(--color-text-base)] hover:bg-[var(--color-background)]">الملف الشخصي</Link>
                         <Link to={dashboardLink} onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-[var(--color-text-base)] hover:bg-[var(--color-background)]">{dashboardText}</Link>
                         <Link to="/chat" onClick={() => setProfileOpen(false)} className="block px-4 py-2 text-sm text-[var(--color-text-base)] hover:bg-[var(--color-background)]">الرسائل</Link>
                         <div className="border-t my-1 border-[var(--color-border)]"></div>
                          <button onClick={toggleTheme} className="w-full text-right flex items-center justify-between px-4 py-2 text-sm text-[var(--color-text-base)] hover:bg-[var(--color-background)]">
                            <span>{theme === 'light' ? 'الوضع المظلم' : 'الوضع الفاتح'}</span>
                            <span>{theme === 'light' ? '🌙' : '☀️'}</span>
                          </button>
                         <div className="border-t my-1 border-[var(--color-border)]"></div>
                         <button onClick={handleLogout} className="w-full text-right block px-4 py-2 text-sm text-red-500 hover:bg-[var(--color-background)]">
                            تسجيل الخروج
                         </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="text-base font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors px-4 py-2 rounded-md">تسجيل الدخول</Link>
                  <Link to="/register" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]">إنشاء حساب</Link>
                </div>
              )}

            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(true)} className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600 p-2 rounded-md hover:bg-[var(--color-background)]">
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      </header>
      <AnimatePresence>
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </AnimatePresence>
    </>
  );
};

export default Header;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';

const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notificationId: string, link: string) => {
    markAsRead(notificationId);
    navigate(link);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">الإشعارات</h1>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead} 
            className="text-sm font-medium text-sky-600 hover:text-sky-800 transition-colors"
          >
            تعليم الكل كمقروء
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id, notification.link)}
              className={`p-4 rounded-lg cursor-pointer transition-colors flex items-start gap-4 ${
                notification.isRead 
                  ? 'bg-gray-50 hover:bg-gray-100' 
                  : 'bg-sky-50 hover:bg-sky-100 border-r-4 border-sky-500'
              }`}
            >
              <div className={`mt-1 flex-shrink-0 w-3 h-3 rounded-full ${notification.isRead ? 'bg-gray-300' : 'bg-sky-500'}`}></div>
              <div className="flex-grow">
                <p className={`text-gray-800 ${!notification.isRead && 'font-semibold'}`}>
                  {notification.message}
                </p>
                <span className="text-xs text-gray-500 mt-1 block">
                  {new Date(notification.date).toLocaleString('ar-EG', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">لا توجد إشعارات</h3>
            <p className="mt-1 text-sm text-gray-500">سيتم عرض الإشعارات الجديدة هنا.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

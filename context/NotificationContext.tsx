import React, { createContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Notification } from '../types';
import { useAuth } from '../hooks/useAuth';
import { realtimeService } from '../api/realtimeService';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notificationData: Omit<Notification, 'id' | 'isRead' | 'date'>) => void;
  addBulkNotifications: (message: string, link: string, userIds: string[]) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

const NOTIFICATIONS_STORAGE_KEY = 'souqmarib_notifications';

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [allNotifications, setAllNotifications] = useState<Notification[]>(() => {
    try {
      const storedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return storedNotifications ? JSON.parse(storedNotifications) : [];
    } catch (error) {
      console.error("Failed to load notifications from localStorage", error);
      return [];
    }
  });

  const { user } = useAuth();

  // Listen for real-time events
  useEffect(() => {
    realtimeService.onEvent((event) => {
      if (event.type === 'notification') {
        const receivedNotification = event.payload;
        // Add notification only if it doesn't already exist (to prevent duplicates from own actions)
        setAllNotifications(prev => {
           if (prev.some(n => n.id === receivedNotification.id)) {
               return prev;
           }
           return [receivedNotification, ...prev];
        });
      }
    });
    // Consider adding a cleanup function if the service needs it
  }, []);

  // Persist notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(allNotifications));
    } catch (error) {
      console.error("Failed to save notifications to localStorage", error);
    }
  }, [allNotifications]);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'isRead' | 'date'>) => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      isRead: false,
      date: new Date().toISOString(),
      ...notificationData,
    };
    // Post an event to the real-time service
    realtimeService.postEvent({ type: 'notification', payload: newNotification });
  };

  const addBulkNotifications = (message: string, link: string, userIds: string[]) => {
    const now = new Date().toISOString();
    const newNotifications: Notification[] = userIds.map(userId => ({
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${userId}`,
      userId,
      message,
      link,
      isRead: false,
      date: now,
    }));

    // Update state once for efficiency in the current tab
    setAllNotifications(prev => [...newNotifications, ...prev]);

    // Broadcast to other tabs/users
    // In a real WebSocket app, this would be a single API call to a bulk-notification endpoint.
    // Here, we simulate by posting events.
    newNotifications.forEach(notification => {
      realtimeService.postEvent({ type: 'notification', payload: notification });
    });
  };

  const markAsRead = (notificationId: string) => {
    setAllNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    if (user) {
      setAllNotifications(prev =>
        prev.map(n => (n.userId === user.id ? { ...n, isRead: true } : n))
      );
    }
  };

  const userNotifications = useMemo(() => {
    return user ? allNotifications.filter(n => n.userId === user.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
  }, [allNotifications, user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications: userNotifications,
        addNotification,
        addBulkNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
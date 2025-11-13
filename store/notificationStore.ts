import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Notification } from '../types';
import { realtimeService } from '../api/realtimeService';
import { useAuthStore } from './authStore';

interface NotificationState {
  allNotifications: Notification[];
  notifications: Notification[]; // Derived for current user
  addNotification: (notificationData: Omit<Notification, 'id' | 'isRead' | 'date'>) => void;
  addBulkNotifications: (message: string, link: string, userIds: string[]) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  _rehydrate: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      allNotifications: [],
      notifications: [],
      addNotification: (notificationData) => {
        const newNotification: Notification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          isRead: false,
          date: new Date().toISOString(),
          ...notificationData,
        };
        realtimeService.postEvent({ type: 'notification', payload: newNotification });
      },
      addBulkNotifications: (message, link, userIds) => {
        const now = new Date().toISOString();
        const newNotifications: Notification[] = userIds.map(userId => ({
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${userId}`,
          userId,
          message,
          link,
          isRead: false,
          date: now,
        }));
        set(state => ({ allNotifications: [...newNotifications, ...state.allNotifications] }));
        newNotifications.forEach(notification => {
          realtimeService.postEvent({ type: 'notification', payload: notification });
        });
      },
      markAsRead: (notificationId) => {
        set(state => ({
          allNotifications: state.allNotifications.map(n => (n.id === notificationId ? { ...n, isRead: true } : n)),
        }));
        get()._rehydrate();
      },
      markAllAsRead: () => {
        const { user } = useAuthStore.getState();
        if (user) {
          set(state => ({
            allNotifications: state.allNotifications.map(n => (n.userId === user.id ? { ...n, isRead: true } : n)),
          }));
          get()._rehydrate();
        }
      },
      // Internal function to update derived user-specific notifications
      _rehydrate: () => {
        const { user } = useAuthStore.getState();
        const allNotifications = get().allNotifications;
        const userNotifications = user 
          ? allNotifications.filter(n => n.userId === user.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) 
          : [];
        set({ notifications: userNotifications });
      },
    }),
    {
      name: 'souqmarib_notifications',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ allNotifications: state.allNotifications }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._rehydrate();
          
          realtimeService.onEvent((event) => {
            if (event.type === 'notification') {
              const receivedNotification = event.payload;
              const exists = state.allNotifications.some(n => n.id === receivedNotification.id);
              if (!exists) {
                state.allNotifications.unshift(receivedNotification);
                state._rehydrate();
              }
            }
          });
          
          useAuthStore.subscribe(state._rehydrate);
        }
      }
    }
  )
);

import { create } from 'zustand';
import { UserRating } from '../types';
import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';
import * as api from '../api';

interface RatingState {
  ratings: UserRating[];
  getRatingsForUser: (userId: string) => UserRating[];
  addRating: (ratedUserId: string, deliveryId: string, rating: number, comment: string, showToast: (msg: string, type: any) => void) => Promise<void>;
  hasUserRatedTransaction: (deliveryId: string, raterId: string, ratedUserId: string) => boolean;
  initialize: () => Promise<void>;
}

export const useRatingStore = create<RatingState>((set, get) => ({
  ratings: [],
  initialize: async () => {
    const ratings = await api.apiFetchRatings();
    set({ ratings });
  },
  getRatingsForUser: (userId) => {
    return get().ratings.filter(r => r.ratedUserId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  hasUserRatedTransaction: (deliveryId, raterId, ratedUserId) => {
    return get().ratings.some(r => r.deliveryId === deliveryId && r.raterId === raterId && r.ratedUserId === ratedUserId);
  },
  addRating: async (ratedUserId, deliveryId, rating, comment, showToast) => {
    const { user, updateUserAverageRating } = useAuthStore.getState();
    if (!user) { showToast("يجب تسجيل الدخول لإضافة تقييم.", 'error'); return; }
    if (get().hasUserRatedTransaction(deliveryId, user.id, ratedUserId)) { showToast("لقد قمت بتقييم هذه الصفقة من قبل.", 'info'); return; }

    const newRatingData: UserRating = {
      id: `ur-${Date.now()}`, ratedUserId, raterId: user.id, deliveryId, rating, comment, date: new Date().toISOString(),
    };
    
    const newRating = await api.apiAddRating(newRatingData);
    const updatedRatings = [newRating, ...get().ratings];
    set({ ratings: updatedRatings });
    
    const allRatingsForUser = updatedRatings.filter(r => r.ratedUserId === ratedUserId);
    const newAverage = allRatingsForUser.length > 0 ? allRatingsForUser.reduce((acc, r) => acc + r.rating, 0) / allRatingsForUser.length : 0;
    await updateUserAverageRating(ratedUserId, newAverage);

    useNotificationStore.getState().addNotification({
        userId: ratedUserId, message: `لقد تلقيت تقييماً جديداً من ${user.name}.`, link: `/profile`
    });

    showToast('شكراً لك، تم إرسال تقييمك!', 'success');
  },
}));

useRatingStore.getState().initialize();

import { create } from 'zustand';
import { Review } from '../types';
import { useAuthStore } from './authStore';
import * as api from '../api';

interface ReviewState {
  reviews: Review[];
  getReviewsForProduct: (productId: string) => Review[];
  addReview: (productId: string, rating: number, comment: string) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  initialize: async () => {
    const reviews = await api.apiFetchReviews();
    set({ reviews });
  },
  getReviewsForProduct: (productId: string) => {
    return get().reviews.filter(review => review.productId === productId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  addReview: async (productId, rating, comment) => {
    const { user } = useAuthStore.getState();
    if (!user) { console.error("User must be logged in to add a review."); return; }

    const newReviewData: Review = {
      id: `r${Date.now()}`, productId, userId: user.id, userName: user.name,
      rating, comment, date: new Date().toISOString(),
    };
    
    const newReview = await api.apiAddReview(newReviewData);
    set(state => ({ reviews: [newReview, ...state.reviews] }));
  },
}));

useReviewStore.getState().initialize();

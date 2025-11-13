import React, { createContext, useState, ReactNode } from 'react';
import { UserRating } from '../types';
import { mockUserRatingsData } from '../data/ratingsData';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useNotifications } from '../hooks/useNotifications';

interface RatingContextType {
  getRatingsForUser: (userId: string) => UserRating[];
  addRating: (ratedUserId: string, deliveryId: string, rating: number, comment: string) => void;
  hasUserRatedTransaction: (deliveryId: string, raterId: string, ratedUserId: string) => boolean;
}

export const RatingContext = createContext<RatingContextType | undefined>(undefined);

interface RatingProviderProps {
  children: ReactNode;
}

export const RatingProvider: React.FC<RatingProviderProps> = ({ children }) => {
  const [ratings, setRatings] = useState<UserRating[]>(mockUserRatingsData);
  const { user, updateUserAverageRating } = useAuth();
  const { showToast } = useToast();
  const { addNotification } = useNotifications();

  const getRatingsForUser = (userId: string): UserRating[] => {
    return ratings.filter(r => r.ratedUserId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const hasUserRatedTransaction = (deliveryId: string, raterId: string, ratedUserId: string): boolean => {
    return ratings.some(r => r.deliveryId === deliveryId && r.raterId === raterId && r.ratedUserId === ratedUserId);
  };

  const addRating = (ratedUserId: string, deliveryId: string, rating: number, comment: string) => {
    if (!user) {
      showToast("يجب تسجيل الدخول لإضافة تقييم.", 'error');
      return;
    }
    
    if (hasUserRatedTransaction(deliveryId, user.id, ratedUserId)) {
      showToast("لقد قمت بتقييم هذه الصفقة من قبل.", 'info');
      return;
    }

    const newRating: UserRating = {
      id: `ur-${Date.now()}`,
      ratedUserId,
      raterId: user.id,
      deliveryId,
      rating,
      comment,
      date: new Date().toISOString(),
    };

    setRatings(prevRatings => {
      const updatedRatings = [newRating, ...prevRatings];
      
      // Recalculate and update the user's averageRating
      const allRatingsForUser = updatedRatings.filter(r => r.ratedUserId === ratedUserId);
      const newAverage = allRatingsForUser.length > 0
        ? allRatingsForUser.reduce((acc, r) => acc + r.rating, 0) / allRatingsForUser.length
        : 0;
      updateUserAverageRating(ratedUserId, newAverage);

      return updatedRatings;
    });
    
    addNotification({
        userId: ratedUserId,
        message: `لقد تلقيت تقييماً جديداً من ${user.name}.`,
        link: `/profile` // Or a dedicated ratings page
    });

    showToast('شكراً لك، تم إرسال تقييمك!', 'success');
  };

  return (
    <RatingContext.Provider value={{ getRatingsForUser, addRating, hasUserRatedTransaction }}>
      {children}
    </RatingContext.Provider>
  );
};
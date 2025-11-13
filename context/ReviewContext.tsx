import React, { createContext, useState, ReactNode } from 'react';
import { Review } from '../types';
import { mockReviewsData } from '../data/reviewsData';
import { useAuth } from '../hooks/useAuth';

interface ReviewContextType {
  getReviewsForProduct: (productId: string) => Review[];
  addReview: (productId: string, rating: number, comment: string) => void;
}

export const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

interface ReviewProviderProps {
  children: ReactNode;
}

export const ReviewProvider: React.FC<ReviewProviderProps> = ({ children }) => {
  const [reviews, setReviews] = useState<Review[]>(mockReviewsData);
  const { user } = useAuth();

  const getReviewsForProduct = (productId: string): Review[] => {
    return reviews.filter(review => review.productId === productId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const addReview = (productId: string, rating: number, comment: string) => {
    if (!user) {
      console.error("User must be logged in to add a review.");
      return;
    }

    const newReview: Review = {
      id: `r${Date.now()}`,
      productId,
      userId: user.id,
      userName: user.name,
      rating,
      comment,
      date: new Date().toISOString(),
    };

    setReviews(prevReviews => [newReview, ...prevReviews]);
  };

  return (
    <ReviewContext.Provider value={{ getReviewsForProduct, addReview }}>
      {children}
    </ReviewContext.Provider>
  );
};
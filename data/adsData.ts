import { Advertisement } from '../types';

const addDays = (date: Date, days: number): string => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
};
const today = new Date();

export const mockAdsData: Advertisement[] = [
    { id: 'ad1', title: 'خدمة التوصيل السريع في سوق مارب!', imageUrl: 'https://picsum.photos/seed/delivery-ad/1200/400', link: '/', type: 'platform', endDate: addDays(today, 365) }
];

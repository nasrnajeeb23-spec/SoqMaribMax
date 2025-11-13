import { Offer } from '../types';

export const mockOffersData: Offer[] = [
    { id: 'offer1', productId: 'p1', buyerId: 'user-2', sellerId: 'user-1', offerPrice: 110000, status: 'PENDING', timestamp: new Date().toISOString(), statusUpdateTimestamp: new Date().toISOString() }
];

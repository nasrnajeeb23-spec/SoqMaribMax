import { PayoutTransaction } from '../types';

export const mockPayoutsData: PayoutTransaction[] = [
    { id: 'payout-1', sellerId: 'user-1', amount: 25000, date: new Date().toISOString(), status: 'COMPLETED', accountDetails: 'بنك اليمن الدولي - 123456', processedAt: new Date().toISOString() }
];

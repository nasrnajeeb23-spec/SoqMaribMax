import { SavedSearch } from '../types';

export const mockSavedSearchesData: SavedSearch[] = [
    {
      id: 'ss1',
      userId: 'user-2',
      searchTerm: 'لابتوب',
      categoryId: '1',
      condition: 'used',
      timestamp: new Date().toISOString(),
    },
];

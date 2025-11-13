import React, { createContext, useState, ReactNode, useMemo } from 'react';
import { Advertisement } from '../types';
import { mockAdsData } from '../data/adsData';
import { useToast } from '../hooks/useToast';
import { useSettings } from '../hooks/useSettings';

interface AdContextType {
  activeAds: Advertisement[];
  addAd: (adData: Omit<Advertisement, 'id' | 'type' | 'endDate'>) => boolean;
}

export const AdContext = createContext<AdContextType | undefined>(undefined);

interface AdProviderProps {
  children: ReactNode;
}

export const AdProvider: React.FC<AdProviderProps> = ({ children }) => {
  const [ads, setAds] = useState<Advertisement[]>(mockAdsData);
  const { showToast } = useToast();
  const { settings } = useSettings();

  const activeAds = useMemo(() => {
    const now = new Date();
    return ads.filter(ad => new Date(ad.endDate) > now);
  }, [ads]);

  const addAd = (adData: Omit<Advertisement, 'id' | 'type' | 'endDate'>): boolean => {
    // Simulate payment
    const adCost = settings.adCost;
    if (window.confirm(`عرض هذا الإعلان سيكلف ${adCost} ريال يمني لمدة 7 أيام. هل تريد المتابعة؟`)) {
        const today = new Date();
        const endDate = new Date(today.setDate(today.getDate() + 7)).toISOString();

        const newAd: Advertisement = {
            id: `ad-${Date.now()}`,
            type: 'user',
            endDate,
            ...adData
        };

        setAds(prevAds => [...prevAds, newAd]);

        showToast('تم الدفع ونشر إعلانك بنجاح!', 'success');
        return true; // Indicate success
    }
    return false; // Indicate cancellation
  };

  return (
    <AdContext.Provider value={{ activeAds, addAd }}>
      {children}
    </AdContext.Provider>
  );
};
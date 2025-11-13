import { create } from 'zustand';
import { Advertisement } from '../types';
import { useSettingsStore } from './settingsStore';
import * as api from '../api';

interface AdState {
  ads: Advertisement[];
  activeAds: Advertisement[];
  addAd: (adData: Omit<Advertisement, 'id' | 'type' | 'endDate'>) => Promise<boolean>;
  _updateActiveAds: () => void;
  initialize: () => Promise<void>;
}

export const useAdStore = create<AdState>((set, get) => ({
  ads: [],
  activeAds: [],
  initialize: async () => {
      const ads = await api.apiFetchAds();
      set({ ads });
      get()._updateActiveAds();
  },
  _updateActiveAds: () => {
    const now = new Date();
    const active = get().ads.filter(ad => new Date(ad.endDate) > now);
    set({ activeAds: active });
  },
  addAd: async (adData) => {
    const { settings } = useSettingsStore.getState();
    if (window.confirm(`عرض هذا الإعلان سيكلف ${settings.adCost} ريال يمني لمدة 7 أيام. هل تريد المتابعة؟`)) {
        const today = new Date();
        const endDate = new Date(today.setDate(today.getDate() + 7)).toISOString();
        const newAdData: Advertisement = { id: `ad-${Date.now()}`, type: 'user', endDate, ...adData };
        
        const newAd = await api.apiAddAd(newAdData);
        set(state => ({ ads: [...state.ads, newAd] }));
        get()._updateActiveAds();
        return true;
    }
    return false;
  },
}));

useAdStore.getState().initialize();

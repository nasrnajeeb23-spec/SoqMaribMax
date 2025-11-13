import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PlatformSettings } from '../types';
import { defaultSettings } from '../data/settingsData';

interface SettingsState {
  settings: PlatformSettings;
  updateSettings: (newSettings: Partial<PlatformSettings>, showToast: (msg: string, type: any) => void) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (newSettings, showToast) => {
        set(state => ({ settings: { ...state.settings, ...newSettings } }));
        showToast('تم حفظ الإعدادات بنجاح.', 'success');
      },
    }),
    {
      name: 'souqmarib_settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

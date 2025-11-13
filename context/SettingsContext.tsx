import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { PlatformSettings } from '../types';
import { defaultSettings } from '../data/settingsData';
import { useToast } from '../hooks/useToast';

interface SettingsContextType {
  settings: PlatformSettings;
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

const SETTINGS_STORAGE_KEY = 'souqmarib_settings';

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<PlatformSettings>(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return storedSettings ? JSON.parse(storedSettings) : defaultSettings;
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    showToast('تم حفظ الإعدادات بنجاح.', 'success');
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

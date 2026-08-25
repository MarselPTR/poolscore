import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppSettings, ThemeMode } from '../types';
import { db, DEFAULT_SETTINGS } from '../db/database';

interface SettingsContextType {
  settings: AppSettings;
  isDarkMode: boolean;
  toggleTheme: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const applyTheme = (theme: ThemeMode) => {
    const isLight = theme === 'light';
    document.documentElement.setAttribute('data-theme', theme);
    if (isLight) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await db.settings.get('global_settings');
        if (stored) {
          setSettings(stored);
          applyTheme(stored.theme);
        } else {
          await db.settings.put({ ...DEFAULT_SETTINGS, id: 'global_settings' });
          applyTheme(DEFAULT_SETTINGS.theme);
        }
      } catch {
        applyTheme('obsidian');
      }
    };
    loadSettings();
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = settings.theme === 'light' ? 'obsidian' : 'light';
    updateSettings({ theme: nextTheme });
  };

  const updateSettings = async (newPartial: Partial<AppSettings>) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    if (newPartial.theme) {
      applyTheme(newPartial.theme);
    }
    try {
      await db.settings.put({ ...updated, id: 'global_settings' });
    } catch {
      // ignore
    }
  };

  const resetSettings = async () => {
    setSettings(DEFAULT_SETTINGS);
    applyTheme(DEFAULT_SETTINGS.theme);
    try {
      await db.settings.put({ ...DEFAULT_SETTINGS, id: 'global_settings' });
    } catch {
      // ignore
    }
  };

  const isDarkMode = settings.theme !== 'light';

  return (
    <SettingsContext.Provider value={{ settings, isDarkMode, toggleTheme, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

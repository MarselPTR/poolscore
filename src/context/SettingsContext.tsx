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

// Older versions stored extra dark variants (obsidian, carbon, navy,
// felt-green). Anything that is not "light" now maps to the single dark theme.
const normalizeTheme = (theme: unknown): ThemeMode => (theme === 'light' ? 'light' : 'dark');

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
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isLight ? '#f3f3f1' : '#0b0c0e');
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await db.settings.get('global_settings');
        if (stored) {
          const theme = normalizeTheme(stored.theme);
          setSettings({ ...stored, theme });
          applyTheme(theme);
        } else {
          await db.settings.put({ ...DEFAULT_SETTINGS, id: 'global_settings' });
          applyTheme(DEFAULT_SETTINGS.theme);
        }
      } catch {
        applyTheme('dark');
      }
    };
    loadSettings();
  }, []);

  const toggleTheme = () => {
    const nextTheme: ThemeMode = settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: nextTheme });
  };

  const updateSettings = async (newPartial: Partial<AppSettings>) => {
    const updated = { ...settings, ...newPartial };
    updated.theme = normalizeTheme(updated.theme);
    setSettings(updated);
    if (newPartial.theme) {
      applyTheme(updated.theme);
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

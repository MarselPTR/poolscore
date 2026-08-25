import React from 'react';
import { Settings, Home, History, Trophy, BarChart3, Building2, Tv, Sun, Moon } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenTV: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
  onOpenTV,
}) => {
  const { isDarkMode, toggleTheme } = useSettings();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'stats', label: 'Leaderboard', icon: BarChart3 },
    { id: 'tournament', label: 'Turnamen', icon: Trophy },
    { id: 'club', label: 'Club Meja', icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-xl select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src="/logo.png"
            alt="PoolScore Logo"
            className="w-8 h-8 rounded-xl object-cover border border-zinc-800 shadow-sm transition-transform duration-150 group-hover:scale-105"
          />

          <div>
            <div className="font-bold text-base tracking-tight text-white leading-none group-hover:text-rose-400 transition-colors">
              PoolScore
            </div>
            <div className="text-[10px] text-zinc-500 tracking-wider font-mono uppercase mt-0.5">
              Scoreboard
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all duration-150 ${
                  isActive
                    ? 'bg-zinc-900 text-white border border-zinc-700/60 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-500' : 'text-zinc-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Quick Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all active:scale-95"
            title={isDarkMode ? 'Ganti ke Mode Siang (Light Mode)' : 'Ganti ke Mode Malam (Dark Mode)'}
            aria-label="Toggle theme mode"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-rose-500" />
            )}
          </button>

          <button
            onClick={onOpenTV}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all"
            title="Tampilan TV Arena"
          >
            <Tv className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all"
            title="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

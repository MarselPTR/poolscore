import React, { useState } from 'react';
import { Settings, Home, History, Trophy, BarChart3, Building2, Tv, Sun, Moon, LogOut } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PlayerAvatar } from './PlayerAvatar';
import { ConfirmDialog } from './ConfirmDialog';

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
  const { user, logout } = useAuth();
  const { info } = useToast();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'stats', label: 'Leaderboard', icon: BarChart3 },
    { id: 'tournament', label: 'Turnamen', icon: Trophy },
    { id: 'club', label: 'Club Meja', icon: Building2 },
  ];

  const handleConfirmLogout = () => {
    logout();
    info('Berhasil Keluar', 'Sesi akun Anda telah diakhiri dengan aman.');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-xl select-none">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
          {/* Brand Logo & Wordmark */}
          <div
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
          >
            <img
              src="/logo.png"
              alt="PoolScore Logo"
              className="w-8 h-8 rounded-xl object-contain shadow-md transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-rose-400 transition-colors leading-none">
                Pool<span className="text-rose-500">Score</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider leading-tight mt-0.5">
                Championship
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800/80">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & User Badge */}
          <div className="flex items-center gap-2">
            {/* User Profile Pill */}
            {user && (
              <div
                onClick={onOpenSettings}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 cursor-pointer transition-all active:scale-95"
                title="Profil Pengguna"
              >
                <PlayerAvatar name={user.name} size="xs" />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-none truncate max-w-[100px]">
                    {user.name}
                  </span>
                  <span className="text-[9px] text-rose-400 font-medium leading-none mt-0.5">
                    {user.role} · {user.rating}
                  </span>
                </div>
              </div>
            )}

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all"
              title={isDarkMode ? 'Beralih ke Mode Siang' : 'Beralih ke Mode Malam'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-300" />
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

            {/* Logout button with sleek Confirm Dialog */}
            {user && (
              <button
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 border border-zinc-800 transition-all active:scale-95"
                title="Keluar / Ganti Akun"
              >
                <LogOut className="w-4 h-4 shrink-0" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Keluar dari Akun?"
        message="Anda akan dialihkan kembali ke halaman masuk. Seluruh data pertandingan lokal dan cloud tetap tersimpan dengan aman."
        confirmText="Ya, Keluar"
        cancelText="Batal"
        iconType="logout"
        type="danger"
      />
    </>
  );
};

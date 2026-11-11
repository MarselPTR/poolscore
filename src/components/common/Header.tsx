import React from 'react';
import { Tv, Sun, Moon, Settings } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth, ROLE_LABELS } from '../../context/AuthContext';
import { allowedTabs } from '../../lib/roles';
import { PlayerAvatar } from './PlayerAvatar';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenTV: () => void;
}

const NAV_LABELS: Record<string, string> = {
  home: 'Beranda',
  history: 'Riwayat',
  stats: 'Peringkat',
  tournament: 'Turnamen',
  club: 'Klub',
  admin: 'Panel',
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
  onOpenTV,
}) => {
  const { isDarkMode, toggleTheme } = useSettings();
  const { user } = useAuth();
  const navItems = allowedTabs(user).map((id) => ({ id, label: NAV_LABELS[id] }));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-rule bg-bg select-none">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <button
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 shrink-0"
          aria-label="PoolScore, ke beranda"
        >
          <img src="/logo.png" alt="" className="w-7 h-7 rounded-[4px] object-contain" />
          <span className="display text-[22px] tracking-wide text-ink">PoolScore</span>
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-stretch h-14 gap-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3.5 text-sm font-semibold border-b-2 -mb-px ${
                  isActive
                    ? 'border-ink text-ink'
                    : 'border-transparent text-ink-3 hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <button onClick={onOpenTV} className="icon-btn" title="Tampilan TV" aria-label="Tampilan TV">
            <Tv className="w-[18px] h-[18px]" />
          </button>

          <button
            onClick={toggleTheme}
            className="icon-btn"
            title={isDarkMode ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
            aria-label={isDarkMode ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
          >
            {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          {user ? (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2.5 h-10 pl-2 pr-2 sm:pr-3 ml-1 rounded-[4px] hover:bg-panel-2"
              title="Akun dan pengaturan"
            >
              <PlayerAvatar name={user.name} size="sm" />
              <span className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-sm font-semibold text-ink truncate max-w-[120px]">{user.name}</span>
                <span className="text-xs text-ink-3">
                  {user.isGuest ? 'Tamu' : ROLE_LABELS[user.role]} · {user.rating}
                </span>
              </span>
            </button>
          ) : (
            <button onClick={onOpenSettings} className="icon-btn" title="Pengaturan" aria-label="Pengaturan">
              <Settings className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Settings, Home, History } from 'lucide-react';
import { IconEloRanking, IconBracketTree, IconBilliardTable, IconTVScreen } from './BilliardIcons';

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
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'history', label: 'History', icon: History },
    { id: 'stats', label: 'Leaderboard', customIcon: IconEloRanking },
    { id: 'tournament', label: 'Turnamen', customIcon: IconBracketTree },
    { id: 'club', label: 'Club Meja', customIcon: IconBilliardTable },
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-line bg-surface/90 backdrop-blur-md select-none">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand Logo (Rounded Squircle) & Wordmark */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <img
            src="/logo.png"
            alt="PoolScore Logo"
            className="w-8 h-8 rounded-xl object-cover border border-line-strong drop-shadow-[0_0_10px_rgba(201,42,57,0.35)] transition-transform group-hover:scale-105"
          />

          <div>
            <h1 className="font-display font-bold text-xl tracking-wider uppercase text-text group-hover:text-red transition-colors">
              PoolScore
            </h1>
            <div className="font-mono text-[9px] text-text-faint tracking-widest uppercase -mt-0.5">
              Scoreboard for Pool
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            const CustomIcon = item.customIcon;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs uppercase font-bold tracking-wider flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-surface-2 text-text border border-line-strong shadow-sm'
                    : 'text-text-dim hover:text-text hover:bg-surface-2 border border-transparent'
                }`}
              >
                {CustomIcon ? <CustomIcon size={16} /> : Icon ? <Icon className="w-4 h-4" /> : null}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTV}
            className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-dim hover:text-text border border-line transition-colors"
            title="Tampilan TV / Big Screen"
          >
            <IconTVScreen size={18} />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-text-dim hover:text-text border border-line transition-colors"
            title="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

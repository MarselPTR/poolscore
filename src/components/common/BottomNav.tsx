import React from 'react';
import { Home, History, Trophy, BarChart3, LayoutGrid } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isVisible: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  isVisible,
}) => {
  if (!isVisible) return null;

  const items = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'stats', label: 'Peringkat', icon: BarChart3 },
    { id: 'tournament', label: 'Turnamen', icon: Trophy },
    { id: 'club', label: 'Klub', icon: LayoutGrid },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg border-t border-rule select-none safe-area-pb">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 h-14 border-t-2 -mt-px ${
                isActive ? 'border-ink text-ink' : 'border-transparent text-ink-3'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 1.75} />
              <span className="text-[11px] font-medium leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

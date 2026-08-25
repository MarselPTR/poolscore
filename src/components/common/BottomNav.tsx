import React from 'react';
import { Home, History, Trophy, BarChart3, Building2 } from 'lucide-react';

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
    { id: 'home', label: 'Home', icon: Home },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'stats', label: 'Ranking', icon: BarChart3 },
    { id: 'tournament', label: 'Turnamen', icon: Trophy },
    { id: 'club', label: 'Club', icon: Building2 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-2xl border-t border-line px-3 py-1 select-none flex items-center justify-around shadow-2xl safe-area-pb">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 ${
              isActive ? 'text-text font-bold' : 'text-text-faint hover:text-text-dim'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-red stroke-[2.5]' : 'stroke-[1.75]'}`} />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red" />
              )}
            </div>
            <span className="text-[10px] font-ui tracking-tight mt-1">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

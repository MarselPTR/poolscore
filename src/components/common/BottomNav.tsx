import React from 'react';
import { Home, History } from 'lucide-react';
import { IconEloRanking, IconBracketTree, IconBilliardTable } from './BilliardIcons';

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
    { id: 'history', label: 'History', icon: History },
    { id: 'stats', label: 'Ranking', customIcon: IconEloRanking },
    { id: 'tournament', label: 'Turnamen', customIcon: IconBracketTree },
    { id: 'club', label: 'Club', customIcon: IconBilliardTable },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-line px-2 py-1 select-none flex items-center justify-around shadow-2xl safe-area-pb">
      {items.map((item) => {
        const Icon = item.icon;
        const CustomIcon = item.customIcon;
        const isActive = currentTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-emerald-400 font-bold scale-105' : 'text-text-faint hover:text-text-dim'
            }`}
          >
            {CustomIcon ? <CustomIcon size={18} /> : Icon ? <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} /> : null}
            <span className="text-[10px] font-mono tracking-tight mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

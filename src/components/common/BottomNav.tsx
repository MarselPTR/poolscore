import React from 'react';
import { Home, History, Trophy, BarChart3, LayoutGrid, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { allowedTabs, type TabId } from '../../lib/roles';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isVisible: boolean;
}

const NAV_META: Record<TabId, { label: string; icon: React.ElementType }> = {
  home: { label: 'Beranda', icon: Home },
  history: { label: 'Riwayat', icon: History },
  stats: { label: 'Peringkat', icon: BarChart3 },
  tournament: { label: 'Turnamen', icon: Trophy },
  club: { label: 'Klub', icon: LayoutGrid },
  admin: { label: 'Panel', icon: ShieldCheck },
};

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  isVisible,
}) => {
  const { user } = useAuth();
  if (!isVisible) return null;

  const items = allowedTabs(user).map((id) => ({ id, ...NAV_META[id] }));

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg border-t border-rule select-none safe-area-pb">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
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

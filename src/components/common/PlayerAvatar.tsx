import React from 'react';

// Color map for name-based avatars (clean modern sports tones)
const AVATAR_COLORS = [
  { bg: '#3b82f6', text: '#ffffff' }, // Blue
  { bg: '#e11d48', text: '#ffffff' }, // Crimson
  { bg: '#10b981', text: '#ffffff' }, // Emerald
  { bg: '#f59e0b', text: '#000000' }, // Amber
  { bg: '#8b5cf6', text: '#ffffff' }, // Purple
  { bg: '#06b6d4', text: '#ffffff' }, // Cyan
  { bg: '#ec4899', text: '#ffffff' }, // Pink
  { bg: '#f97316', text: '#ffffff' }, // Orange
  { bg: '#64748b', text: '#ffffff' }, // Slate
];

function getPlayerColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

interface PlayerAvatarProps {
  playerNumber?: 1 | 2;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isActiveTurn?: boolean;
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  playerNumber,
  name = '',
  size = 'md',
  isActiveTurn = false,
  className = '',
}) => {
  const isP1 = playerNumber === 1;

  const color = playerNumber
    ? isP1
      ? { bg: '#e11d48', text: '#ffffff' }
      : { bg: '#2563eb', text: '#ffffff' }
    : getPlayerColor(name || 'Player');

  const initials = name
    ? name
        .trim()
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : playerNumber
    ? `${playerNumber}`
    : 'P';

  const sizeClasses = {
    xs: 'w-6 h-6 text-[11px] rounded-lg',
    sm: 'w-8 h-8 text-xs rounded-xl',
    md: 'w-10 h-10 text-sm rounded-xl',
    lg: 'w-12 h-12 text-base rounded-2xl',
    xl: 'w-16 h-16 text-xl rounded-2xl',
  }[size];

  // Clean, self-contained border that never clips or creates jagged ring-offsets
  const borderClass = isActiveTurn
    ? isP1
      ? 'border-2 border-rose-300 shadow-sm'
      : 'border-2 border-blue-300 shadow-sm'
    : 'border border-white/20';

  return (
    <div
      className={`inline-flex items-center justify-center font-bold tracking-tight select-none shrink-0 transition-transform duration-150 ${sizeClasses} ${borderClass} ${className}`}
      style={{ backgroundColor: color.bg, color: color.text }}
    >
      <span className="leading-none">{initials}</span>
    </div>
  );
};

/** Clean, Professional Leaderboard Rank Badge */
interface RankMedallionProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RankMedallion: React.FC<RankMedallionProps> = ({ rank, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[11px]',
    md: 'w-7 h-7 text-xs',
    lg: 'w-9 h-9 text-sm',
  }[size];

  if (rank === 1) {
    return (
      <div
        className={`inline-flex items-center justify-center font-bold rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 ${sizeClasses}`}
      >
        1
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div
        className={`inline-flex items-center justify-center font-bold rounded-lg bg-zinc-200/15 text-zinc-300 border border-zinc-400/30 ${sizeClasses}`}
      >
        2
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div
        className={`inline-flex items-center justify-center font-bold rounded-lg bg-amber-700/15 text-amber-600 border border-amber-700/30 ${sizeClasses}`}
      >
        3
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center font-medium rounded-lg text-zinc-500 bg-zinc-900/60 border border-zinc-800 ${sizeClasses}`}
    >
      {rank}
    </div>
  );
};

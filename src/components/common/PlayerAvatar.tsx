import React from 'react';

interface PlayerAvatarProps {
  playerNumber?: 1 | 2;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isActiveTurn?: boolean;
  className?: string;
}

/**
 * Initials badge. Colour carries meaning here: red and blue are only used
 * when the badge stands for player 1 or player 2 of a match. Everywhere else
 * (leaderboard, profile, account) it stays neutral.
 */
export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  playerNumber,
  name = '',
  size = 'md',
  isActiveTurn = false,
  className = '',
}) => {
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
    xs: 'w-6 h-6 text-[13px]',
    sm: 'w-8 h-8 text-[15px]',
    md: 'w-10 h-10 text-lg',
    lg: 'w-12 h-12 text-xl',
    xl: 'w-16 h-16 text-3xl',
  }[size];

  const colorClasses =
    playerNumber === 1
      ? 'bg-p1 text-white'
      : playerNumber === 2
      ? 'bg-p2 text-white'
      : 'bg-panel-3 text-ink';

  const ringClass = isActiveTurn ? 'outline outline-2 outline-offset-1 outline-ink' : '';

  return (
    <div
      className={`inline-flex items-center justify-center rounded-[3px] font-display font-semibold select-none shrink-0 ${sizeClasses} ${colorClasses} ${ringClass} ${className}`}
    >
      <span className="leading-none">{initials}</span>
    </div>
  );
};

interface RankMedallionProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
}

/** Leaderboard position. The top three are set in full ink, the rest are muted. */
export const RankMedallion: React.FC<RankMedallionProps> = ({ rank, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 text-base',
    md: 'w-7 text-lg',
    lg: 'w-9 text-2xl',
  }[size];

  return (
    <span
      className={`num inline-block text-center ${sizeClasses} ${rank <= 3 ? 'text-ink' : 'text-ink-3'}`}
    >
      {rank}
    </span>
  );
};

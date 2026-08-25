import React from 'react';

// Billiard pool ball palette mapping
const BALL_PALETTES = [
  { bg1: '#ffe066', bg2: '#f59e0b', bg3: '#b45309', text: '#000', num: 1, name: 'Yellow' },
  { bg1: '#93c5fd', bg2: '#3b82f6', bg3: '#1d4ed8', text: '#fff', num: 2, name: 'Blue' },
  { bg1: '#fca5a5', bg2: '#ef4444', bg3: '#991b1b', text: '#fff', num: 3, name: 'Red' },
  { bg1: '#d8b4fe', bg2: '#a855f7', bg3: '#6b21a8', text: '#fff', num: 4, name: 'Purple' },
  { bg1: '#fdba74', bg2: '#f97316', bg3: '#c2410c', text: '#fff', num: 5, name: 'Orange' },
  { bg1: '#86efac', bg2: '#22c55e', bg3: '#15803d', text: '#fff', num: 6, name: 'Green' },
  { bg1: '#fecdd3', bg2: '#e11d48', bg3: '#881337', text: '#fff', num: 7, name: 'Maroon' },
  { bg1: '#475569', bg2: '#1e293b', bg3: '#090d16', text: '#fff', num: 8, name: 'Black 8' },
  { bg1: '#fef08a', bg2: '#eab308', bg3: '#a16207', text: '#000', num: 9, name: 'Gold 9', isStriped: true },
  { bg1: '#67e8f9', bg2: '#06b6d4', bg3: '#0e7490', text: '#fff', num: 10, name: 'Cyan 10', isStriped: true },
];

function getPlayerPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % BALL_PALETTES.length;
  return BALL_PALETTES[idx];
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
  // If playerNumber is explicitly 1 or 2 (match mode)
  const isP1 = playerNumber === 1;

  const palette = playerNumber
    ? isP1
      ? { bg1: '#ff7a6b', bg2: '#f04a3a', bg3: '#6e0c03', text: '#fff', num: 1 }
      : { bg1: '#80aeff', bg2: '#3f7bfa', bg3: '#082261', text: '#fff', num: 2 }
    : getPlayerPalette(name || 'Player');

  const initials = name
    ? name
        .trim()
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (playerNumber?.toString() || 'P');

  const dimensions = {
    xs: { px: 22, font: 18, discR: 18 },
    sm: { px: 28, font: 20, discR: 20 },
    md: { px: 38, font: 22, discR: 22 },
    lg: { px: 48, font: 24, discR: 24 },
    xl: { px: 64, font: 28, discR: 26 },
  }[size];

  const uniqueId = `ball-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: dimensions.px, height: dimensions.px }}
    >
      {/* Active Glow Ring */}
      {isActiveTurn && (
        <div
          className={`absolute -inset-1 rounded-full blur-[8px] opacity-80 animate-pulse ${
            isP1 ? 'bg-red' : 'bg-blue'
          }`}
        />
      )}

      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full relative z-10 transition-transform duration-300 ${
          isActiveTurn ? 'scale-105' : 'hover:scale-105'
        }`}
      >
        <defs>
          {/* 3D Ball Sphere Gradient */}
          <radialGradient id={`grad-${uniqueId}`} cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor={palette.bg1} />
            <stop offset="40%" stopColor={palette.bg2} />
            <stop offset="85%" stopColor={palette.bg3} />
            <stop offset="100%" stopColor="#040605" />
          </radialGradient>

          {/* Top Specular Glare */}
          <linearGradient id={`shine-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Inner Drop Shadow for White Inset Disc */}
          <filter id={`shadow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Ambient Outer Ring */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke={isActiveTurn ? '#ffffff' : 'rgba(255,255,255,0.15)'}
          strokeWidth={isActiveTurn ? '2.5' : '1'}
        />

        {/* Main 3D Sphere */}
        <circle cx="50" cy="50" r="46" fill={`url(#grad-${uniqueId})`} />

        {/* Gloss Curved Specular Glare (Top-Left) */}
        <ellipse
          cx="38"
          cy="22"
          rx="22"
          ry="11"
          fill={`url(#shine-${uniqueId})`}
          transform="rotate(-25 38 22)"
        />

        {/* Center White Inset Number Disc */}
        <circle
          cx="50"
          cy="50"
          r={dimensions.discR}
          fill="#ffffff"
          filter={`url(#shadow-${uniqueId})`}
        />

        {/* Player Initials / Number Text */}
        <text
          x="50"
          y={50 + dimensions.font * 0.35}
          textAnchor="middle"
          fill="#0f172a"
          fontFamily="'JetBrains Mono', 'Oswald', sans-serif"
          fontWeight="900"
          fontSize={dimensions.font}
          letterSpacing="-0.5"
        >
          {initials}
        </text>
      </svg>
    </div>
  );
};

/** High-Impact Leaderboard Rank Medallion */
interface RankMedallionProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RankMedallion: React.FC<RankMedallionProps> = ({ rank, size = 'md' }) => {
  const sizePx = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }[size];

  if (rank === 1) {
    return (
      <div
        className={`relative rounded-2xl flex items-center justify-center font-display font-black text-black shadow-[0_0_16px_rgba(242,169,59,0.5)] border-2 border-yellow-200 mx-auto ${sizePx}`}
        style={{
          background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #b45309 100%)',
        }}
      >
        <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">1</span>
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div
        className={`relative rounded-2xl flex items-center justify-center font-display font-black text-slate-900 shadow-[0_0_12px_rgba(203,213,225,0.3)] border-2 border-slate-100 mx-auto ${sizePx}`}
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)',
        }}
      >
        <span>2</span>
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div
        className={`relative rounded-2xl flex items-center justify-center font-display font-black text-white shadow-[0_0_12px_rgba(217,119,6,0.3)] border-2 border-amber-500 mx-auto ${sizePx}`}
        style={{
          background: 'linear-gradient(135deg, #fb923c 0%, #d97706 50%, #78350f 100%)',
        }}
      >
        <span>3</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl flex items-center justify-center font-mono font-bold text-text-faint bg-surface-3 border border-line mx-auto ${sizePx}`}
    >
      #{rank}
    </div>
  );
};

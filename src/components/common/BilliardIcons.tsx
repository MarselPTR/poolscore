import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/** 1. Pool Triangle Rack Logo */
export const IconTriangleRack: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} className={className} fill="none">
    {/* Wooden/Aluminum Rack Frame */}
    <path
      d="M24 5 L43 38 C44 40 43 42 41 42 L7 42 C5 42 4 40 5 38 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
      className="text-felt opacity-90"
    />
    {/* Top Row Ball */}
    <circle cx="24" cy="14" r="3.5" fill="#f04a3a" />
    <circle cx="23" cy="13" r="1" fill="#fff" opacity="0.6" />

    {/* Row 2 Balls */}
    <circle cx="20.5" cy="20.5" r="3.5" fill="#f2a93b" />
    <circle cx="27.5" cy="20.5" r="3.5" fill="#3f7bfa" />

    {/* Row 3 Balls */}
    <circle cx="17" cy="27" r="3.5" fill="#9333ea" />
    <circle cx="24" cy="27" r="3.5" fill="#111815" stroke="#fff" strokeWidth="0.5" />
    <circle cx="31" cy="27" r="3.5" fill="#04e2ac" />

    {/* Row 4 Balls */}
    <circle cx="13.5" cy="33.5" r="3.5" fill="#f97316" />
    <circle cx="20.5" cy="33.5" r="3.5" fill="#b91c1c" />
    <circle cx="27.5" cy="33.5" r="3.5" fill="#2563eb" />
    <circle cx="34.5" cy="33.5" r="3.5" fill="#f2a93b" />
  </svg>
);

/** 2. 8-Ball & 9-Ball Tournament Ball */
export const IconBilliardBall: React.FC<IconProps & { number?: number; color?: string }> = ({
  className = 'w-6 h-6',
  size = 24,
  number = 8,
  color = '#111815'
}) => (
  <svg viewBox="0 0 36 36" width={size} height={size} className={className}>
    <defs>
      <radialGradient id={`ball-grad-${number}`} cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
        <stop offset="30%" stopColor={color} />
        <stop offset="100%" stopColor="#050706" />
      </radialGradient>
    </defs>
    <circle cx="18" cy="18" r="16" fill={`url(#ball-grad-${number})`} />
    <ellipse cx="14" cy="10" rx="6" ry="3" fill="#ffffff" opacity="0.4" transform="rotate(-20 14 10)" />
    <circle cx="18" cy="18" r="7" fill="#ffffff" />
    <text x="18" y="21" textAnchor="middle" fill="#000000" fontFamily="monospace" fontWeight="900" fontSize="8.5">
      {number}
    </text>
  </svg>
);

/** 3. Cue Stick Striking Cue Ball (Break Shot) */
export const IconBreakShot: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} className={className} fill="none">
    {/* Cue Ball with Impact Flash */}
    <circle cx="22" cy="14" r="7" fill="#ffffff" />
    <circle cx="20" cy="12" r="2" fill="#e2e8f0" />
    {/* Impact Spark Lines */}
    <path d="M22 4 L22 1 M31 9 L34 7 M31 19 L34 21 M27 6 L30 3" stroke="#f2a93b" strokeWidth="1.5" strokeLinecap="round" />
    {/* Cue Stick Shaft */}
    <path d="M5 31 L14 22" stroke="#d4a373" strokeWidth="3.5" strokeLinecap="round" />
    {/* Carbon / Ferrule Tip */}
    <path d="M14 22 L16.5 19.5" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
    {/* Leather Tip */}
    <circle cx="17.5" cy="18.5" r="1" fill="#1e3a8a" />
  </svg>
);

/** 4. Foul / Scratch (Cue Ball Falling in Pocket) */
export const IconFoulScratch: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} className={className} fill="none">
    {/* Corner Table Pocket Rim */}
    <path d="M6 6 C6 18 18 6 18 6 L30 6 C30 20 20 30 6 30 Z" fill="#0a0e0c" stroke="#f04a3a" strokeWidth="2" />
    {/* Warning Exclamation Badge */}
    <circle cx="25" cy="25" r="7" fill="#f04a3a" />
    <path d="M25 21 L25 25 M25 28 L25 28.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    {/* White Cue Ball sinking */}
    <circle cx="14" cy="14" r="5" fill="#ffffff" opacity="0.9" />
  </svg>
);

/** 5. Ball In Hand (Cue Ball with Positioning Crosshair Target) */
export const IconBallInHand: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} className={className} fill="none">
    {/* Positioning Crosshairs */}
    <circle cx="18" cy="18" r="14" stroke="#04e2ac" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
    <path d="M18 1 L18 7 M18 29 L18 35 M1 18 L7 18 M29 18 L35 18" stroke="#04e2ac" strokeWidth="2" strokeLinecap="round" />
    {/* White Cue Ball */}
    <circle cx="18" cy="18" r="6" fill="#ffffff" filter="drop-shadow(0 0 6px rgba(4,226,172,0.6))" />
    <circle cx="16.5" cy="16.5" r="1.5" fill="#cbd5e1" />
  </svg>
);

/** 6. Table Run-Out (Golden Clearance Flame & 9-Ball) */
export const IconTableRunOut: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} className={className} fill="none">
    {/* Golden Fire Flame */}
    <path
      d="M18 3 C22 10 28 14 28 22 C28 28 23.5 33 18 33 C12.5 33 8 28 8 22 C8 15 13 11 15 8 C15.5 12 18 14 19 15 C19 11 18 6 18 3 Z"
      fill="url(#fire-grad)"
    />
    <defs>
      <linearGradient id="fire-grad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
    </defs>
    {/* Star Clearance Flash */}
    <path d="M18 15 L20 20 L25 20 L21 23 L23 28 L18 25 L13 28 L15 23 L11 20 L16 20 Z" fill="#ffffff" />
  </svg>
);

/** 7. Championship Gold Trophy Cup */
export const IconTrophyCup: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} className={className} fill="none">
    <defs>
      <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>
    {/* Cup Body */}
    <path d="M10 7 L26 7 L24 20 C24 24 21 26 18 26 C15 26 12 24 12 20 Z" fill="url(#gold-grad)" />
    {/* Cup Handles */}
    <path d="M10 10 C6 10 6 17 11 18" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M26 10 C30 10 30 17 25 18" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
    {/* Cup Stem & Base */}
    <path d="M18 26 L18 29 M12 32 L24 32 L22 29 L14 29 Z" fill="url(#gold-grad)" stroke="#b45309" strokeWidth="1.5" />
    {/* Cup Star */}
    <polygon points="18,11 19.5,14.5 23,15 20.5,17.5 21,21 18,19 15,21 15.5,17.5 13,15 16.5,14.5" fill="#ffffff" opacity="0.9" />
  </svg>
);

/** 8. Billiard Arena Table */
export const IconBilliardTable: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} className={className} fill="none">
    {/* Outer Cushion Rail (Wood/Carbon) */}
    <rect x="3" y="7" width="30" height="22" rx="4" fill="#182420" stroke="#2d3f38" strokeWidth="2" />
    {/* Green Table Felt */}
    <rect x="6" y="10" width="24" height="16" rx="2" fill="#1f8a5a" />
    {/* 6 Pockets */}
    <circle cx="6" cy="10" r="2.5" fill="#0a0e0c" />
    <circle cx="30" cy="10" r="2.5" fill="#0a0e0c" />
    <circle cx="6" cy="26" r="2.5" fill="#0a0e0c" />
    <circle cx="30" cy="26" r="2.5" fill="#0a0e0c" />
    <circle cx="18" cy="9.5" r="2" fill="#0a0e0c" />
    <circle cx="18" cy="26.5" r="2" fill="#0a0e0c" />
    {/* Diamond Rail Sights */}
    <rect x="11.5" y="8" width="1" height="1" fill="#f3f1ea" />
    <rect x="23.5" y="8" width="1" height="1" fill="#f3f1ea" />
    <rect x="11.5" y="27" width="1" height="1" fill="#f3f1ea" />
    <rect x="23.5" y="27" width="1" height="1" fill="#f3f1ea" />
  </svg>
);

/** 9. Tournament Bracket Tree */
export const IconBracketTree: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} className={className} fill="none">
    {/* Round 1 Lines */}
    <path d="M5 8 L13 8 L13 14 L20 14" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 20 L13 20 L13 14" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 24 L13 24 L13 30 L20 30" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 36 L13 36 L13 30" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Final Path */}
    <path d="M20 14 L20 22 L28 22" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 30 L20 22" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Trophy Dot */}
    <circle cx="31" cy="22" r="3.5" fill="#f59e0b" />
  </svg>
);

/** 10. TV / Arena Broadcast Screen */
export const IconTVScreen: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} className={className} fill="none">
    {/* TV Screen Frame */}
    <rect x="3" y="6" width="30" height="20" rx="3" fill="#121815" stroke="#3f7bfa" strokeWidth="2" />
    {/* TV Stand Base */}
    <path d="M14 28 L22 28 M18 26 L18 28" stroke="#3f7bfa" strokeWidth="2" strokeLinecap="round" />
    {/* Live Signal Waves */}
    <path d="M10 16 C10 12 26 12 26 16" stroke="#f04a3a" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="18" cy="16" r="2" fill="#f04a3a" />
  </svg>
);

/** 11. Accidental Touch Shield */
export const IconTouchShield: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} className={className} fill="none">
    {/* Futuristic Tech Shield */}
    <path
      d="M18 4 L30 8 C30 20 24 28 18 32 C12 28 6 20 6 8 Z"
      fill="rgba(4, 226, 172, 0.15)"
      stroke="#04e2ac"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Fingerprint / Lock Core */}
    <circle cx="18" cy="16" r="4" fill="#04e2ac" opacity="0.8" />
    <path d="M18 22 L18 26" stroke="#04e2ac" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/** 12. Elo Rating & Leaderboard Stars */
export const IconEloRanking: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} className={className} fill="none">
    {/* Podium Base */}
    <path d="M5 30 L13 30 L13 18 L5 18 Z" fill="#3f7bfa" opacity="0.7" />
    <path d="M14 30 L22 30 L22 10 L14 10 Z" fill="#f59e0b" />
    <path d="M23 30 L31 30 L31 22 L23 22 Z" fill="#f04a3a" opacity="0.7" />
    {/* #1 Crown on Podium 1 */}
    <path d="M15 7 L16 9 L18 6 L20 9 L21 7 L21 10 L15 10 Z" fill="#ffffff" />
  </svg>
);

/** 13. Undo Event Motion Curve */
export const IconUndoMotion: React.FC<IconProps> = ({ className = 'w-6 h-6', size = 24 }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} className={className} fill="none">
    <path
      d="M8 14 L14 8 M8 14 L14 20 M8 14 L22 14 C27 14 30 18 30 23 C30 28 26 31 21 31 L14 31"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

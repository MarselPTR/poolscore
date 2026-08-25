import React from 'react';
import { Modal } from '../common/Modal';
import type { Player } from '../../types';
import { Flame, Award, Zap } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player | null;
  onOpenH2H?: (playerName: string) => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  isOpen,
  onClose,
  player,
  onOpenH2H,
}) => {
  if (!player) return null;

  const winRate = player.matchesCount > 0
    ? ((player.winsCount / player.matchesCount) * 100).toFixed(1)
    : '0.0';

  const totalRacks = player.racksWon + player.racksLost;
  const rackWinRate = totalRacks > 0
    ? ((player.racksWon / totalRacks) * 100).toFixed(1)
    : '0.0';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profil & Statistik Pemain">
      <div className="space-y-4 select-none">
        {/* Player Header */}
        <div className="p-4 rounded-3xl bg-surface-2 border border-line text-center">
          <div className="flex justify-center mb-2">
            <PlayerAvatar name={player.name} size="xl" />
          </div>
          <h3 className="font-display font-bold text-2xl uppercase tracking-wider text-text">
            {player.name}
          </h3>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-3 border border-line text-xs font-mono text-amber mt-1">
            <Award className="w-3.5 h-3.5" />
            <span>Rating Elo: <strong className="text-text font-bold">{player.rating}</strong></span>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-surface-2 border border-line text-center">
            <div className="text-[10px] font-mono uppercase text-text-faint">Total Match</div>
            <div className="font-mono font-bold text-2xl text-text mt-0.5">{player.matchesCount}</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-2 border border-line text-center">
            <div className="text-[10px] font-mono uppercase text-text-faint">Menang / Kalah</div>
            <div className="font-mono font-bold text-2xl text-emerald-400 mt-0.5">
              {player.winsCount} <span className="text-text-faint text-sm font-normal">/ {player.lossesCount}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-2 border border-line text-center col-span-2 sm:col-span-1">
            <div className="text-[10px] font-mono uppercase text-text-faint">Match Win Rate</div>
            <div className="font-mono font-bold text-2xl text-amber mt-0.5">{winRate}%</div>
          </div>
        </div>

        {/* Advanced Rack Stats */}
        <div className="p-4 rounded-2xl bg-surface-2 border border-line space-y-2.5">
          <div className="text-xs font-mono uppercase tracking-wider text-text-faint font-bold">
            Statistik Rack & Skill
          </div>

          <div className="flex items-center justify-between text-xs font-mono py-1 border-b border-line">
            <span className="text-text-dim">Rack Won / Lost:</span>
            <span className="font-bold text-text">
              {player.racksWon} / {player.racksLost} ({rackWinRate}%)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono py-1 border-b border-line">
            <span className="text-text-dim flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-felt" /> Break & Run-Outs:
            </span>
            <span className="font-bold text-felt">{player.breakRunOuts || 0} Kali</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono py-1">
            <span className="text-text-dim flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber" /> Current / Best Win Streak:
            </span>
            <span className="font-bold text-amber">
              {player.winStreak} / {player.bestWinStreak} Match
            </span>
          </div>
        </div>

        {/* Action Button */}
        {onOpenH2H && (
          <button
            onClick={() => {
              onClose();
              onOpenH2H(player.name);
            }}
            className="w-full py-3 rounded-xl bg-felt hover:bg-emerald-600 text-white font-bold font-ui text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            Bandingkan Head-to-Head Pemain Ini
          </button>
        )}
      </div>
    </Modal>
  );
};

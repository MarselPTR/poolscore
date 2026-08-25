import React from 'react';
import { Modal } from '../common/Modal';
import type { Player } from '../../types';
import { Flame, Award, Zap, Swords } from 'lucide-react';
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
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
          <div className="flex justify-center mb-2">
            <PlayerAvatar name={player.name} size="lg" />
          </div>
          <h3 className="font-bold text-xl text-white">
            {player.name}
          </h3>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-rose-400 mt-1 font-medium">
            <Award className="w-3.5 h-3.5" />
            <span>Rating Elo: <strong className="text-white font-bold">{player.rating}</strong></span>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-tabular">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
            <div className="text-[11px] uppercase text-zinc-500 font-semibold">Total Match</div>
            <div className="font-bold text-2xl text-white mt-0.5">{player.matchesCount}</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
            <div className="text-[11px] uppercase text-zinc-500 font-semibold">Menang / Kalah</div>
            <div className="font-bold text-2xl text-white mt-0.5">
              {player.winsCount} <span className="text-zinc-600 text-sm font-normal">/ {player.lossesCount}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-center col-span-2 sm:col-span-1">
            <div className="text-[11px] uppercase text-zinc-500 font-semibold">Win Rate</div>
            <div className="font-bold text-2xl text-rose-400 mt-0.5">{winRate}%</div>
          </div>
        </div>

        {/* Advanced Rack Stats */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
          <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
            Statistik Rack & Keahlian
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/80">
            <span className="text-zinc-400">Rack Menang / Kalah:</span>
            <span className="font-semibold text-white font-tabular">
              {player.racksWon} / {player.racksLost} ({rackWinRate}%)
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/80">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-zinc-400" /> Break & Run-Outs:
            </span>
            <span className="font-semibold text-white font-tabular">{player.breakRunOuts || 0} Kali</span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Rekor Menang Beruntun:
            </span>
            <span className="font-semibold text-rose-400 font-tabular">
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
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Swords className="w-4 h-4" />
            Bandingkan Head-to-Head Pemain Ini
          </button>
        )}
      </div>
    </Modal>
  );
};

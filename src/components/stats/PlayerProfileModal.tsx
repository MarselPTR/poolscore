import React from 'react';
import { Modal } from '../common/Modal';
import type { Player } from '../../types';
import { Trophy, Swords, Zap, Flame } from 'lucide-react';
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

  const rackWinRate = (player.racksWon + player.racksLost) > 0
    ? ((player.racksWon / (player.racksWon + player.racksLost)) * 100).toFixed(1)
    : '0.0';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profil & Statistik Pemain">
      <div className="space-y-4 select-none">
        {/* Profile Card Header */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PlayerAvatar name={player.name} size="lg" />
            <div>
              <div className="font-bold text-lg text-white">
                {player.name}
              </div>
              <div className="text-xs text-zinc-400 font-medium">
                Pemain Terdaftar
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold uppercase text-rose-400">Elo Rating</div>
            <div className="font-mono font-black text-2xl text-white">
              {player.rating}
            </div>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center font-tabular">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="text-xs text-zinc-500 font-medium">Win Rate</div>
            <div className="font-mono font-bold text-lg text-rose-400 mt-0.5">{winRate}%</div>
            <div className="text-[10px] text-zinc-500">{player.winsCount} Menang / {player.lossesCount} Kalah</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="text-xs text-zinc-500 font-medium">Total Match</div>
            <div className="font-mono font-bold text-lg text-white mt-0.5">{player.matchesCount}</div>
            <div className="text-[10px] text-zinc-500">Pertandingan</div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="text-xs text-zinc-500 font-medium">Rack WR</div>
            <div className="font-mono font-bold text-lg text-white mt-0.5">{rackWinRate}%</div>
            <div className="text-[10px] text-zinc-500">{player.racksWon}W / {player.racksLost}L</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/80">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> Turnamen Dimenangkan:
            </span>
            <span className="font-semibold text-white font-tabular">{player.tournamentsWon || 0} Trofi</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/80">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-zinc-400 shrink-0" /> Break & Run-Outs:
            </span>
            <span className="font-semibold text-white font-tabular">{player.breakRunOuts || 0} Kali</span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" /> Rekor Menang Beruntun:
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
            className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 text-center"
          >
            <Swords className="w-4 h-4 shrink-0" />
            <span>Bandingkan Head-to-Head</span>
          </button>
        )}
      </div>
    </Modal>
  );
};

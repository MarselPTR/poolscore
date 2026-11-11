import React from 'react';
import { Modal } from '../common/Modal';
import type { Player } from '../../types';
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

  const stats: { label: string; value: string }[] = [
    { label: 'Menang – kalah', value: `${player.winsCount}–${player.lossesCount}` },
    { label: 'Rack menang – kalah', value: `${player.racksWon}–${player.racksLost}` },
    { label: 'Persentase rack', value: `${rackWinRate}%` },
    { label: 'Beruntun saat ini', value: `${player.winStreak}` },
    { label: 'Beruntun terbaik', value: `${player.bestWinStreak}` },
    { label: 'Break and run', value: `${player.breakRunOuts || 0}` },
    { label: 'Turnamen dimenangkan', value: `${player.tournamentsWon || 0}` },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profil pemain">
      <div className="space-y-5 select-none">
        <div className="flex items-center gap-3">
          <PlayerAvatar name={player.name} size="lg" />
          <div className="min-w-0">
            <div className="display text-3xl truncate">{player.name}</div>
          </div>
        </div>

        {/* Headline figures */}
        <div className="grid grid-cols-3 border-y border-rule divide-x divide-rule">
          <div className="py-3 pr-3">
            <div className="eyebrow">Rating</div>
            <div className="num text-4xl text-ink mt-1.5">{player.rating}</div>
          </div>
          <div className="py-3 px-3">
            <div className="eyebrow">Menang</div>
            <div className="num text-4xl text-ink mt-1.5">
              {winRate}
              <span className="text-xl text-ink-3">%</span>
            </div>
          </div>
          <div className="py-3 pl-3">
            <div className="eyebrow">Main</div>
            <div className="num text-4xl text-ink mt-1.5">{player.matchesCount}</div>
          </div>
        </div>

        <dl className="rows">
          {stats.map((s) => (
            <div key={s.label} className="flex items-baseline justify-between gap-4 py-2">
              <dt className="text-sm text-ink-2">{s.label}</dt>
              <dd className="num text-lg text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>

        {onOpenH2H && (
          <button
            onClick={() => {
              onClose();
              onOpenH2H(player.name);
            }}
            className="btn btn-lg btn-block btn-primary"
          >
            Bandingkan head-to-head
          </button>
        )}
      </div>
    </Modal>
  );
};

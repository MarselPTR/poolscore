import React, { useMemo } from 'react';
import type { Tournament } from '../../types';
import { computePlayerProfile } from '../../lib/ranking';
import { Modal } from '../common/Modal';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { formatTimestampDate } from '../../utils/time';
import { Trophy, Medal, UserCheck } from 'lucide-react';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: { userId?: string; name: string } | null;
  tournaments: Tournament[];
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  isOpen,
  onClose,
  target,
  tournaments,
}) => {
  const profile = useMemo(
    () => (target ? computePlayerProfile(tournaments, target) : null),
    [target, tournaments]
  );

  if (!profile) return null;

  const stats: { label: string; value: string | number }[] = [
    { label: 'Skor rata-rata', value: `${profile.avgPct.toFixed(1)}%` },
    { label: 'Turnamen', value: profile.tournamentsPlayed },
    { label: 'Juara', value: profile.tournamentsWon },
    { label: 'Runner-up', value: profile.runnerUps },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profil pemain">
      <div className="space-y-6 select-none">
        {/* Identity */}
        <div className="flex items-center gap-3">
          <PlayerAvatar name={profile.name} size="lg" />
          <div className="min-w-0">
            <div className="display text-2xl text-ink truncate">{profile.name}</div>
            <div className="text-[13px] text-ink-3 flex items-center gap-1.5">
              {profile.userId ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-ok" /> Pemain terdaftar
                </>
              ) : (
                'Pemain walk-in'
              )}
            </div>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="border border-rule rounded-md p-3 text-center">
              <div className="num text-2xl text-ink tabular-nums">{s.value}</div>
              <div className="eyebrow mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tournament history */}
        <div>
          <h4 className="eyebrow pb-2 border-b border-rule">Riwayat turnamen</h4>
          {profile.history.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-3">
              Belum ada turnamen yang selesai untuk pemain ini.
            </p>
          ) : (
            <div className="rows border-b border-rule">
              {profile.history.map((h) => (
                <div key={h.id} className="flex items-center gap-3 py-2.5">
                  <span className="shrink-0 w-6 flex justify-center">
                    {h.result === 'Juara' ? (
                      <Trophy className="w-4 h-4 text-warn" />
                    ) : h.result === 'Runner-up' ? (
                      <Medal className="w-4 h-4 text-ink-3" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-ink-3/40" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-ink truncate">{h.name}</div>
                    <div className="text-[12px] text-ink-3 truncate">
                      {h.venueName ? `${h.venueName} · ` : ''}
                      {h.gameType} · {formatTimestampDate(h.createdAt)}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold text-ink">{h.result}</div>
                    <div className="text-[12px] text-ink-3 num tabular-nums">{h.pct.toFixed(0)}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

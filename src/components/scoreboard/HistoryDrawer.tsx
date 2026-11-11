import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Match } from '../../types';
import { formatSeconds } from '../../utils/time';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  match,
}) => {
  const [tab, setTab] = useState<'racks' | 'events'>('racks');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log pertandingan">
      <div className="space-y-4 select-none">
        {/* Match recap */}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="eyebrow">
              {match.gameType} · Race to {match.raceTo}
            </div>
            <div className="mt-1.5 flex items-baseline gap-2 text-sm font-semibold">
              <span className="text-p1-ink truncate">{match.player1.name}</span>
              <span className="num text-xl text-ink">
                {match.player1.score}–{match.player2.score}
              </span>
              <span className="text-p2-ink truncate">{match.player2.name}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="eyebrow">Durasi</div>
            <div className="num text-xl text-ink mt-1.5">{formatSeconds(match.durationSeconds)}</div>
          </div>
        </div>

        <div className="tabs">
          <button onClick={() => setTab('racks')} data-on={tab === 'racks'} className="tab">
            Rack ({match.rackHistory.length})
          </button>
          <button onClick={() => setTab('events')} data-on={tab === 'events'} className="tab">
            Kejadian ({match.events.length})
          </button>
        </div>

        {tab === 'racks' && (
          <div className="max-h-[340px] overflow-y-auto rows">
            {match.rackHistory.length === 0 ? (
              <div className="py-8 text-center text-sm text-ink-3">Belum ada rack yang selesai.</div>
            ) : (
              match.rackHistory.map((rack, idx) => {
                const isP1 = rack.winner === 1;
                const winnerName = isP1 ? match.player1.name : match.player2.name;

                return (
                  <div key={idx} className="flex items-center gap-3 py-2.5">
                    <span className={`w-1 self-stretch ${isP1 ? 'bg-p1' : 'bg-p2'}`} />
                    <span className="num text-lg text-ink-3 w-7 text-right">{rack.rackNumber}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-ink truncate">{winnerName}</div>
                      {rack.breaker && (
                        <div className="text-[13px] text-ink-3 truncate">
                          Break: {rack.breaker === 1 ? match.player1.name : match.player2.name}
                          {rack.setNumber && match.targetSets > 1 ? ` · Set ${rack.setNumber}` : ''}
                        </div>
                      )}
                    </div>
                    <span className="num text-base text-ink-2">{formatSeconds(rack.durationSeconds)}</span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === 'events' && (
          <div className="max-h-[340px] overflow-y-auto rows">
            {match.events.length === 0 ? (
              <div className="py-8 text-center text-sm text-ink-3">Belum ada kejadian tercatat.</div>
            ) : (
              match.events.map((evt, idx) => (
                <div key={idx} className="flex items-baseline gap-3 py-2">
                  <span className="num text-sm text-ink-3 w-11 shrink-0">
                    {formatSeconds(Math.floor((evt.timestamp - match.startedAt) / 1000))}
                  </span>
                  <span className="flex-1 text-sm text-ink">{evt.description || 'Aktivitas pertandingan'}</span>
                  {(evt.metadata?.newScore1 !== undefined || evt.metadata?.newScore2 !== undefined) && (
                    <span className="num text-base text-ink-2 shrink-0">
                      {evt.metadata?.newScore1 ?? 0}–{evt.metadata?.newScore2 ?? 0}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

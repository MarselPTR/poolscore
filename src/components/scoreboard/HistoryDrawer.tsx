import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Match } from '../../types';
import { formatSeconds } from '../../utils/time';
import { Clock } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

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
    <Modal isOpen={isOpen} onClose={onClose} title="Riwayat & Timeline Pertandingan">
      <div className="space-y-4 select-none">
        {/* Match Header Recap */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs font-tabular">
          <div>
            <div className="text-zinc-500 uppercase font-semibold text-[11px]">{match.gameType} · Race to {match.raceTo}</div>
            <div className="font-semibold text-white mt-1 flex items-center gap-2">
              <span className="text-rose-400 font-bold">{match.player1.name}</span> ({match.player1.score})
              <span className="text-zinc-600">vs</span>
              <span className="text-blue-400 font-bold">{match.player2.name}</span> ({match.player2.score})
            </div>
          </div>
          <div className="text-right">
            <div className="text-zinc-500 flex items-center gap-1 justify-end text-[11px]">
              <Clock className="w-3 h-3" /> Durasi
            </div>
            <div className="font-mono font-bold text-white mt-0.5">{formatSeconds(match.durationSeconds)}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setTab('racks')}
            className={`flex-1 py-2 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all ${
              tab === 'racks' ? 'border-rose-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Ringkasan Rack ({match.rackHistory.length})
          </button>
          <button
            onClick={() => setTab('events')}
            className={`flex-1 py-2 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all ${
              tab === 'events' ? 'border-rose-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Event Log ({match.events.length})
          </button>
        </div>

        {/* Tab 1: Rack-by-Rack */}
        {tab === 'racks' && (
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {match.rackHistory.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                Belum ada rack yang diselesaikan pada match ini.
              </div>
            ) : (
              match.rackHistory.map((rack) => {
                const isP1 = rack.winner === 1;
                const winnerName = isP1 ? match.player1.name : match.player2.name;

                return (
                  <div
                    key={rack.rackNumber}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                      isP1
                        ? 'border-rose-500/30 bg-rose-500/10'
                        : 'border-blue-500/30 bg-blue-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white">
                        #{rack.rackNumber}
                      </div>
                      <div>
                        <div className="font-semibold flex items-center gap-1.5 text-xs text-white">
                          <PlayerAvatar playerNumber={isP1 ? 1 : 2} size="xs" name={winnerName} />
                          <span className={isP1 ? 'text-rose-300 font-bold' : 'text-blue-300 font-bold'}>{winnerName}</span>
                          <span className="text-zinc-400 font-normal text-[11px]">memenangkan rack</span>
                        </div>
                        {rack.breaker && (
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            Breaker: {rack.breaker === 1 ? match.player1.name : match.player2.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-zinc-400 font-bold">
                      {formatSeconds(rack.durationSeconds)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Events */}
        {tab === 'events' && (
          <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
            {match.events.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                Belum ada aktivitas tercatat.
              </div>
            ) : (
              match.events.map((evt, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500">
                      {formatSeconds(Math.floor((evt.timestamp - match.startedAt) / 1000))}
                    </span>
                    <span className="text-zinc-300 font-sans">
                      {evt.description || 'Aktivitas Match'}
                    </span>
                  </div>
                  {(evt.metadata?.newScore1 !== undefined || evt.metadata?.newScore2 !== undefined) && (
                    <span className="font-bold text-white text-xs">
                      {evt.metadata?.newScore1 ?? 0}-{evt.metadata?.newScore2 ?? 0}
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

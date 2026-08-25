import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Match } from '../../types';
import { formatSeconds } from '../../utils/time';
import { Clock } from 'lucide-react';

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
      <div className="space-y-4">
        {/* Match Header Recap */}
        <div className="p-3 rounded-xl bg-surface-3 border border-line flex items-center justify-between font-mono text-xs">
          <div>
            <div className="text-text-faint uppercase">{match.gameType} · Race to {match.raceTo}</div>
            <div className="font-bold text-text mt-0.5">
              <span className="text-red">🔴 {match.player1.name}</span> ({match.player1.score}) vs{' '}
              <span className="text-blue">🔵 {match.player2.name}</span> ({match.player2.score})
            </div>
          </div>
          <div className="text-right">
            <div className="text-text-faint flex items-center gap-1 justify-end">
              <Clock className="w-3.5 h-3.5" /> Durasi
            </div>
            <div className="font-bold text-text">{formatSeconds(match.durationSeconds)}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-line">
          <button
            onClick={() => setTab('racks')}
            className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all ${
              tab === 'racks' ? 'border-felt text-emerald-400' : 'border-transparent text-text-dim hover:text-text'
            }`}
          >
            Ringkasan Rack ({match.rackHistory.length})
          </button>
          <button
            onClick={() => setTab('events')}
            className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all ${
              tab === 'events' ? 'border-felt text-emerald-400' : 'border-transparent text-text-dim hover:text-text'
            }`}
          >
            Event Log ({match.events.length})
          </button>
        </div>

        {/* Tab 1: Rack-by-Rack */}
        {tab === 'racks' && (
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {match.rackHistory.length === 0 ? (
              <div className="text-center py-8 text-text-faint text-xs font-mono">
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
                        ? 'border-red/30 bg-red/10'
                        : 'border-blue/30 bg-blue/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-surface-3 flex items-center justify-center font-bold text-text">
                        #{rack.rackNumber}
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-1.5 text-sm">
                          <span className={`w-2 h-2 rounded-full ${isP1 ? 'bg-red' : 'bg-blue'}`} />
                          <span className={isP1 ? 'text-red' : 'text-blue'}>{winnerName}</span>
                          <span className="text-text-faint font-normal text-xs">memenangkan rack</span>
                        </div>
                        {rack.breaker && (
                          <div className="text-[11px] text-text-faint mt-0.5">
                            Breaker: {rack.breaker === 1 ? match.player1.name : match.player2.name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-text-dim font-bold">
                      {formatSeconds(rack.durationSeconds)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Chronological Event Log */}
        {tab === 'events' && (
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {match.events.length === 0 ? (
              <div className="text-center py-8 text-text-faint text-xs font-mono">
                Belum ada event log tercatat.
              </div>
            ) : (
              [...match.events].reverse().map((evt) => {
                const timeStr = new Date(evt.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-lg bg-surface-2 border border-line text-xs font-mono flex items-start gap-2.5"
                  >
                    <span className="text-[10px] text-text-faint shrink-0 mt-0.5">{timeStr}</span>
                    <div className="flex-1">
                      <div className="text-text leading-relaxed">{evt.description}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-surface-3 hover:bg-surface-2 text-text font-bold text-xs uppercase font-ui"
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
};

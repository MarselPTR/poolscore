import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Match } from '../../types';
import { formatSeconds, formatTimestampDate } from '../../utils/time';
import { Trophy, Share2, Layers } from 'lucide-react';

interface MatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match | null;
  onOpenShareCard: (match: Match) => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  isOpen,
  onClose,
  match,
  onOpenShareCard,
}) => {
  const [tab, setTab] = useState<'racks' | 'events'>('racks');

  if (!match) return null;

  const winner = match.winner === 1 ? match.player1 : (match.winner === 2 ? match.player2 : null);
  const isMultiSet = match.targetSets && match.targetSets > 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Pertandingan">
      <div className="space-y-4">
        {/* Score Header */}
        <div className="p-4 rounded-2xl bg-surface-2 border border-line text-center">
          <div className="font-mono text-xs text-felt uppercase font-bold tracking-wider">
            {match.gameType} · {isMultiSet ? `BEST OF ${match.targetSets * 2 - 1} SETS (RACE TO ${match.raceTo}/SET)` : `RACE TO ${match.raceTo}`}
          </div>

          <div className="flex items-center justify-center gap-4 my-2">
            <div className="text-right flex-1">
              <div className="font-display font-bold text-lg uppercase text-text truncate">
                {match.player1.name}
              </div>
              <div className="font-mono font-extrabold text-4xl text-red">
                {isMultiSet ? match.player1Sets : match.player1.score}
              </div>
            </div>

            <span className="font-mono text-xl text-text-faint font-bold">—</span>

            <div className="text-left flex-1">
              <div className="font-display font-bold text-lg uppercase text-text truncate">
                {match.player2.name}
              </div>
              <div className="font-mono font-extrabold text-4xl text-blue">
                {isMultiSet ? match.player2Sets : match.player2.score}
              </div>
            </div>
          </div>

          {winner && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-3 text-xs font-mono text-text-dim border border-line mt-1">
              <Trophy className="w-3.5 h-3.5 text-amber" />
              <span>Pemenang: <strong className="text-text">{winner.name}</strong> {isMultiSet ? `(${match.winner === 1 ? match.player1Sets : match.player2Sets} Sets)` : ''}</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 text-xs font-mono text-text-faint mt-3 pt-2 border-t border-line">
            <span>📅 {formatTimestampDate(match.startedAt)}</span>
            <span>⏱ {formatSeconds(match.durationSeconds)}</span>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => {
            onClose();
            onOpenShareCard(match);
          }}
          className="w-full py-2.5 rounded-xl bg-felt hover:bg-emerald-600 text-white font-bold font-ui text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
        >
          <Share2 className="w-4 h-4" />
          Buka Kartu Hasil Skor (Share Card)
        </button>

        {/* Tab switcher */}
        <div className="flex border-b border-line">
          <button
            onClick={() => setTab('racks')}
            className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all ${
              tab === 'racks' ? 'border-felt text-emerald-400' : 'border-transparent text-text-dim'
            }`}
          >
            Daftar Rack ({match.rackHistory.length})
          </button>
          <button
            onClick={() => setTab('events')}
            className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all ${
              tab === 'events' ? 'border-felt text-emerald-400' : 'border-transparent text-text-dim'
            }`}
          >
            Event Log ({match.events.length})
          </button>
        </div>

        {/* Tab 1: Rack summary */}
        {tab === 'racks' && (
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {match.rackHistory.length === 0 ? (
              <div className="text-center py-6 text-text-faint text-xs font-mono">
                Tidak ada rincian per rack yang tersimpan.
              </div>
            ) : (
              match.rackHistory.map((rack, idx) => {
                const isP1 = rack.winner === 1;
                const winnerName = isP1 ? match.player1.name : match.player2.name;

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
                      isP1 ? 'border-red/30 bg-red/10' : 'border-blue/30 bg-blue/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {rack.setNumber && isMultiSet && (
                        <span className="bg-surface-3 px-1.5 py-0.5 rounded text-[10px] text-amber flex items-center gap-0.5">
                          <Layers className="w-2.5 h-2.5" /> S{rack.setNumber}
                        </span>
                      )}
                      <span className="font-bold text-text">Rack #{rack.rackNumber}:</span>
                      <span className={isP1 ? 'text-red font-bold' : 'text-blue font-bold'}>
                        {winnerName}
                      </span>
                    </div>
                    <span className="text-text-faint">{formatSeconds(rack.durationSeconds)}</span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Events */}
        {tab === 'events' && (
          <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
            {match.events.length === 0 ? (
              <div className="text-center py-6 text-text-faint text-xs font-mono">
                Tidak ada riwayat log event.
              </div>
            ) : (
              match.events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-2 rounded-lg bg-surface-2 text-xs font-mono text-text-dim border border-line"
                >
                  {evt.description}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

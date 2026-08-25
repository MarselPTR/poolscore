import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Match } from '../../types';
import { formatSeconds, formatTimestampDate } from '../../utils/time';
import { Trophy, Share2, Layers } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

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
      <div className="space-y-4 select-none">
        {/* Score Header */}
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">
          <div className="text-xs text-rose-400 font-semibold uppercase tracking-wider">
            {match.gameType} · {isMultiSet ? `BEST OF ${match.targetSets * 2 - 1} SETS (RACE TO ${match.raceTo}/SET)` : `RACE TO ${match.raceTo}`}
          </div>

          <div className="flex items-center justify-center gap-4 my-3 font-tabular">
            <div className="text-right flex-1 truncate">
              <div className="flex items-center justify-end gap-2 mb-1">
                <span className="font-semibold text-sm text-white truncate">
                  {match.player1.name}
                </span>
                <PlayerAvatar playerNumber={1} size="xs" name={match.player1.name} />
              </div>
              <div className="font-mono font-black text-3xl sm:text-4xl text-rose-400">
                {isMultiSet ? match.player1Sets : match.player1.score}
              </div>
            </div>

            <span className="font-mono text-xl text-zinc-600 font-bold">:</span>

            <div className="text-left flex-1 truncate">
              <div className="flex items-center justify-start gap-2 mb-1">
                <PlayerAvatar playerNumber={2} size="xs" name={match.player2.name} />
                <span className="font-semibold text-sm text-white truncate">
                  {match.player2.name}
                </span>
              </div>
              <div className="font-mono font-black text-3xl sm:text-4xl text-blue-400">
                {isMultiSet ? match.player2Sets : match.player2.score}
              </div>
            </div>
          </div>

          {winner && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-xs text-zinc-300 border border-zinc-800 mt-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Pemenang: <strong className="text-white font-bold">{winner.name}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Multi-Set Score History Pill */}
        {isMultiSet && match.setHistory && match.setHistory.length > 0 && (
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
            <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 mb-2">
              <Layers className="w-3.5 h-3.5 shrink-0" /> Rekap Skor per Babak (Set History)
            </div>
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              {match.setHistory.map((s, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800/80">
                  <div className="text-[10px] text-zinc-500 font-bold">SET #{s.setNumber}</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    <span className="text-rose-400">{s.player1Score}</span> - <span className="text-blue-400">{s.player2Score}</span>
                  </div>
                  <div className="text-[9px] text-zinc-400 truncate">
                    Menang: {s.winner === 1 ? match.player1.name : match.player2.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Switcher: Racks vs Timeline */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setTab('racks')}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              tab === 'racks'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Daftar Rack ({match.rackHistory.length})
          </button>
          <button
            onClick={() => setTab('events')}
            className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              tab === 'events'
                ? 'border-rose-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Timeline Log ({match.events.length})
          </button>
        </div>

        {/* Tab 1: Rack Details */}
        {tab === 'racks' && (
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {match.rackHistory.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                Tidak ada data rack tercatat.
              </div>
            ) : (
              match.rackHistory.map((rack) => (
                <div
                  key={rack.rackNumber}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-bold">#{rack.rackNumber}</span>
                    <span className="text-white font-sans font-medium">
                      Pemenang: <strong className={rack.winner === 1 ? 'text-rose-400' : 'text-blue-400'}>
                        {rack.winner === 1 ? match.player1.name : match.player2.name}
                      </strong>
                    </span>
                    {rack.breakDetails?.isRunOut && (
                      <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                        B&R
                      </span>
                    )}
                  </div>
                  <span className="text-zinc-500">{formatSeconds(rack.durationSeconds)}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Events Log */}
        {tab === 'events' && (
          <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
            {match.events.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">
                Tidak ada log aktivitas.
              </div>
            ) : (
              match.events.map((evt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-zinc-950/60 text-xs font-mono border border-zinc-800/60"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500">
                      {formatSeconds(Math.floor((evt.timestamp - match.startedAt) / 1000))}
                    </span>
                    <span className="text-zinc-300 font-sans">
                      {evt.description || (
                        evt.type === 'score_adjust' ? `Poin bertambah untuk ${evt.player === 1 ? match.player1.name : match.player2.name}` :
                        evt.type === 'foul' ? `Foul (${evt.metadata?.foulType || ''}) oleh ${evt.player === 1 ? match.player1.name : match.player2.name}` :
                        evt.type === 'break' ? `Break oleh ${evt.player === 1 ? match.player1.name : match.player2.name}` :
                        'Aktivitas Pertandingan'
                      )}
                    </span>
                  </div>
                  {(evt.metadata?.newScore1 !== undefined || evt.metadata?.newScore2 !== undefined) && (
                    <span className="text-zinc-500 text-[10px]">
                      {evt.metadata?.newScore1 ?? 0}-{evt.metadata?.newScore2 ?? 0}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer Meta */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div>
            Tanggal: <span className="text-zinc-300">{formatTimestampDate(match.startedAt)}</span>
          </div>
          <div>
            Durasi: <span className="text-zinc-300 font-mono">{formatSeconds(match.durationSeconds)}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            onClose();
            onOpenShareCard(match);
          }}
          className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 text-center"
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span>Bagikan Hasil Pertandingan</span>
        </button>
      </div>
    </Modal>
  );
};

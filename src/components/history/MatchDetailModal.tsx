import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Match } from '../../types';
import { formatSeconds, formatTimestampDate } from '../../utils/time';
import { Share2 } from 'lucide-react';

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

  const isMultiSet = match.targetSets && match.targetSets > 1;
  const score1 = isMultiSet ? match.player1Sets : match.player1.score;
  const score2 = isMultiSet ? match.player2Sets : match.player2.score;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail pertandingan">
      <div className="space-y-5 select-none">
        {/* Scoreline */}
        <div>
          <div className="eyebrow text-center">
            {match.gameType} ·{' '}
            {isMultiSet
              ? `Best of ${match.targetSets * 2 - 1} set, race to ${match.raceTo} per set`
              : `Race to ${match.raceTo}`}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-3">
            <div className="text-right min-w-0">
              <div
                className={`truncate ${match.winner === 1 ? 'font-semibold text-ink' : 'text-ink-2'}`}
              >
                {match.player1.name}
              </div>
              {match.winner === 1 && <div className="eyebrow !text-p1-ink mt-0.5">Menang</div>}
            </div>
            <div className="num text-6xl whitespace-nowrap">
              <span className="text-p1-ink">{score1}</span>
              <span className="text-ink-3 mx-2">–</span>
              <span className="text-p2-ink">{score2}</span>
            </div>
            <div className="text-left min-w-0">
              <div
                className={`truncate ${match.winner === 2 ? 'font-semibold text-ink' : 'text-ink-2'}`}
              >
                {match.player2.name}
              </div>
              {match.winner === 2 && <div className="eyebrow !text-p2-ink mt-0.5">Menang</div>}
            </div>
          </div>

          <div className="mt-3 text-center text-[13px] text-ink-3 tabular-nums">
            {formatTimestampDate(match.startedAt)} · {formatSeconds(match.durationSeconds)}
          </div>
        </div>

        {/* Per-set scores */}
        {isMultiSet && match.setHistory && match.setHistory.length > 0 && (
          <div>
            <div className="eyebrow pb-2 border-b border-rule">Skor per set</div>
            <div className="rows">
              {match.setHistory.map((s, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2">
                  <span className={`w-1 self-stretch ${s.winner === 1 ? 'bg-p1' : 'bg-p2'}`} />
                  <span className="text-sm text-ink-2 w-12">Set {s.setNumber}</span>
                  <span className="flex-1 text-sm font-semibold text-ink truncate">
                    {s.winner === 1 ? match.player1.name : match.player2.name}
                  </span>
                  <span className="num text-lg text-ink">
                    {s.player1Score}–{s.player2Score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="tabs">
          <button onClick={() => setTab('racks')} data-on={tab === 'racks'} className="tab">
            Rack ({match.rackHistory.length})
          </button>
          <button onClick={() => setTab('events')} data-on={tab === 'events'} className="tab">
            Kejadian ({match.events.length})
          </button>
        </div>

        {tab === 'racks' && (
          <div className="max-h-60 overflow-y-auto rows">
            {match.rackHistory.length === 0 ? (
              <div className="py-6 text-center text-sm text-ink-3">Tidak ada data rack.</div>
            ) : (
              match.rackHistory.map((rack, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2">
                  <span className={`w-1 self-stretch ${rack.winner === 1 ? 'bg-p1' : 'bg-p2'}`} />
                  <span className="num text-lg text-ink-3 w-7 text-right">{rack.rackNumber}</span>
                  <span className="flex-1 text-sm font-semibold text-ink truncate">
                    {rack.winner === 1 ? match.player1.name : match.player2.name}
                  </span>
                  {rack.breakDetails?.isRunOut && <span className="tag">Break and run</span>}
                  <span className="num text-base text-ink-2">{formatSeconds(rack.durationSeconds)}</span>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'events' && (
          <div className="max-h-60 overflow-y-auto rows">
            {match.events.length === 0 ? (
              <div className="py-6 text-center text-sm text-ink-3">Tidak ada kejadian tercatat.</div>
            ) : (
              match.events.map((evt, idx) => (
                <div key={idx} className="flex items-baseline gap-3 py-2">
                  <span className="num text-sm text-ink-3 w-11 shrink-0">
                    {formatSeconds(Math.floor((evt.timestamp - match.startedAt) / 1000))}
                  </span>
                  <span className="flex-1 text-sm text-ink">
                    {evt.description ||
                      (evt.type === 'score_adjust'
                        ? `Penyesuaian skor ${evt.player === 1 ? match.player1.name : match.player2.name}`
                        : evt.type === 'foul'
                        ? `Foul (${evt.metadata?.foulType || ''}) oleh ${evt.player === 1 ? match.player1.name : match.player2.name}`
                        : evt.type === 'break'
                        ? `Break oleh ${evt.player === 1 ? match.player1.name : match.player2.name}`
                        : 'Aktivitas pertandingan')}
                  </span>
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

        <button
          onClick={() => {
            onClose();
            onOpenShareCard(match);
          }}
          className="btn btn-lg btn-block btn-primary"
        >
          <Share2 className="w-4 h-4 shrink-0" />
          Bagikan hasil
        </button>
      </div>
    </Modal>
  );
};

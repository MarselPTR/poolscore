import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import type { Match, Player } from '../../types';
import { db } from '../../db/database';
import { formatTimestampDate } from '../../utils/time';

interface HeadToHeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlayerA?: string;
  initialPlayerB?: string;
}

export const HeadToHeadModal: React.FC<HeadToHeadModalProps> = ({
  isOpen,
  onClose,
  initialPlayerA,
  initialPlayerB,
}) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerA, setPlayerA] = useState<string>(initialPlayerA || 'Andi');
  const [playerB, setPlayerB] = useState<string>(initialPlayerB || 'Budi');
  const [h2hMatches, setH2hMatches] = useState<Match[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const pList = await db.players.toArray();
        setPlayers(pList);
        if (pList.length >= 2) {
          if (!initialPlayerA) setPlayerA(pList[0].name);
          if (!initialPlayerB) setPlayerB(pList[1].name);
        }
      } catch {
        // ignore
      }
    };
    if (isOpen) {
      load();
    }
  }, [isOpen, initialPlayerA, initialPlayerB]);

  useEffect(() => {
    const fetchH2H = async () => {
      if (!playerA || !playerB || playerA === playerB) {
        setH2hMatches([]);
        return;
      }
      try {
        const all = await db.matches.where('status').equals('finished').toArray();
        const matches = all.filter(
          (m) =>
            (m.player1.name.toLowerCase() === playerA.toLowerCase() &&
              m.player2.name.toLowerCase() === playerB.toLowerCase()) ||
            (m.player1.name.toLowerCase() === playerB.toLowerCase() &&
              m.player2.name.toLowerCase() === playerA.toLowerCase())
        );
        setH2hMatches(matches.sort((a, b) => b.startedAt - a.startedAt));
      } catch {
        // ignore
      }
    };
    fetchH2H();
  }, [playerA, playerB]);

  let winsA = 0;
  let winsB = 0;

  h2hMatches.forEach((m) => {
    const isP1A = m.player1.name.toLowerCase() === playerA.toLowerCase();
    if (m.winner === 1) {
      if (isP1A) winsA++;
      else winsB++;
    } else if (m.winner === 2) {
      if (isP1A) winsB++;
      else winsA++;
    }
  });

  const total = winsA + winsB;
  const pctA = total > 0 ? ((winsA / total) * 100).toFixed(1) : '50.0';
  const pctB = total > 0 ? ((winsB / total) * 100).toFixed(1) : '50.0';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Head-to-head">
      <div className="space-y-5 select-none">
        {/* Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="h2h-a" className="label">
              Pemain pertama
            </label>
            <select
              id="h2h-a"
              value={playerA}
              onChange={(e) => setPlayerA(e.target.value)}
              className="field !border-l-4 !border-l-p1"
            >
              {players.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.rating})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="h2h-b" className="label">
              Pemain kedua
            </label>
            <select
              id="h2h-b"
              value={playerB}
              onChange={(e) => setPlayerB(e.target.value)}
              className="field !border-l-4 !border-l-p2"
            >
              {players.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.rating})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Record */}
        <div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <div className="min-w-0">
              <div className="num text-6xl text-p1-ink">{winsA}</div>
              <div className="text-sm text-ink-2 truncate mt-1">{playerA}</div>
            </div>
            <div className="eyebrow pb-1 text-center">
              {total} pertemuan
            </div>
            <div className="min-w-0 text-right">
              <div className="num text-6xl text-p2-ink">{winsB}</div>
              <div className="text-sm text-ink-2 truncate mt-1">{playerB}</div>
            </div>
          </div>

          <div className="w-full h-2 bg-panel-3 flex mt-3" aria-hidden="true">
            {total > 0 && (
              <>
                <div className="bg-p1 h-full" style={{ width: `${pctA}%` }} />
                <div className="bg-p2 h-full" style={{ width: `${pctB}%` }} />
              </>
            )}
          </div>
          {total > 0 && (
            <div className="flex justify-between text-[13px] text-ink-3 tabular-nums mt-1.5">
              <span>{pctA}%</span>
              <span>{pctB}%</span>
            </div>
          )}
        </div>

        {/* Meetings */}
        <div>
          <div className="eyebrow pb-2 border-b border-rule">Riwayat pertemuan</div>

          <div className="max-h-[220px] overflow-y-auto rows">
            {h2hMatches.length === 0 ? (
              <div className="text-center py-6 text-sm text-ink-3">
                {playerA === playerB
                  ? 'Pilih dua pemain yang berbeda.'
                  : 'Kedua pemain ini belum pernah bertemu.'}
              </div>
            ) : (
              h2hMatches.map((m) => {
                const isP1A = m.player1.name.toLowerCase() === playerA.toLowerCase();
                const scoreA = isP1A ? m.player1.score : m.player2.score;
                const scoreB = isP1A ? m.player2.score : m.player1.score;
                const wonA = scoreA > scoreB;

                return (
                  <div key={m.id} className="flex items-center gap-3 py-2">
                    <span className={`w-1 self-stretch ${wonA ? 'bg-p1' : 'bg-p2'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-ink">{m.gameType}</div>
                      <div className="text-[13px] text-ink-3">{formatTimestampDate(m.startedAt)}</div>
                    </div>
                    <div className="num text-xl whitespace-nowrap">
                      <span className={wonA ? 'text-ink' : 'text-ink-3'}>{scoreA}</span>
                      <span className="text-ink-3 mx-1">–</span>
                      <span className={!wonA ? 'text-ink' : 'text-ink-3'}>{scoreB}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

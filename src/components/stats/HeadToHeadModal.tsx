import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import type { Match, Player } from '../../types';
import { db } from '../../db/database';
import { formatTimestampDate } from '../../utils/time';
import { Swords } from 'lucide-react';

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
    <Modal isOpen={isOpen} onClose={onClose} title="Head-to-Head Perbandingan">
      <div className="space-y-4">
        {/* Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase text-red mb-1">
              🔴 Pemain 1
            </label>
            <select
              value={playerA}
              onChange={(e) => setPlayerA(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-2 border border-red/40 text-text font-display uppercase font-bold text-sm focus:outline-none"
            >
              {players.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.rating})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase text-blue mb-1">
              🔵 Pemain 2
            </label>
            <select
              value={playerB}
              onChange={(e) => setPlayerB(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-2 border border-blue/40 text-text font-display uppercase font-bold text-sm focus:outline-none"
            >
              {players.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.rating})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* H2H Score Card */}
        <div className="p-4 rounded-2xl bg-surface-2 border border-line text-center">
          <div className="flex items-center justify-between text-xs font-mono text-text-faint uppercase mb-1">
            <span>🔴 {playerA}</span>
            <span className="font-bold text-text">TOTAL MATCH: {total}</span>
            <span>{playerB} 🔵</span>
          </div>

          <div className="flex items-center justify-center gap-6 my-2">
            <div className="text-center">
              <div className="font-mono font-extrabold text-4xl text-red">{winsA}</div>
              <div className="text-[11px] font-mono text-text-faint">{pctA}% Menang</div>
            </div>

            <Swords className="w-6 h-6 text-text-faint" />

            <div className="text-center">
              <div className="font-mono font-extrabold text-4xl text-blue">{winsB}</div>
              <div className="text-[11px] font-mono text-text-faint">{pctB}% Menang</div>
            </div>
          </div>

          {/* Ratio Bar */}
          <div className="w-full h-2 rounded-full bg-surface-3 overflow-hidden flex mt-3">
            <div className="bg-red h-full" style={{ width: `${pctA}%` }} />
            <div className="bg-blue h-full" style={{ width: `${pctB}%` }} />
          </div>
        </div>

        {/* Recent Mutual Matches */}
        <div>
          <div className="text-xs font-mono uppercase tracking-wider text-text-dim mb-2">
            Riwayat Pertemuan Langsung ({h2hMatches.length})
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {h2hMatches.length === 0 ? (
              <div className="text-center py-6 text-text-faint text-xs font-mono">
                Belum ada catatan pertemuan antara kedua pemain ini.
              </div>
            ) : (
              h2hMatches.map((m) => {
                const isP1A = m.player1.name.toLowerCase() === playerA.toLowerCase();
                const scoreA = isP1A ? m.player1.score : m.player2.score;
                const scoreB = isP1A ? m.player2.score : m.player1.score;
                const wonA = scoreA > scoreB;

                return (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-surface-2 border border-line flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="font-bold uppercase text-text-dim mr-2">{m.gameType}</span>
                      <span className="text-text-faint">{formatTimestampDate(m.startedAt)}</span>
                    </div>
                    <div className="font-bold flex items-center gap-2">
                      <span className={wonA ? 'text-red' : 'text-text-faint'}>{scoreA}</span>
                      <span className="text-text-faint">—</span>
                      <span className={!wonA ? 'text-blue' : 'text-text-faint'}>{scoreB}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          wonA ? 'bg-red/20 text-red' : 'bg-blue/20 text-blue'
                        }`}
                      >
                        {wonA ? playerA : playerB} Wins
                      </span>
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

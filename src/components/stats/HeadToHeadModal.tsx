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
    <Modal isOpen={isOpen} onClose={onClose} title="Perbandingan Head-to-Head">
      <div className="space-y-4 select-none">
        {/* Selectors */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-rose-400 uppercase mb-1.5">
              Pemain 1
            </label>
            <select
              value={playerA}
              onChange={(e) => setPlayerA(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-zinc-950 border border-rose-500/40 text-white font-semibold text-xs focus:outline-none focus:border-rose-500"
            >
              {players.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.rating})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-blue-400 uppercase mb-1.5">
              Pemain 2
            </label>
            <select
              value={playerB}
              onChange={(e) => setPlayerB(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-zinc-950 border border-blue-500/40 text-white font-semibold text-xs focus:outline-none focus:border-blue-500"
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
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-center font-tabular">
          <div className="flex items-center justify-between text-xs text-zinc-500 uppercase font-semibold mb-1">
            <span className="text-rose-400">{playerA}</span>
            <span className="text-white">Total: {total} Match</span>
            <span className="text-blue-400">{playerB}</span>
          </div>

          <div className="flex items-center justify-center gap-6 my-2">
            <div className="text-center">
              <div className="font-mono font-black text-3xl sm:text-4xl text-rose-400">{winsA}</div>
              <div className="text-[11px] text-zinc-500">{pctA}% Menang</div>
            </div>

            <Swords className="w-5 h-5 text-zinc-600" />

            <div className="text-center">
              <div className="font-mono font-black text-3xl sm:text-4xl text-blue-400">{winsB}</div>
              <div className="text-[11px] text-zinc-500">{pctB}% Menang</div>
            </div>
          </div>

          {/* Ratio Bar */}
          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden flex mt-3">
            <div className="bg-rose-500 h-full" style={{ width: `${pctA}%` }} />
            <div className="bg-blue-500 h-full" style={{ width: `${pctB}%` }} />
          </div>
        </div>

        {/* Recent Mutual Matches */}
        <div>
          <div className="text-xs uppercase font-semibold tracking-wider text-zinc-400 mb-2">
            Riwayat Pertemuan Langsung ({h2hMatches.length})
          </div>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {h2hMatches.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs">
                Belum ada data pertemuan antara kedua pemain ini.
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
                    className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <span className="font-bold uppercase text-zinc-300 mr-2">{m.gameType}</span>
                      <span className="text-zinc-500 text-[11px]">{formatTimestampDate(m.startedAt)}</span>
                    </div>

                    <div className="font-bold text-sm">
                      <span className={wonA ? 'text-rose-400 font-black' : 'text-zinc-500'}>
                        {scoreA}
                      </span>
                      <span className="text-zinc-600 mx-1.5">-</span>
                      <span className={!wonA ? 'text-blue-400 font-black' : 'text-zinc-500'}>
                        {scoreB}
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

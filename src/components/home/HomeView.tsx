import React, { useState, useEffect } from 'react';
import { useMatch } from '../../context/MatchContext';
import type { Match } from '../../types';
import { db } from '../../db/database';
import { formatSeconds } from '../../utils/time';
import {
  Play,
  RotateCcw,
  Trophy,
  BarChart2,
  LayoutGrid,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface HomeViewProps {
  onOpenQuickMatch: () => void;
  onSelectTab: (tab: string) => void;
  onOpenMatchDetail: (match: Match) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenQuickMatch,
  onSelectTab,
  onOpenMatchDetail,
}) => {
  const { activeMatch } = useMatch();
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const matches = await db.matches
          .where('status')
          .equals('finished')
          .reverse()
          .limit(5)
          .toArray();
        setRecentMatches(matches);
      } catch {
        // ignore
      }
    };
    fetchRecent();
  }, []);

  const isLive = activeMatch !== null && activeMatch.status === 'in_progress';

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-20 select-none animate-fade-in px-2 sm:px-0">
      {/* Hero: Active Match or Quick Match Launcher */}
      {isLive && activeMatch ? (
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900 border border-rose-500/40 p-5 sm:p-6 shadow-lg shadow-rose-950/20">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
            <span className="flex items-center gap-1.5 font-semibold text-rose-300 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Pertandingan Sedang Berlangsung
            </span>
            <span className="font-mono text-zinc-400">
              {formatSeconds(activeMatch.durationSeconds)}
            </span>
          </div>

          {/* Quick Score Overview */}
          <div className="flex items-center justify-between py-2 font-tabular">
            <div className="flex items-center gap-3">
              <PlayerAvatar playerNumber={1} size="md" name={activeMatch.player1.name} isActiveTurn={activeMatch.currentTurn === 1} />
              <div>
                <div className="font-bold text-base text-white truncate max-w-[120px]">
                  {activeMatch.player1.name}
                </div>
                <div className="text-xs text-zinc-400">Pemain 1</div>
              </div>
            </div>

            <div className="text-center">
              <div className="font-mono font-black text-3xl sm:text-4xl text-white">
                <span className="text-rose-400">{activeMatch.player1.score}</span>
                <span className="text-zinc-600 mx-2">-</span>
                <span className="text-blue-400">{activeMatch.player2.score}</span>
              </div>
              <div className="text-[11px] text-zinc-500 uppercase tracking-wider mt-0.5">
                {activeMatch.gameType} · Race to {activeMatch.raceTo}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-row-reverse text-right">
              <PlayerAvatar playerNumber={2} size="md" name={activeMatch.player2.name} isActiveTurn={activeMatch.currentTurn === 2} />
              <div>
                <div className="font-bold text-base text-white truncate max-w-[120px]">
                  {activeMatch.player2.name}
                </div>
                <div className="text-xs text-zinc-400">Pemain 2</div>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenQuickMatch}
            className="mt-3.5 w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-[0.99]"
          >
            <RotateCcw className="w-4 h-4" />
            Lanjutkan Papan Skor
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Mulai Pertandingan Baru
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Catat skor 8-Ball, 9-Ball, 10-Ball secara instan dengan aturan turnamen resmi.
              </p>
            </div>

            <button
              onClick={onOpenQuickMatch}
              className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-950/40 transition-all active:scale-[0.99]"
            >
              <Play className="w-4 h-4 fill-white" />
              Mulai Quick Match
            </button>
          </div>
        </div>
      )}

      {/* Feature Grid (Unified Clean 3-Column Navigation) */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onSelectTab('tournament')}
          className="p-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 text-left transition-all group active:scale-[0.98]"
        >
          <div className="w-9 h-9 rounded-xl bg-zinc-800/90 flex items-center justify-center mb-3 group-hover:bg-zinc-700 transition-colors">
            <Trophy className="w-4 h-4 text-zinc-300 group-hover:text-rose-400 transition-colors" />
          </div>
          <div className="font-semibold text-xs text-white">Turnamen</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Bagan Bracket</div>
        </button>

        <button
          onClick={() => onSelectTab('stats')}
          className="p-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 text-left transition-all group active:scale-[0.98]"
        >
          <div className="w-9 h-9 rounded-xl bg-zinc-800/90 flex items-center justify-center mb-3 group-hover:bg-zinc-700 transition-colors">
            <BarChart2 className="w-4 h-4 text-zinc-300 group-hover:text-rose-400 transition-colors" />
          </div>
          <div className="font-semibold text-xs text-white">Leaderboard</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Rating Elo</div>
        </button>

        <button
          onClick={() => onSelectTab('club')}
          className="p-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 text-left transition-all group active:scale-[0.98]"
        >
          <div className="w-9 h-9 rounded-xl bg-zinc-800/90 flex items-center justify-center mb-3 group-hover:bg-zinc-700 transition-colors">
            <LayoutGrid className="w-4 h-4 text-zinc-300 group-hover:text-rose-400 transition-colors" />
          </div>
          <div className="font-semibold text-xs text-white">Club Meja</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Multi-Meja</div>
        </button>
      </div>

      {/* Recent Matches Feed */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Riwayat Pertandingan
            </h3>
          </div>
          <button
            onClick={() => onSelectTab('history')}
            className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-0.5 transition-colors"
          >
            Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentMatches.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">
            Belum ada data pertandingan yang tersimpan.
          </div>
        ) : (
          <div className="space-y-1.5">
            {recentMatches.slice(0, 5).map((m) => {
              const isMultiSet = m.targetSets && m.targetSets > 1;

              return (
                <div
                  key={m.id}
                  onClick={() => onOpenMatchDetail(m)}
                  className="py-2.5 px-3 flex items-center justify-between cursor-pointer bg-zinc-950/40 hover:bg-zinc-800/40 rounded-xl border border-zinc-800/60 transition-all group"
                >
                  {/* Player 1 */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <PlayerAvatar playerNumber={1} name={m.player1.name} size="xs" isActiveTurn={m.winner === 1} />
                    <span className={`truncate text-xs ${m.winner === 1 ? 'font-semibold text-white' : 'text-zinc-400'}`}>
                      {m.player1.name}
                    </span>
                  </div>

                  {/* Score Pill */}
                  <div className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 font-mono font-bold text-xs font-tabular text-center mx-2 shrink-0 shadow-sm">
                    <span className={m.winner === 1 ? 'text-rose-500 font-black' : 'text-zinc-400'}>
                      {isMultiSet ? m.player1Sets : m.player1.score}
                    </span>
                    <span className="text-zinc-500 mx-1.5">-</span>
                    <span className={m.winner === 2 ? 'text-blue-500 font-black' : 'text-zinc-400'}>
                      {isMultiSet ? m.player2Sets : m.player2.score}
                    </span>
                  </div>

                  {/* Player 2 */}
                  <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0">
                    <span className={`truncate text-xs text-right ${m.winner === 2 ? 'font-semibold text-white' : 'text-zinc-400'}`}>
                      {m.player2.name}
                    </span>
                    <PlayerAvatar playerNumber={2} name={m.player2.name} size="xs" isActiveTurn={m.winner === 2} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

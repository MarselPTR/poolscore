import React from 'react';
import type { Match } from '../../types';
import { useMatch } from '../../context/MatchContext';
import { Zap, RotateCcw } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { IconTriangleRack, IconBracketTree, IconEloRanking, IconBilliardTable } from '../common/BilliardIcons';

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
  const { activeMatch, recentMatches } = useMatch();

  const isMatchInProgress = activeMatch && activeMatch.status === 'in_progress';

  return (
    <div className="space-y-6 max-w-xl mx-auto py-4 sm:py-8 px-2 pb-16 animate-fade-in select-none">
      {/* Brand Hero Box matching Mockup Screen 01 */}
      <div className="text-center py-6 px-4 rounded-3xl bg-surface-2/60 border border-line-strong backdrop-blur-md shadow-2xl relative overflow-hidden">
        {/* Subtle felt glow ambient */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-felt/20 rounded-full blur-3xl pointer-events-none" />

        {/* Triangle Rack Logo */}
        <div className="flex justify-center mb-3">
          <IconTriangleRack size={42} className="drop-shadow-[0_0_12px_rgba(31,138,90,0.5)]" />
        </div>

        <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-wider text-text">
          PoolScore
        </h2>
        <div className="font-mono text-xs text-text-faint uppercase tracking-[0.2em] mt-1">
          Scoreboard for Pool
        </div>

        {/* Resume Active Match Banner if match is running */}
        {isMatchInProgress ? (
          <div className="mt-5 p-3.5 rounded-2xl bg-felt/15 border border-felt shadow-lg text-left">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400 font-bold mb-1">
              <span className="flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-felt" /> MATCH BERLANGSUNG
              </span>
              <span>RACK {activeMatch.currentRack}</span>
            </div>
            <div className="flex items-center justify-between my-1">
              <span className="font-display font-bold text-lg text-text">
                <span className="text-red">🔴 {activeMatch.player1.name}</span> ({activeMatch.player1.score}) vs{' '}
                <span className="text-blue">🔵 {activeMatch.player2.name}</span> ({activeMatch.player2.score})
              </span>
            </div>
            <button
              onClick={onOpenQuickMatch}
              className="mt-2 w-full py-2.5 rounded-xl bg-felt hover:bg-emerald-600 text-white font-ui font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Lanjutkan Pertandingan (Scoreboard)
            </button>
          </div>
        ) : (
          /* Primary CTA: Quick Match */
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={onOpenQuickMatch}
              className="w-full py-4 rounded-2xl bg-gradient-to-b from-[#23a06a] to-[#1a7d54] hover:brightness-110 text-white font-ui font-bold text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-felt/30 transition-all active:scale-98"
            >
              <Zap className="w-5 h-5 fill-white text-white" />
              ⚡ Quick Match
            </button>

            <div className="text-[11px] font-mono text-text-faint">
              Mulai dalam &lt;10 detik tanpa perlu registrasi / login wajib.
            </div>
          </div>
        )}
      </div>

      {/* Quick Access Grid with Sports Icons */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => onSelectTab('tournament')}
          className="p-3.5 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-line text-center transition-all group"
        >
          <div className="flex justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <IconBracketTree size={24} />
          </div>
          <div className="font-mono font-bold text-[11px] uppercase text-text">Turnamen</div>
          <div className="text-[9px] text-text-faint font-mono">Bagan Bracket</div>
        </button>

        <button
          onClick={() => onSelectTab('stats')}
          className="p-3.5 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-line text-center transition-all group"
        >
          <div className="flex justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <IconEloRanking size={24} />
          </div>
          <div className="font-mono font-bold text-[11px] uppercase text-text">Ranking Elo</div>
          <div className="text-[9px] text-text-faint font-mono">Leaderboard</div>
        </button>

        <button
          onClick={() => onSelectTab('club')}
          className="p-3.5 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-line text-center transition-all group"
        >
          <div className="flex justify-center mb-1.5 group-hover:scale-110 transition-transform">
            <IconBilliardTable size={24} />
          </div>
          <div className="font-mono font-bold text-[11px] uppercase text-text">Club Meja</div>
          <div className="text-[9px] text-text-faint font-mono">Multi-Table</div>
        </button>
      </div>

      {/* Recent Matches Feed */}
      <div className="p-4 rounded-3xl bg-surface-2/70 border border-line">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-xs uppercase tracking-widest text-text-faint font-bold">
            Recent Matches
          </span>
          <button
            onClick={() => onSelectTab('history')}
            className="text-xs font-mono text-felt hover:underline flex items-center gap-0.5"
          >
            Lihat Semua →
          </button>
        </div>

        {recentMatches.length === 0 ? (
          <div className="py-6 text-center text-text-faint font-mono text-xs">
            Belum ada match yang selesai. Tekan Quick Match untuk mulai!
          </div>
        ) : (
          <div className="divide-y divide-line">
            {recentMatches.slice(0, 5).map((m) => (
              <div
                key={m.id}
                onClick={() => onOpenMatchDetail(m)}
                className="py-3 flex items-center justify-between text-xs font-mono cursor-pointer hover:bg-surface-3/50 px-2 rounded-xl transition-all group"
              >
                {/* Player 1 (Red 3D Ball Avatar) */}
                <div className="flex items-center gap-2.5 flex-1 truncate">
                  <PlayerAvatar playerNumber={1} name={m.player1.name} size="sm" isActiveTurn={m.winner === 1} />
                  <span className={`truncate font-semibold ${m.winner === 1 ? 'text-text font-bold' : 'text-text-dim'}`}>
                    {m.player1.name}
                  </span>
                </div>

                {/* Score */}
                <div className="font-mono font-extrabold text-sm text-text-dim px-3 group-hover:text-text transition-colors">
                  <span className={m.winner === 1 ? 'text-red' : 'text-text-dim'}>
                    {m.targetSets && m.targetSets > 1 ? m.player1Sets : m.player1.score}
                  </span>
                  <span className="text-text-faint mx-1.5">—</span>
                  <span className={m.winner === 2 ? 'text-blue' : 'text-text-dim'}>
                    {m.targetSets && m.targetSets > 1 ? m.player2Sets : m.player2.score}
                  </span>
                </div>

                {/* Player 2 (Blue 3D Ball Avatar) */}
                <div className="flex items-center justify-end gap-2.5 flex-1 truncate">
                  <span className={`truncate font-semibold text-right ${m.winner === 2 ? 'text-text' : 'text-text-dim'}`}>
                    {m.player2.name}
                  </span>
                  <PlayerAvatar playerNumber={2} name={m.player2.name} size="sm" isActiveTurn={m.winner === 2} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

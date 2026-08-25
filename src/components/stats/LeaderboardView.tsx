import React, { useState, useEffect } from 'react';
import type { Player } from '../../types';
import { db } from '../../db/database';
import { PlayerProfileModal } from './PlayerProfileModal';
import { HeadToHeadModal } from './HeadToHeadModal';
import { Swords, Search } from 'lucide-react';
import { IconEloRanking, IconTrophyCup } from '../common/BilliardIcons';
import { PlayerAvatar, RankMedallion } from '../common/PlayerAvatar';

export const LeaderboardView: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'winRate' | 'matches'>('rating');
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isH2HOpen, setIsH2HOpen] = useState(false);
  const [h2hPlayerA, setH2hPlayerA] = useState<string>('');

  const fetchPlayers = async () => {
    try {
      const all = await db.players.toArray();
      setPlayers(all);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const filteredPlayers = players
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase().trim()))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'matches') return b.matchesCount - a.matchesCount;
      if (sortBy === 'winRate') {
        const wrA = a.matchesCount > 0 ? a.winsCount / a.matchesCount : 0;
        const wrB = b.matchesCount > 0 ? b.winsCount / b.matchesCount : 0;
        return wrB - wrA;
      }
      return 0;
    });

  const handleOpenH2HFromProfile = (name: string) => {
    setH2hPlayerA(name);
    setIsH2HOpen(true);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-12 animate-fade-in select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2 className="font-display font-bold text-2xl uppercase tracking-wider text-text flex items-center gap-2.5">
            <IconEloRanking size={28} />
            Club Ranking & Leaderboard
          </h2>
          <p className="text-text-dim text-xs mt-0.5">
            Peringkat pemain dihitung otomatis menggunakan sistem kalkulasi Rating Elo berdasarkan setiap kemenangan match.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            setH2hPlayerA('');
            setIsH2HOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line-strong text-text font-bold font-ui text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all self-start sm:self-auto shadow-sm active:scale-95"
        >
          <Swords className="w-4 h-4 text-felt" />
          Head-to-Head
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pemain..."
            className="w-full pl-9 pr-3 py-2 bg-surface-2 border border-line rounded-xl text-xs font-mono text-text placeholder-text-faint focus:outline-none focus:border-felt"
          />
        </div>

        {/* Sort Chips */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none">
          <span className="text-xs font-mono text-text-faint uppercase mr-1">Urutkan:</span>
          <button
            onClick={() => setSortBy('rating')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase transition-all ${
              sortBy === 'rating'
                ? 'border-amber bg-amber/15 text-amber shadow-sm'
                : 'border-line bg-surface-2 text-text-dim hover:text-text'
            }`}
          >
            Rating Elo
          </button>
          <button
            onClick={() => setSortBy('winRate')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase transition-all ${
              sortBy === 'winRate'
                ? 'border-felt bg-felt/20 text-emerald-300 shadow-sm'
                : 'border-line bg-surface-2 text-text-dim hover:text-text'
            }`}
          >
            Win Rate
          </button>
          <button
            onClick={() => setSortBy('matches')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase transition-all ${
              sortBy === 'matches'
                ? 'border-blue bg-blue/20 text-blue shadow-sm'
                : 'border-line bg-surface-2 text-text-dim hover:text-text'
            }`}
          >
            Total Match
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-3xl border border-line bg-surface-2/70 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-surface-3/80 text-text-dim uppercase tracking-wider border-b border-line text-[11px]">
              <tr>
                <th className="py-3 px-4 w-14 text-center">#</th>
                <th className="py-3 px-4">Pemain</th>
                <th className="py-3 px-4 text-center">Rating Elo</th>
                <th className="py-3 px-4 text-center">Win Rate</th>
                <th className="py-3 px-4 text-center">Match (W/L)</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-faint">
                    Belum ada pemain yang terdaftar.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player, idx) => {
                  const wr = player.matchesCount > 0
                    ? ((player.winsCount / player.matchesCount) * 100).toFixed(1)
                    : '0.0';

                  const isTop1 = idx === 0;

                  return (
                    <tr
                      key={player.id}
                      onClick={() => setSelectedPlayer(player)}
                      className="hover:bg-surface-3/60 transition-colors cursor-pointer group"
                    >
                      {/* Rank Medallion (#1 Gold, #2 Silver, #3 Bronze, #4+ Token) */}
                      <td className="py-3.5 px-4 text-center">
                        <RankMedallion rank={idx + 1} size="md" />
                      </td>

                      {/* 3D Billiard Ball Player Avatar & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar name={player.name} size="sm" />
                          <div>
                            <div className="font-display font-bold text-base uppercase text-text tracking-wider group-hover:text-felt transition-colors flex items-center gap-1.5">
                              {player.name}
                              {isTop1 && <IconTrophyCup size={16} className="inline drop-shadow-[0_0_6px_rgba(242,169,59,0.5)]" />}
                            </div>
                            {player.winStreak > 1 && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber/15 text-amber text-[10px] font-mono font-bold mt-0.5 border border-amber/30">
                                🔥 {player.winStreak} Win Streak
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4 text-center font-bold text-sm text-text">
                        <span className={player.rating >= 1500 ? 'text-emerald-400' : 'text-text'}>
                          {player.rating}
                        </span>
                      </td>

                      {/* Win Rate */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-text">{wr}%</div>
                        <div className="w-16 h-1.5 bg-surface-3 rounded-full mx-auto mt-1 overflow-hidden border border-line">
                          <div
                            className="h-full bg-felt rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, parseFloat(wr)))}%` }}
                          />
                        </div>
                      </td>

                      {/* Matches */}
                      <td className="py-3.5 px-4 text-center text-text-dim">
                        <span className="text-text font-semibold">{player.matchesCount}</span> (
                        <span className="text-emerald-400 font-bold">{player.winsCount}</span>/
                        <span className="text-red font-bold">{player.lossesCount}</span>)
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-felt font-bold group-hover:underline text-[11px]">
                          Statistik →
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <PlayerProfileModal
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        player={selectedPlayer}
        onOpenH2H={handleOpenH2HFromProfile}
      />

      <HeadToHeadModal
        isOpen={isH2HOpen}
        onClose={() => setIsH2HOpen(false)}
        initialPlayerA={h2hPlayerA}
      />
    </div>
  );
};

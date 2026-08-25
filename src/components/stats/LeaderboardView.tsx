import React, { useState, useEffect } from 'react';
import type { Player } from '../../types';
import { db } from '../../db/database';
import { PlayerProfileModal } from './PlayerProfileModal';
import { HeadToHeadModal } from './HeadToHeadModal';
import { Swords, Search, Trophy, ChevronRight } from 'lucide-react';
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
    <div className="space-y-5 max-w-4xl mx-auto pb-20 select-none animate-fade-in px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-rose-500" />
            Papan Peringkat & Rating Elo
          </h2>
          <p className="text-zinc-400 text-xs mt-1">
            Kalkulasi rating otomatis berdasarkan performa kemenangan setiap pertandingan.
          </p>
        </div>

        {/* Head-to-Head Action */}
        <button
          onClick={() => {
            setH2hPlayerA('');
            setIsH2HOpen(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all self-start sm:self-auto shadow-sm active:scale-95"
        >
          <Swords className="w-4 h-4 text-zinc-400" />
          Head-to-Head
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pemain..."
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* Sort Chips (Red active state) */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none">
          <span className="text-xs text-zinc-500 mr-1 shrink-0 font-medium">Urutkan:</span>
          <button
            onClick={() => setSortBy('rating')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
              sortBy === 'rating'
                ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Rating Elo
          </button>
          <button
            onClick={() => setSortBy('winRate')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
              sortBy === 'winRate'
                ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Win Rate
          </button>
          <button
            onClick={() => setSortBy('matches')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
              sortBy === 'matches'
                ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Total Match
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 text-zinc-400 uppercase tracking-wider border-b border-zinc-800 text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-3.5 w-12 text-center">#</th>
                <th className="py-3 px-4">Pemain</th>
                <th className="py-3 px-4 text-center">Rating Elo</th>
                <th className="py-3 px-4 text-center">Win Rate</th>
                <th className="py-3 px-4 text-center">Match (W/L)</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-tabular">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Belum ada data pemain terdaftar.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player, idx) => {
                  const wr = player.matchesCount > 0
                    ? ((player.winsCount / player.matchesCount) * 100).toFixed(1)
                    : '0.0';

                  return (
                    <tr
                      key={player.id}
                      onClick={() => setSelectedPlayer(player)}
                      className="hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Rank */}
                      <td className="py-3 px-3.5 text-center">
                        <RankMedallion rank={idx + 1} size="md" />
                      </td>

                      {/* Player Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <PlayerAvatar name={player.name} size="sm" />
                          <div>
                            <div className="font-semibold text-sm text-white group-hover:text-rose-400 transition-colors flex items-center gap-1.5">
                              {player.name}
                            </div>
                            {player.winStreak > 1 && (
                              <div className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium mt-0.5">
                                Rekor {player.winStreak} Menang Beruntun
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-4 text-center font-bold text-sm text-white">
                        <span>{player.rating}</span>
                      </td>

                      {/* Win Rate */}
                      <td className="py-3 px-4 text-center">
                        <div className="font-semibold text-white">{wr}%</div>
                        <div className="w-16 h-1.5 bg-zinc-800 rounded-full mx-auto mt-1 overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, parseFloat(wr)))}%` }}
                          />
                        </div>
                      </td>

                      {/* Matches */}
                      <td className="py-3 px-4 text-center text-zinc-400">
                        <span className="text-white font-medium">{player.matchesCount}</span> (
                        <span className="text-zinc-300 font-medium">{player.winsCount}</span>/
                        <span className="text-zinc-500">{player.lossesCount}</span>)
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <span className="text-zinc-400 group-hover:text-white font-medium text-xs inline-flex items-center gap-0.5 transition-colors">
                          Statistik <ChevronRight className="w-3.5 h-3.5" />
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

import React, { useState, useEffect } from 'react';
import type { Player } from '../../types';
import { db } from '../../db/database';
import { pullInitialDataFromSupabase } from '../../services/supabaseService';
import { PlayerProfileModal } from './PlayerProfileModal';
import { HeadToHeadModal } from './HeadToHeadModal';
import { Search } from 'lucide-react';
import { RankMedallion } from '../common/PlayerAvatar';

type SortKey = 'rating' | 'winRate' | 'matches';

export const LeaderboardView: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [search, setSearch] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isH2HOpen, setIsH2HOpen] = useState(false);
  const [h2hPlayerA, setH2hPlayerA] = useState<string>('');

  const fetchPlayers = async () => {
    try {
      let all = await db.players.toArray();
      if (all.length === 0) {
        await pullInitialDataFromSupabase();
        all = await db.players.toArray();
      }
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

  const sortOptions: { id: SortKey; label: string }[] = [
    { id: 'rating', label: 'Rating' },
    { id: 'winRate', label: 'Menang %' },
    { id: 'matches', label: 'Pertandingan' },
  ];

  const winRateOf = (p: Player) =>
    p.matchesCount > 0 ? ((p.winsCount / p.matchesCount) * 100).toFixed(1) : '0.0';

  return (
    <div className="w-full space-y-6 select-none">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Peringkat</h1>
          <p className="text-sm text-ink-2 mt-1.5">Rating Elo dihitung otomatis setiap pertandingan selesai.</p>
        </div>
        <button
          onClick={() => {
            setH2hPlayerA('');
            setIsH2HOpen(true);
          }}
          className="btn btn-secondary shrink-0"
        >
          Head-to-head
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pemain"
            aria-label="Cari pemain"
            className="field !pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[13px] text-ink-3 shrink-0">Urutkan</span>
          <div className="grid grid-cols-3 gap-1.5 flex-1">
            {sortOptions.map((o) => (
              <button key={o.id} onClick={() => setSortBy(o.id)} data-on={sortBy === o.id} className="opt">
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredPlayers.length === 0 ? (
        <div className="py-16 text-center border-y border-rule">
          <div className="display text-2xl">Belum ada pemain</div>
          <p className="text-sm text-ink-2 mt-2">Pemain muncul di sini setelah pertandingan pertamanya selesai.</p>
        </div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-rule-strong">
              <th className="eyebrow font-semibold py-2 w-10 text-center">#</th>
              <th className="eyebrow font-semibold py-2 pl-2">Pemain</th>
              <th className="eyebrow font-semibold py-2 text-right">Rating</th>
              <th className="eyebrow font-semibold py-2 text-right hidden sm:table-cell">Menang %</th>
              <th className="eyebrow font-semibold py-2 text-right hidden sm:table-cell">M–K</th>
              <th className="eyebrow font-semibold py-2 text-right pr-1 hidden md:table-cell">Main</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player, idx) => {
              const wr = winRateOf(player);
              return (
                <tr
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setSelectedPlayer(player);
                  }}
                  tabIndex={0}
                  className="border-b border-rule hover:bg-panel-2 cursor-pointer"
                >
                  <td className="py-3 text-center">
                    <RankMedallion rank={idx + 1} />
                  </td>
                  <td className="py-3 pl-2 max-w-0 w-full">
                    <div className="font-semibold text-ink truncate">{player.name}</div>
                    <div className="text-[13px] text-ink-3 truncate sm:hidden tabular-nums">
                      {wr}% · {player.winsCount}–{player.lossesCount}
                    </div>
                    {player.winStreak > 1 && (
                      <div className="text-[13px] text-ink-3 hidden sm:block">
                        {player.winStreak} kemenangan beruntun
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-right num text-2xl text-ink pl-3">{player.rating}</td>
                  <td className="py-3 text-right num text-lg text-ink-2 pl-6 hidden sm:table-cell">{wr}</td>
                  <td className="py-3 text-right num text-lg text-ink-2 pl-6 hidden sm:table-cell whitespace-nowrap">
                    {player.winsCount}–{player.lossesCount}
                  </td>
                  <td className="py-3 text-right num text-lg text-ink-2 pl-6 pr-1 hidden md:table-cell">
                    {player.matchesCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

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

import React, { useState, useEffect } from 'react';
import type { Match } from '../../types';
import { db } from '../../db/database';
import { pullInitialDataFromSupabase } from '../../services/supabaseService';
import { formatSeconds, formatTimestampDate, getRelativeGroup } from '../../utils/time';
import { MatchDetailModal } from './MatchDetailModal';
import { MatchRow } from './MatchRow';
import { Search } from 'lucide-react';

interface MatchHistoryViewProps {
  onOpenShareCard: (match: Match) => void;
}

export const MatchHistoryView: React.FC<MatchHistoryViewProps> = ({ onOpenShareCard }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const fetchMatches = async () => {
    try {
      let all = await db.matches
        .where('status')
        .equals('finished')
        .reverse()
        .sortBy('startedAt');

      if (all.length === 0) {
        await pullInitialDataFromSupabase();
        all = await db.matches
          .where('status')
          .equals('finished')
          .reverse()
          .sortBy('startedAt');
      }

      setMatches(all);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const filteredMatches = matches.filter((m) => {
    const matchesGame = selectedGame === 'ALL' || m.gameType === selectedGame;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      m.player1.name.toLowerCase().includes(query) ||
      m.player2.name.toLowerCase().includes(query) ||
      m.id.toLowerCase().includes(query);
    return matchesGame && matchesSearch;
  });

  const groups = ['Hari Ini', 'Kemarin', 'Minggu Ini', 'Lebih Lama'] as const;
  const groupedMatches: Record<string, Match[]> = {};

  filteredMatches.forEach((m) => {
    const grp = getRelativeGroup(m.startedAt);
    if (!groupedMatches[grp]) groupedMatches[grp] = [];
    groupedMatches[grp].push(m);
  });

  const games = ['ALL', '9-Ball', '8-Ball', '10-Ball', 'Straight Pool'];
  const hasAnyMatch = matches.length > 0;

  return (
    <div className="w-full space-y-6 select-none">
      <div className="flex items-end justify-between gap-4">
        <h1 className="page-title">Riwayat</h1>
        <span className="text-sm text-ink-2">
          <b className="num text-lg text-ink">{matches.length}</b> pertandingan
        </span>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pemain atau kode"
            aria-label="Cari pertandingan"
            className="field !pl-9"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {games.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGame(g)}
              data-on={selectedGame === g}
              className="opt shrink-0 !flex-row"
            >
              {g === 'ALL' ? 'Semua' : g}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped list */}
      {filteredMatches.length === 0 ? (
        <div className="py-16 text-center border-y border-rule">
          <div className="display text-2xl">
            {hasAnyMatch ? 'Tidak ada yang cocok' : 'Belum ada pertandingan'}
          </div>
          <p className="text-sm text-ink-2 mt-2 max-w-sm mx-auto">
            {hasAnyMatch
              ? 'Coba kata kunci lain atau ganti filter permainan.'
              : 'Setiap pertandingan yang selesai akan tersimpan di sini.'}
          </p>
        </div>
      ) : (
        groups.map((grpName) => {
          const groupList = groupedMatches[grpName];
          if (!groupList || groupList.length === 0) return null;

          return (
            <section key={grpName}>
              <h2 className="eyebrow pb-2 border-b border-rule-strong">{grpName}</h2>
              <div className="grid sm:grid-cols-2 sm:gap-x-10">
                {groupList.map((m) => (
                  <MatchRow
                    key={m.id}
                    match={m}
                    meta={`${formatTimestampDate(m.startedAt)} · ${formatSeconds(m.durationSeconds)}`}
                    onClick={() => setSelectedMatch(m)}
                    className="border-b border-rule"
                  />
                ))}
              </div>
            </section>
          );
        })
      )}

      <MatchDetailModal
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        match={selectedMatch}
        onOpenShareCard={(m) => {
          setSelectedMatch(null);
          onOpenShareCard(m);
        }}
      />
    </div>
  );
};

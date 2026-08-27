import React, { useState, useEffect } from 'react';
import type { Match } from '../../types';
import { db } from '../../db/database';
import { pullInitialDataFromSupabase } from '../../services/supabaseService';
import { formatSeconds, formatTimestampDate, getRelativeGroup } from '../../utils/time';
import { MatchDetailModal } from './MatchDetailModal';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { Search, History, Calendar, ChevronRight } from 'lucide-react';

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

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-20 select-none animate-fade-in px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-rose-500" />
            Riwayat Pertandingan
          </h2>
          <p className="text-zinc-400 text-xs mt-1">
            Daftar lengkap seluruh rekaman skor match yang tersimpan rapi secara lokal di perangkat.
          </p>
        </div>
        <div className="text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800 self-start sm:self-auto font-medium">
          Total: <strong className="text-white font-bold">{matches.length}</strong> Pertandingan
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pemain / ID..."
            className="w-full pl-9 pr-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>

        {/* Game Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {games.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGame(g)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${selectedGame === g
                  ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Match List */}
      {filteredMatches.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <History className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <div className="font-bold text-base text-white">
            Belum Ada Pertandingan
          </div>
          <div className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Mainkan pertandingan baru melalui Quick Match dan rekaman skor akan otomatis tersimpan di sini.
          </div>
        </div>
      ) : (
        groups.map((grpName) => {
          const groupList = groupedMatches[grpName];
          if (!groupList || groupList.length === 0) return null;

          return (
            <div key={grpName} className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-semibold px-0.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>{grpName}</span>
                <span className="h-[1px] flex-1 bg-zinc-800/80" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {groupList.map((m) => {
                  const isMultiSet = m.targetSets && m.targetSets > 1;

                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMatch(m)}
                      className="p-4 rounded-2xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer shadow-sm select-none group active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
                        <span className="font-semibold text-rose-400 uppercase text-[11px]">
                          {m.gameType} · {isMultiSet ? `BEST OF ${m.targetSets * 2 - 1} SETS` : `RACE TO ${m.raceTo}`}
                        </span>
                        <span className="font-mono text-[11px]">{formatSeconds(m.durationSeconds)}</span>
                      </div>

                      {/* Players & Scores */}
                      <div className="space-y-2 py-0.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <PlayerAvatar playerNumber={1} size="xs" isActiveTurn={m.winner === 1} />
                            <span className={`text-xs truncate ${m.winner === 1 ? 'font-bold text-white' : 'text-zinc-400'}`}>
                              {m.player1.name}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-lg text-rose-400 font-tabular ml-2">
                            {isMultiSet ? m.player1Sets : m.player1.score}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <PlayerAvatar playerNumber={2} size="xs" isActiveTurn={m.winner === 2} />
                            <span className={`text-xs truncate ${m.winner === 2 ? 'font-bold text-white' : 'text-zinc-400'}`}>
                              {m.player2.name}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-lg text-blue-400 font-tabular ml-2">
                            {isMultiSet ? m.player2Sets : m.player2.score}
                          </span>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                        <span className="text-[11px]">{formatTimestampDate(m.startedAt)}</span>
                        <span className="group-hover:text-white transition-colors flex items-center gap-0.5 font-medium text-xs text-zinc-400">
                          Rincian <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Match Detail Modal */}
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

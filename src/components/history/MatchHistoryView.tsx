import React, { useState, useEffect } from 'react';
import type { Match } from '../../types';
import { db } from '../../db/database';
import { formatSeconds, formatTimestampDate, getRelativeGroup } from '../../utils/time';
import { MatchDetailModal } from './MatchDetailModal';
import { PlayerAvatar } from '../common/PlayerAvatar';
import { Search, History, Calendar } from 'lucide-react';

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
      const all = await db.matches
        .where('status')
        .equals('finished')
        .reverse()
        .sortBy('startedAt');
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

  // Group matches by relative date
  const groups = ['Hari Ini', 'Kemarin', 'Minggu Ini', 'Lebih Lama'] as const;
  const groupedMatches: Record<string, Match[]> = {};

  filteredMatches.forEach((m) => {
    const grp = getRelativeGroup(m.startedAt);
    if (!groupedMatches[grp]) groupedMatches[grp] = [];
    groupedMatches[grp].push(m);
  });

  const games = ['ALL', '9-Ball', '8-Ball', '10-Ball', 'Straight Pool'];

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2 className="font-display font-bold text-2xl uppercase tracking-wider text-text flex items-center gap-2">
            <History className="w-6 h-6 text-felt" />
            Riwayat Pertandingan
          </h2>
          <p className="text-text-dim text-xs mt-0.5">
            Daftar lengkap seluruh match yang telah selesai dan tersimpan secara offline di perangkat.
          </p>
        </div>
        <div className="font-mono text-xs text-text-faint">
          Total: <strong className="text-text font-bold">{matches.length}</strong> Pertandingan
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-faint absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pemain / ID match..."
            className="w-full pl-9 pr-3 py-2 bg-surface-2 border border-line rounded-xl text-xs font-mono text-text placeholder-text-faint focus:outline-none focus:border-felt"
          />
        </div>

        {/* Game Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {games.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGame(g)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider transition-all shrink-0 ${
                selectedGame === g
                  ? 'border-felt bg-felt/20 text-emerald-300'
                  : 'border-line bg-surface-2 text-text-dim hover:text-text'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Match List */}
      {filteredMatches.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-2 border border-line">
          <History className="w-12 h-12 text-text-faint mx-auto mb-3 opacity-50" />
          <div className="font-display font-bold text-lg uppercase text-text">
            Belum Ada Pertandingan
          </div>
          <div className="text-xs text-text-dim mt-1 max-w-sm mx-auto">
            Mainkan match baru melalui Quick Match dan hasil skor pertandingan akan otomatis tersimpan di sini.
          </div>
        </div>
      ) : (
        groups.map((grpName) => {
          const groupList = groupedMatches[grpName];
          if (!groupList || groupList.length === 0) return null;

          return (
            <div key={grpName} className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-text-faint">
                <Calendar className="w-3.5 h-3.5" />
                <span>{grpName}</span>
                <span className="h-[1px] flex-1 bg-line" />
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {groupList.map((m) => {
                  const isMultiSet = m.targetSets && m.targetSets > 1;

                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMatch(m)}
                      className="p-3.5 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-line hover:border-line-strong transition-all cursor-pointer shadow-md select-none group"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-text-faint mb-2">
                        <span className="font-bold text-felt uppercase">
                          {m.gameType} · {isMultiSet ? `BEST OF ${m.targetSets * 2 - 1} SETS` : `RACE TO ${m.raceTo}`}
                        </span>
                        <span>{formatSeconds(m.durationSeconds)}</span>
                      </div>

                      {/* Players & Scores */}
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2.5">
                          <PlayerAvatar playerNumber={1} size="xs" isActiveTurn={m.winner === 1} />
                          <span className={`font-display font-bold text-base uppercase ${m.winner === 1 ? 'text-text' : 'text-text-dim'}`}>
                            {m.player1.name}
                          </span>
                        </div>
                        <span className="font-mono font-extrabold text-2xl text-red">
                          {isMultiSet ? m.player1Sets : m.player1.score}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2.5">
                          <PlayerAvatar playerNumber={2} size="xs" isActiveTurn={m.winner === 2} />
                          <span className={`font-display font-bold text-base uppercase ${m.winner === 2 ? 'text-text' : 'text-text-dim'}`}>
                            {m.player2.name}
                          </span>
                        </div>
                        <span className="font-mono font-extrabold text-2xl text-blue">
                          {isMultiSet ? m.player2Sets : m.player2.score}
                        </span>
                      </div>

                      {/* Footer Info */}
                      <div className="mt-2 pt-2 border-t border-line/60 flex items-center justify-between text-[11px] font-mono text-text-faint">
                        <span>{formatTimestampDate(m.startedAt)}</span>
                        <span className="group-hover:text-felt transition-colors flex items-center gap-1">
                          Detail Rack & Share →
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
        onOpenShareCard={onOpenShareCard}
      />
    </div>
  );
};

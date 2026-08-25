import React, { useState, useEffect } from 'react';
import type { ClubTable } from '../../types';
import { db } from '../../db/database';
import { Plus, Clock, Users, Activity, Tv, LayoutGrid } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface ClubViewProps {
  onOpenQuickMatchForTable: (tableNumber: number) => void;
  onOpenTVView: () => void;
}

export const ClubView: React.FC<ClubViewProps> = ({
  onOpenQuickMatchForTable,
  onOpenTVView,
}) => {
  const [tables, setTables] = useState<ClubTable[]>([]);
  const [matchesToday, setMatchesToday] = useState<number>(0);
  const [playersToday, setPlayersToday] = useState<number>(0);

  const fetchClubData = async () => {
    try {
      const allTables = await db.clubTables.toArray();
      setTables(allTables);

      // Matches in the last 24 hours
      const oneDayAgo = Date.now() - 86400000;
      const recent = await db.matches.where('startedAt').above(oneDayAgo).toArray();
      setMatchesToday(recent.length);

      const uniquePlayers = new Set<string>();
      recent.forEach((m) => {
        uniquePlayers.add(m.player1.name);
        uniquePlayers.add(m.player2.name);
      });
      setPlayersToday(uniquePlayers.size);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchClubData();
    const interval = setInterval(fetchClubData, 3000);
    return () => clearInterval(interval);
  }, []);

  const activeTablesCount = tables.filter((t) => t.status === 'LIVE').length;

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-20 select-none animate-fade-in px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <LayoutGrid className="w-6 h-6 text-rose-500" />
            Club Dashboard & Multi-Table Arena
          </h2>
          <p className="text-zinc-400 text-xs mt-1">
            Pantau status operasional dan skor setiap meja billiard di arena Anda secara terpusat.
          </p>
        </div>

        <button
          onClick={onOpenTVView}
          className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all self-start sm:self-auto shadow-sm active:scale-95"
        >
          <Tv className="w-4 h-4 text-zinc-400" />
          Buka Tampilan TV
        </button>
      </div>

      {/* Metrics Row (Unified Clean Neutral Zinc with Crimson Highlight) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-tabular">
        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <div className="text-[11px] text-zinc-500 uppercase font-semibold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-rose-500" /> Meja Live
          </div>
          <div className="font-bold text-2xl text-rose-400 mt-1">
            {activeTablesCount} <span className="text-xs font-normal text-zinc-500">/ {tables.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <div className="text-[11px] text-zinc-500 uppercase font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-400" /> Match (24 Jam)
          </div>
          <div className="font-bold text-2xl text-white mt-1">
            {matchesToday}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <div className="text-[11px] text-zinc-500 uppercase font-semibold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-zinc-400" /> Pemain Aktif
          </div>
          <div className="font-bold text-2xl text-white mt-1">
            {playersToday}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
          <div className="text-[11px] text-zinc-500 uppercase font-semibold flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-400" /> Total Meja
          </div>
          <div className="font-bold text-2xl text-white mt-1">
            {tables.length}
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div>
        <h3 className="font-bold text-base text-white mb-3 px-0.5">
          Daftar Meja Arena
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {tables.map((table) => {
            const isLive = table.status === 'LIVE';

            return (
              <div
                key={table.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isLive
                    ? 'border-rose-500/40 bg-zinc-900 shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                {/* Table Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-sm text-white flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-rose-500 animate-pulse' : 'bg-zinc-600'}`} />
                    {table.name}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                      isLive
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {isLive ? 'LIVE' : 'KOSONG'}
                  </span>
                </div>

                {/* Table Content */}
                {isLive ? (
                  <div className="space-y-2">
                    <div className="text-xs text-rose-400 font-semibold">
                      {table.gameType || 'Match'} Berlangsung
                    </div>

                    {/* Players & Score */}
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                      <div className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <PlayerAvatar playerNumber={1} size="xs" name={table.player1Name} />
                          <span className="font-medium text-white truncate max-w-[110px]">
                            {table.player1Name}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-rose-400 text-sm ml-2">
                          {table.score1 ?? 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs py-1 border-t border-zinc-800/80">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <PlayerAvatar playerNumber={2} size="xs" name={table.player2Name} />
                          <span className="font-medium text-white truncate max-w-[110px]">
                            {table.player2Name}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-blue-400 text-sm ml-2">
                          {table.score2 ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-5 text-center space-y-2.5">
                    <div className="text-xs text-zinc-500">
                      Meja siap digunakan
                    </div>
                    <button
                      onClick={() => onOpenQuickMatchForTable(table.id)}
                      className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium text-xs border border-zinc-700/60 transition-all flex items-center justify-center gap-1.5 mx-auto active:scale-95 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Mulai Match di Meja Ini
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

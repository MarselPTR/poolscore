import React, { useState, useEffect } from 'react';
import type { ClubTable } from '../../types';
import { db } from '../../db/database';
import { Plus, Clock, Users, Activity } from 'lucide-react';
import { IconBilliardTable, IconTVScreen } from '../common/BilliardIcons';
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h2 className="font-display font-bold text-2xl uppercase tracking-wider text-text flex items-center gap-2.5">
            <IconBilliardTable size={28} />
            Club Dashboard & Multi-Table Arena
          </h2>
          <p className="text-text-dim text-xs mt-0.5">
            Pantau seluruh status meja billiard di arena/club Anda secara terpusat.
          </p>
        </div>

        <button
          onClick={onOpenTVView}
          className="px-4 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-line-strong text-text font-bold font-ui text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all self-start sm:self-auto shadow-sm active:scale-95"
        >
          <IconTVScreen size={18} />
          Buka Tampilan TV
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-surface-2 border border-line">
          <div className="text-[11px] font-mono uppercase text-text-faint flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-felt" /> Meja Live
          </div>
          <div className="font-mono font-extrabold text-2xl sm:text-3xl text-emerald-400 mt-1">
            {activeTablesCount} <span className="text-sm font-normal text-text-faint">/ {tables.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-2 border border-line">
          <div className="text-[11px] font-mono uppercase text-text-faint flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue" /> Pertandingan (24h)
          </div>
          <div className="font-mono font-extrabold text-2xl sm:text-3xl text-text mt-1">
            {matchesToday}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-2 border border-line">
          <div className="text-[11px] font-mono uppercase text-text-faint flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber" /> Pemain Aktif
          </div>
          <div className="font-mono font-extrabold text-2xl sm:text-3xl text-text mt-1">
            {playersToday}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-2 border border-line">
          <div className="text-[11px] font-mono uppercase text-text-faint flex items-center gap-1.5">
            <IconBilliardTable size={14} /> Total Meja
          </div>
          <div className="font-mono font-extrabold text-2xl sm:text-3xl text-text mt-1">
            {tables.length}
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div>
        <h3 className="font-display font-bold text-lg uppercase tracking-wider text-text mb-3">
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
                    ? 'border-felt bg-felt/10 shadow-lg shadow-felt/10'
                    : 'border-line bg-surface-2 hover:border-line-strong'
                }`}
              >
                {/* Table Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-bold text-base uppercase text-text flex items-center gap-2">
                    <IconBilliardTable size={20} />
                    {table.name}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider ${
                      isLive
                        ? 'bg-red text-white animate-pulse'
                        : 'bg-surface-3 text-text-dim border border-line'
                    }`}
                  >
                    {isLive ? 'LIVE' : 'FREE'}
                  </span>
                </div>

                {/* Table Content */}
                {isLive ? (
                  <div className="space-y-2">
                    <div className="font-mono text-xs text-felt uppercase font-semibold">
                      {table.gameType || 'Match'} Berlangsung
                    </div>

                    {/* Players & Score */}
                    <div className="p-2.5 rounded-xl bg-surface/80 border border-line">
                      <div className="flex items-center justify-between text-xs font-mono py-1">
                        <div className="flex items-center gap-2">
                          <PlayerAvatar playerNumber={1} size="xs" name={table.player1Name} />
                          <span className="font-bold text-text truncate max-w-[100px]">
                            {table.player1Name}
                          </span>
                        </div>
                        <span className="font-extrabold text-red font-mono text-base">
                          {table.score1 ?? 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono py-1 border-t border-line/50">
                        <div className="flex items-center gap-2">
                          <PlayerAvatar playerNumber={2} size="xs" name={table.player2Name} />
                          <span className="font-bold text-text truncate max-w-[100px]">
                            {table.player2Name}
                          </span>
                        </div>
                        <span className="font-extrabold text-blue font-mono text-base">
                          {table.score2 ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center space-y-2">
                    <div className="text-xs font-mono text-text-faint">
                      Meja sedang kosong & siap digunakan
                    </div>
                    <button
                      onClick={() => onOpenQuickMatchForTable(table.id)}
                      className="px-3.5 py-2 rounded-xl bg-felt/20 hover:bg-felt text-emerald-300 hover:text-white font-bold font-ui text-xs uppercase tracking-wider border border-felt/40 transition-all flex items-center justify-center gap-1.5 mx-auto active:scale-95"
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

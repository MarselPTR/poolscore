import React, { useState, useEffect } from 'react';
import type { ClubTable } from '../../types';
import { db } from '../../db/database';
import { pullInitialDataFromSupabase } from '../../services/supabaseService';
import { Tv } from 'lucide-react';

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
      let allTables = await db.clubTables.toArray();
      if (allTables.length === 0) {
        await pullInitialDataFromSupabase();
        allTables = await db.clubTables.toArray();
      }
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

  const stats = [
    { label: 'Meja dipakai', value: `${activeTablesCount}`, suffix: `/ ${tables.length}` },
    { label: 'Pertandingan 24 jam', value: `${matchesToday}` },
    { label: 'Pemain 24 jam', value: `${playersToday}` },
  ];

  return (
    <div className="w-full space-y-6 select-none">
      <div className="flex items-end justify-between gap-4">
        <h1 className="page-title">Klub</h1>
        <button onClick={onOpenTVView} className="btn btn-secondary shrink-0">
          <Tv className="w-4 h-4" />
          Tampilan TV
        </button>
      </div>

      {/* Figures */}
      <div className="grid grid-cols-3 border-y border-rule divide-x divide-rule">
        {stats.map((s, i) => (
          <div key={s.label} className={`py-3 ${i === 0 ? 'pr-3' : 'px-3'}`}>
            <div className="eyebrow">{s.label}</div>
            <div className="num text-4xl text-ink mt-1.5">
              {s.value}
              {s.suffix && <span className="text-xl text-ink-3 ml-1.5">{s.suffix}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tables.map((table) => {
          const isLive = table.status === 'LIVE';
          const isMaintenance = table.status === 'MAINTENANCE';

          return (
            <div
              key={table.id}
              className={`flex flex-col bg-panel border rounded-[4px] min-h-[150px] ${
                isLive ? 'border-ink' : 'border-rule'
              }`}
            >
              <div className="flex items-center justify-between gap-2 px-3 h-10 border-b border-rule">
                <span className="display text-lg truncate">{table.name}</span>
                <span className={`tag shrink-0 ${isLive ? 'tag-live' : ''}`}>
                  {isLive ? 'Dipakai' : isMaintenance ? 'Perbaikan' : 'Kosong'}
                </span>
              </div>

              {isLive ? (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="rows">
                    <div className="flex items-center gap-2.5 h-11 pr-3">
                      <span className="w-1 self-stretch bg-p1" />
                      <span className="flex-1 truncate text-[15px] text-ink">{table.player1Name}</span>
                      <span className="num text-2xl text-ink">{table.score1 ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-2.5 h-11 pr-3">
                      <span className="w-1 self-stretch bg-p2" />
                      <span className="flex-1 truncate text-[15px] text-ink">{table.player2Name}</span>
                      <span className="num text-2xl text-ink">{table.score2 ?? 0}</span>
                    </div>
                  </div>
                  <div className="px-3 py-2 border-t border-rule text-[13px] text-ink-3">
                    {table.gameType || 'Pertandingan'} sedang berlangsung
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-3">
                  {isMaintenance ? (
                    <span className="text-sm text-ink-3">Tidak tersedia</span>
                  ) : (
                    <button
                      onClick={() => onOpenQuickMatchForTable(table.id)}
                      className="btn btn-secondary btn-block"
                    >
                      Mulai di meja ini
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

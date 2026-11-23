import React, { useState, useEffect } from 'react';
import type { Tournament } from '../../types';
import { db } from '../../db/database';
import { fetchTournamentsFromSupabase } from '../../services/supabaseService';
import { computeGlobalRanking, type RankingEntry } from '../../lib/ranking';
import { Search, Trophy } from 'lucide-react';
import { RankMedallion } from '../common/PlayerAvatar';

export const LeaderboardView: React.FC = () => {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      let tournaments: Tournament[] = await fetchTournamentsFromSupabase();
      if (tournaments.length === 0) {
        tournaments = await db.tournaments.toArray();
      }
      if (cancelled) return;
      setRanking(computeGlobalRanking(tournaments));
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = ranking.filter((r) => r.name.toLowerCase().includes(search.toLowerCase().trim()));

  return (
    <div className="w-full space-y-6 select-none">
      <div>
        <h1 className="page-title">Peringkat</h1>
        <p className="text-sm text-ink-2 mt-1.5">
          Dihitung dari hasil turnamen. Nilai tiap turnamen dinormalkan ke persentase agar bobotnya setara.
        </p>
      </div>

      <div className="relative sm:w-72">
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

      {loading ? (
        <p className="py-16 text-center text-sm text-ink-3">Memuat…</p>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border-y border-rule">
          <div className="display text-2xl">Belum ada peringkat</div>
          <p className="text-sm text-ink-2 mt-2 max-w-md mx-auto">
            Peringkat muncul setelah ada turnamen yang selesai. Pemain diberi poin dari hasil turnamennya.
          </p>
        </div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-rule-strong">
              <th className="eyebrow font-semibold py-2 w-10 text-center">#</th>
              <th className="eyebrow font-semibold py-2 pl-2">Pemain</th>
              <th className="eyebrow font-semibold py-2 text-right">Skor</th>
              <th className="eyebrow font-semibold py-2 text-right hidden sm:table-cell">Juara</th>
              <th className="eyebrow font-semibold py-2 text-right pr-1 hidden sm:table-cell">Turnamen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr key={r.userId || r.name} className="border-b border-rule">
                <td className="py-3 text-center">
                  <RankMedallion rank={idx + 1} />
                </td>
                <td className="py-3 pl-2 max-w-0 w-full">
                  <div className="font-semibold text-ink truncate">{r.name}</div>
                  <div className="text-[13px] text-ink-3 truncate sm:hidden tabular-nums">
                    {r.tournamentsWon} juara · {r.tournamentsPlayed} turnamen
                  </div>
                </td>
                <td className="py-3 text-right num text-2xl text-ink pl-3">
                  {r.avgPct.toFixed(1)}
                  <span className="text-base text-ink-3">%</span>
                </td>
                <td className="py-3 text-right num text-lg text-ink-2 pl-6 hidden sm:table-cell">
                  <span className="inline-flex items-center gap-1 justify-end">
                    {r.tournamentsWon > 0 && <Trophy className="w-3.5 h-3.5 text-ink-3" />}
                    {r.tournamentsWon}
                  </span>
                </td>
                <td className="py-3 text-right num text-lg text-ink-2 pl-6 pr-1 hidden sm:table-cell">
                  {r.tournamentsPlayed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

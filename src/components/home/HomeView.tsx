import React, { useState, useEffect } from 'react';
import type { Match } from '../../types';
import { db } from '../../db/database';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { pullInitialDataFromSupabase } from '../../services/supabaseService';
import { formatSeconds, formatTimestampDate } from '../../utils/time';
import { ChevronRight } from 'lucide-react';
import { MatchRow } from '../history/MatchRow';

interface HomeViewProps {
  onOpenQuickMatch: () => void;
  onSelectTab: (tab: string) => void;
  onOpenMatchDetail: (match: Match) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenQuickMatch,
  onSelectTab,
  onOpenMatchDetail,
}) => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);

  const ownerId = user && !user.isGuest ? user.id : undefined;

  useEffect(() => {
    if (!ownerId) {
      setRecentMatches([]);
      return;
    }
    const fetchRecent = async () => {
      try {
        const mine = async () =>
          (await db.matches.where('status').equals('finished').reverse().sortBy('startedAt'))
            .filter((m) => m.createdBy === ownerId)
            .slice(0, 5);

        let matches = await mine();
        if (matches.length === 0) {
          await pullInitialDataFromSupabase();
          matches = await mine();
        }
        setRecentMatches(matches);
      } catch {
        // ignore
      }
    };
    fetchRecent();
  }, [ownerId]);

  return (
    <div className="w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-start select-none">
      {/* Start a match */}
      <section className="lg:py-6">
        <div className="eyebrow">Papan skor</div>
        <h1 className="display text-4xl sm:text-5xl mt-2">Pertandingan baru</h1>
        <p className="mt-3 text-ink-2 max-w-md">
          Bawaan saat ini: {settings.defaultGame}, race to {settings.defaultRace}. Bisa diubah sebelum
          mulai.
        </p>
        <button onClick={onOpenQuickMatch} className="btn btn-lg btn-primary mt-5 w-full sm:w-auto sm:min-w-64">
          Mulai pertandingan
        </button>
      </section>

      {/* Recent results */}
      <section>
        <div className="flex items-end justify-between pb-2 border-b border-rule-strong">
          <h2 className="eyebrow">Pertandingan terakhir</h2>
          <button
            onClick={() => onSelectTab('history')}
            className="flex items-center gap-0.5 text-[13px] font-medium text-ink-2 hover:text-ink"
          >
            Semua riwayat <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentMatches.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-3">
            Belum ada pertandingan tersimpan. Hasil pertandingan pertama Anda akan muncul di sini.
          </p>
        ) : (
          <div className="rows border-b border-rule">
            {recentMatches.slice(0, 5).map((m) => (
              <MatchRow
                key={m.id}
                match={m}
                meta={`${formatTimestampDate(m.startedAt)} · ${formatSeconds(m.durationSeconds)}`}
                onClick={() => onOpenMatchDetail(m)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

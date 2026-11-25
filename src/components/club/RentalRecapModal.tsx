import React, { useState, useEffect, useMemo } from 'react';
import type { RentalSession } from '../../types';
import { Modal } from '../common/Modal';
import { fetchClosedRentalsSince } from '../../services/supabaseService';
import { formatRupiah } from '../../utils/currency';
import { formatDurationHuman } from '../../utils/time';
import { rentalElapsedSeconds } from '../../lib/billing';

interface RentalRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerId?: string;
}

type Period = 'today' | 'week' | 'month';

const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: 'Hari ini' },
  { id: 'week', label: 'Minggu ini' },
  { id: 'month', label: 'Bulan ini' },
];

/** Start timestamp for each period. Week starts Monday; month starts on the 1st. */
function periodStart(period: Period): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === 'week') {
    const day = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
    d.setDate(d.getDate() - day);
  } else if (period === 'month') {
    d.setDate(1);
  }
  return d.getTime();
}

const timeStr = (ms: number) =>
  new Date(ms).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

const dayStr = (ms: number) =>
  new Date(ms).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

export const RentalRecapModal: React.FC<RentalRecapModalProps> = ({ isOpen, onClose, ownerId }) => {
  const [period, setPeriod] = useState<Period>('today');
  const [sessions, setSessions] = useState<RentalSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) setPeriod('today');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !ownerId) return;
    let cancelled = false;
    setLoading(true);
    fetchClosedRentalsSince(ownerId, periodStart(period)).then((rows) => {
      if (cancelled) return;
      setSessions(rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, ownerId, period]);

  const total = useMemo(() => sessions.reduce((sum, s) => sum + (s.totalCost || 0), 0), [sessions]);
  // Only today's list carries no date prefix; longer ranges show the day.
  const showDay = period !== 'today';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rekap sewa">
      <div className="space-y-5 select-none">
        {/* Period tabs */}
        <div className="flex gap-1 p-1 bg-panel-2 rounded-[4px]">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex-1 h-9 text-sm rounded-[3px] transition-colors ${
                period === p.id ? 'bg-bg text-ink font-semibold shadow-sm' : 'text-ink-3 hover:text-ink'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Total */}
        <div className="flex items-end justify-between gap-3 pb-4 border-b border-rule-strong">
          <div>
            <div className="eyebrow">Total pemasukan</div>
            <div className="num text-4xl text-ink mt-1 tabular-nums">{formatRupiah(total)}</div>
          </div>
          <div className="text-right">
            <div className="num text-2xl text-ink tabular-nums">{sessions.length}</div>
            <div className="eyebrow">sesi selesai</div>
          </div>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-ink-3">Memuat…</p>
        ) : sessions.length === 0 ? (
          <p className="py-10 text-center text-sm text-ink-3">
            Belum ada sewa yang ditutup pada periode ini.
          </p>
        ) : (
          <div className="rows border-b border-rule max-h-[46vh] overflow-y-auto">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-ink truncate">
                    {s.tableName}
                    {s.note && <span className="text-ink-3"> · {s.note}</span>}
                  </div>
                  <div className="text-[12px] text-ink-3 num tabular-nums">
                    {showDay && s.endTime ? `${dayStr(s.endTime)} · ` : ''}
                    {timeStr(s.startTime)}–{s.endTime ? timeStr(s.endTime) : '…'} ·{' '}
                    {s.endTime ? formatDurationHuman(rentalElapsedSeconds(s.startTime, s.endTime)) : '—'}
                  </div>
                </div>
                <div className="shrink-0 text-sm font-semibold text-ink num tabular-nums">
                  {formatRupiah(s.totalCost || 0)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

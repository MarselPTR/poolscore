import React, { useState, useEffect } from 'react';
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

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const timeStr = (ms: number) =>
  new Date(ms).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export const RentalRecapModal: React.FC<RentalRecapModalProps> = ({ isOpen, onClose, ownerId }) => {
  const [sessions, setSessions] = useState<RentalSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !ownerId) return;
    let cancelled = false;
    setLoading(true);
    fetchClosedRentalsSince(ownerId, startOfToday()).then((rows) => {
      if (cancelled) return;
      setSessions(rows);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, ownerId]);

  const total = sessions.reduce((sum, s) => sum + (s.totalCost || 0), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rekap sewa hari ini">
      <div className="space-y-5 select-none">
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
            Belum ada sewa yang ditutup hari ini.
          </p>
        ) : (
          <div className="rows border-b border-rule">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-ink truncate">{s.tableName}</div>
                  <div className="text-[12px] text-ink-3 num tabular-nums">
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

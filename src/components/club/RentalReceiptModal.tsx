import React from 'react';
import type { RentalSession } from '../../types';
import { Modal } from '../common/Modal';
import { formatRupiah } from '../../utils/currency';
import { formatDurationHuman } from '../../utils/time';
import { rentalElapsedSeconds, rentalCost, rentalCostRaw, ROUNDING_STEP } from '../../lib/billing';
import { Clock, Coins } from 'lucide-react';

interface RentalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The active session being closed. */
  session: RentalSession | null;
  /** Billing cut-off (frozen when the receipt opened). */
  endTime: number;
  onConfirm: () => void;
  busy?: boolean;
}

const timeStr = (ms: number) =>
  new Date(ms).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export const RentalReceiptModal: React.FC<RentalReceiptModalProps> = ({
  isOpen,
  onClose,
  session,
  endTime,
  onConfirm,
  busy,
}) => {
  if (!session) return null;

  const seconds = rentalElapsedSeconds(session.startTime, endTime);
  const raw = rentalCostRaw(session.startTime, endTime, session.ratePerHour);
  const total = rentalCost(session.startTime, endTime, session.ratePerHour);
  const rounded = Math.abs(total - raw) >= 1;

  const lines: { label: string; value: string }[] = [
    { label: 'Mulai', value: timeStr(session.startTime) },
    { label: 'Selesai', value: timeStr(endTime) },
    { label: 'Durasi', value: formatDurationHuman(seconds) },
    { label: 'Tarif', value: `${formatRupiah(session.ratePerHour)} / jam` },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tutup sewa" maxWidth="max-w-sm">
      <div className="space-y-5 select-none">
        <div>
          <div className="eyebrow">Meja</div>
          <div className="display text-2xl text-ink mt-0.5">{session.tableName}</div>
        </div>

        <div className="rows border-y border-rule">
          {lines.map((l) => (
            <div key={l.label} className="flex items-center justify-between gap-3 h-11">
              <span className="text-sm text-ink-2">{l.label}</span>
              <span className="text-sm text-ink num tabular-nums">{l.value}</span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border border-ink rounded-[4px] p-4">
          <div className="flex items-center gap-1.5 eyebrow">
            <Coins className="w-3.5 h-3.5" /> Total tagihan
          </div>
          <div className="num text-4xl text-ink mt-1 tabular-nums">{formatRupiah(total)}</div>
          {rounded && (
            <div className="text-[12px] text-ink-3 mt-1">
              Dibulatkan dari {formatRupiah(raw)} (kelipatan {formatRupiah(ROUNDING_STEP)}).
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 text-[13px] text-ink-3">
          <Clock className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Setelah ditutup, sewa tercatat sebagai pemasukan dan meja kembali bebas untuk disewa.</span>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="btn btn-secondary flex-1" disabled={busy}>
            Kembali
          </button>
          <button onClick={onConfirm} className="btn btn-primary flex-1" disabled={busy}>
            {busy ? 'Menutup…' : 'Tutup & tagih'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

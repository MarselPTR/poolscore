import React, { useState, useEffect } from 'react';
import type { RentalSession } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { formatRupiah } from '../../utils/currency';
import { formatDurationHuman } from '../../utils/time';
import { rentalElapsedSeconds, rentalCost, rentalCostRaw, ROUNDING_STEP } from '../../lib/billing';
import { shareReceipt, printReceipt } from '../../utils/receipt';
import { Clock, Coins, Check, Share2, Printer, User } from 'lucide-react';

interface RentalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The active session being closed. */
  session: RentalSession | null;
  /** Billing cut-off (frozen when the receipt opened). */
  endTime: number;
  venueName?: string;
  /** Persist the close. Returns true on success. */
  onConfirm: () => Promise<boolean>;
  busy?: boolean;
}

const timeStr = (ms: number) =>
  new Date(ms).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export const RentalReceiptModal: React.FC<RentalReceiptModalProps> = ({
  isOpen,
  onClose,
  session,
  endTime,
  venueName,
  onConfirm,
  busy,
}) => {
  const { success, warning } = useToast();
  const [done, setDone] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDone(false);
      setWorking(false);
    }
  }, [isOpen]);

  if (!session) return null;

  const seconds = rentalElapsedSeconds(session.startTime, endTime);
  const raw = rentalCostRaw(session.startTime, endTime, session.ratePerHour);
  const total = rentalCost(session.startTime, endTime, session.ratePerHour);
  const rounded = Math.abs(total - raw) >= 1;

  // The finalized session, used for sharing / printing the struk.
  const finalSession: RentalSession = { ...session, endTime, status: 'closed', totalCost: total };

  const lines: { label: string; value: string }[] = [
    ...(session.note ? [{ label: 'Nama', value: session.note }] : []),
    { label: 'Mulai', value: timeStr(session.startTime) },
    { label: 'Selesai', value: timeStr(endTime) },
    { label: 'Durasi', value: formatDurationHuman(seconds) },
    { label: 'Tarif', value: `${formatRupiah(session.ratePerHour)} / jam` },
  ];

  const handleConfirm = async () => {
    setWorking(true);
    const ok = await onConfirm();
    setWorking(false);
    if (ok) setDone(true);
  };

  const handleShare = async () => {
    const res = await shareReceipt(finalSession, venueName);
    if (res === 'copied') success('Struk tersalin', 'Tempel di WhatsApp atau catatan.');
    else if (res === 'failed') warning('Tidak bisa membagikan', 'Coba salin manual.');
  };

  const handlePrint = () => {
    const ok = printReceipt(finalSession, venueName);
    if (!ok) warning('Jendela cetak diblokir', 'Izinkan pop-up untuk mencetak struk.');
  };

  const busyAny = busy || working;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={done ? 'Struk' : 'Tutup sewa'} maxWidth="max-w-sm">
      <div className="space-y-5 select-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="eyebrow">Meja</div>
            <div className="display text-2xl text-ink mt-0.5">{session.tableName}</div>
          </div>
          {done && (
            <span className="inline-flex items-center gap-1.5 text-ok text-sm shrink-0 mt-1">
              <Check className="w-4 h-4" /> Lunas
            </span>
          )}
        </div>

        {session.note && !done && (
          <div className="flex items-center gap-2 text-sm text-ink-2 -mt-2">
            <User className="w-3.5 h-3.5 text-ink-3" /> {session.note}
          </div>
        )}

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

        {done ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleShare} className="btn btn-secondary">
                <Share2 className="w-4 h-4" /> Bagikan
              </button>
              <button onClick={handlePrint} className="btn btn-secondary">
                <Printer className="w-4 h-4" /> Cetak
              </button>
            </div>
            <button onClick={onClose} className="btn btn-primary btn-block">
              Selesai
            </button>
          </>
        ) : (
          <>
            <div className="flex items-start gap-2 text-[13px] text-ink-3">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Setelah ditutup, sewa tercatat sebagai pemasukan dan meja kembali bebas untuk disewa.</span>
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn btn-secondary flex-1" disabled={busyAny}>
                Kembali
              </button>
              <button onClick={handleConfirm} className="btn btn-primary flex-1" disabled={busyAny}>
                {busyAny ? 'Menutup…' : 'Tutup & tagih'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

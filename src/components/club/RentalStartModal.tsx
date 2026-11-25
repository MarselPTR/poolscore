import React, { useState, useEffect } from 'react';
import type { ClubTable } from '../../types';
import { Modal } from '../common/Modal';
import { formatRupiah } from '../../utils/currency';
import { DEFAULT_TABLE_RATE } from '../../lib/billing';
import { Coins, Play, Pencil } from 'lucide-react';

interface RentalStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: ClubTable | null;
  /** Open the tariff editor for this table. */
  onEditRate: () => void;
  onStart: (note: string) => void | Promise<void>;
  busy?: boolean;
}

export const RentalStartModal: React.FC<RentalStartModalProps> = ({
  isOpen,
  onClose,
  table,
  onEditRate,
  onStart,
  busy,
}) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) setNote('');
  }, [isOpen]);

  if (!table) return null;
  const rate = table.ratePerHour ?? DEFAULT_TABLE_RATE;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buka sewa" maxWidth="max-w-sm">
      <div className="space-y-5 select-none">
        <div>
          <div className="eyebrow">Meja</div>
          <div className="display text-2xl text-ink mt-0.5">{table.name}</div>
        </div>

        {/* Tariff */}
        <button
          onClick={onEditRate}
          className="w-full flex items-center justify-between gap-3 border border-rule rounded-[4px] px-3 py-2.5 hover:border-rule-strong"
        >
          <span className="inline-flex items-center gap-2 text-sm text-ink-2">
            <Coins className="w-4 h-4 text-ink-3" /> Tarif
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="num text-ink tabular-nums">{formatRupiah(rate)}</span>
            <span className="text-ink-3 text-sm">/jam</span>
            <Pencil className="w-3.5 h-3.5 text-ink-3" />
          </span>
        </button>

        {/* Optional customer name / note */}
        <div>
          <label htmlFor="note" className="eyebrow">
            Nama pelanggan / catatan <span className="text-ink-3 normal-case">(opsional)</span>
          </label>
          <input
            id="note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={60}
            placeholder="mis. Budi / Meja bos / booking jam 8"
            className="field mt-1.5"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !busy) onStart(note.trim());
            }}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn btn-secondary flex-1" disabled={busy}>
            Batal
          </button>
          <button onClick={() => onStart(note.trim())} className="btn btn-primary flex-1" disabled={busy}>
            <Play className="w-4 h-4" /> {busy ? 'Membuka…' : 'Mulai sewa'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

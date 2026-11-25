import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { formatRupiah } from '../../utils/currency';
import { DEFAULT_TABLE_RATE } from '../../lib/billing';

interface RentalRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Small line under the title (e.g. table name or a hint). */
  subtitle?: string;
  initialRate?: number;
  saveLabel?: string;
  onSave: (ratePerHour: number) => void | Promise<void>;
  busy?: boolean;
}

const PRESETS = [15000, 20000, 25000, 30000, 40000, 50000];

export const RentalRateModal: React.FC<RentalRateModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  initialRate,
  saveLabel = 'Simpan tarif',
  onSave,
  busy,
}) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (isOpen) setValue(String(initialRate ?? DEFAULT_TABLE_RATE));
  }, [isOpen, initialRate]);

  const rate = parseInt(value, 10);
  const valid = Number.isFinite(rate) && rate >= 0 && rate <= 10_000_000;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="space-y-5 select-none">
        {subtitle && <p className="text-sm text-ink-2 -mt-1">{subtitle}</p>}

        <div>
          <label htmlFor="rate" className="eyebrow">
            Tarif per jam
          </label>
          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 text-sm pointer-events-none">
              Rp
            </span>
            <input
              id="rate"
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="field !pl-10 num text-lg"
              autoFocus
            />
          </div>
          {valid && <p className="text-[13px] text-ink-3 mt-1.5">{formatRupiah(rate)} / jam</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setValue(String(p))}
              className={`btn btn-sm ${rate === p ? 'btn-primary' : 'btn-secondary'}`}
            >
              {(p / 1000).toLocaleString('id-ID')}rb
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="btn btn-secondary flex-1" disabled={busy}>
            Batal
          </button>
          <button
            onClick={() => valid && onSave(rate)}
            className="btn btn-primary flex-1"
            disabled={!valid || busy}
          >
            {busy ? 'Menyimpan…' : saveLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

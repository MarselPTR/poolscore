import React, { useState, useEffect } from 'react';
import type { ClubTable } from '../../types';
import { Modal } from '../common/Modal';
import { formatRupiah } from '../../utils/currency';
import { DEFAULT_TABLE_RATE } from '../../lib/billing';

interface RentalRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: ClubTable | null;
  onSave: (ratePerHour: number) => void | Promise<void>;
  busy?: boolean;
}

const PRESETS = [15000, 20000, 25000, 30000, 40000, 50000];

export const RentalRateModal: React.FC<RentalRateModalProps> = ({
  isOpen,
  onClose,
  table,
  onSave,
  busy,
}) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (isOpen && table) {
      setValue(String(table.ratePerHour ?? DEFAULT_TABLE_RATE));
    }
  }, [isOpen, table]);

  if (!table) return null;

  const rate = parseInt(value, 10);
  const valid = Number.isFinite(rate) && rate >= 0 && rate <= 10_000_000;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tarif sewa" maxWidth="max-w-sm">
      <div className="space-y-5 select-none">
        <div>
          <div className="eyebrow">Meja</div>
          <div className="display text-xl text-ink mt-0.5">{table.name}</div>
        </div>

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
            {busy ? 'Menyimpan…' : 'Simpan tarif'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

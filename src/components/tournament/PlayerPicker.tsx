import React, { useState, useRef, useEffect } from 'react';
import { UserCheck } from 'lucide-react';
import { searchPlayers, type PlayerSearchResult } from '../../services/supabaseService';

interface PlayerPickerProps {
  index: number;
  value: string;
  /** True when this slot is linked to a registered account. */
  linked: boolean;
  /** Free typing = a walk-in name (parent clears any account link). */
  onChangeName: (name: string) => void;
  /** Picking a search result links the slot to that account. */
  onPick: (userId: string, name: string) => void;
}

/**
 * Participant input: type a walk-in name freely, or search registered players
 * and pick one to link the entry to a real account. Search uses the safe
 * server function (name/username only, no personal data).
 */
export const PlayerPicker: React.FC<PlayerPickerProps> = ({ index, value, linked, onChangeName, onPick }) => {
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const runSearch = (q: string) => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      const r = await searchPlayers(q);
      setResults(r);
      setOpen(r.length > 0);
    }, 300);
  };

  return (
    <div ref={boxRef} className="relative flex-1 min-w-0">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChangeName(e.target.value);
          runSearch(e.target.value);
        }}
        onFocus={() => {
          if (results.length) setOpen(true);
        }}
        placeholder={`Pemain ${index + 1}`}
        aria-label={`Nama peserta ${index + 1}`}
        className={`field !h-9 !text-sm ${linked ? '!pr-8' : ''}`}
        required
      />
      {linked && (
        <span
          className="absolute right-2 top-1/2 -translate-y-1/2 text-ok pointer-events-none"
          title="Tertaut akun terdaftar"
        >
          <UserCheck className="w-4 h-4" />
        </span>
      )}

      {open && results.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-panel border border-rule rounded-md shadow-xl max-h-48 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                onPick(r.id, r.name);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-ink/5 flex items-center justify-between gap-2"
            >
              <span className="truncate text-sm text-ink">{r.name}</span>
              <span className="truncate text-[12px] text-ink-3 shrink-0">@{r.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

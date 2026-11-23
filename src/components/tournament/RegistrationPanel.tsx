import React, { useState, useEffect, useCallback } from 'react';
import type { Tournament, TournamentRegistration } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  fetchRegistrations,
  registerForTournament,
  unregisterFromTournament,
  removeRegistration,
} from '../../services/supabaseService';
import { UserPlus, UserMinus, X, Play, Users } from 'lucide-react';

interface RegistrationPanelProps {
  tournament: Tournament;
  isOwner: boolean;
  /** Owner starts the tournament: build the bracket from these registrations. */
  onStart: (regs: TournamentRegistration[]) => void | Promise<void>;
  /** Ask the parent to refresh its tournament list. */
  onChanged: () => void;
}

const isPowerOfTwo = (n: number) => n >= 2 && (n & (n - 1)) === 0;

export const RegistrationPanel: React.FC<RegistrationPanelProps> = ({
  tournament,
  isOwner,
  onStart,
  onChanged,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [regs, setRegs] = useState<TournamentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [starting, setStarting] = useState(false);

  const me = user && !user.isGuest ? user : null;

  const load = useCallback(async () => {
    const r = await fetchRegistrations(tournament.id);
    setRegs(r);
    setLoading(false);
  }, [tournament.id]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const myReg = me ? regs.find((r) => r.userId === me.id) : undefined;
  const max = tournament.maxPlayers || 0;
  const isFull = max > 0 && regs.length >= max;

  const n = regs.length;
  const canStart =
    tournament.format === 'Round Robin' ? n >= 3 : isPowerOfTwo(n);
  const startHint =
    tournament.format === 'Round Robin'
      ? 'Butuh minimal 3 pemain untuk memulai.'
      : 'Jumlah pemain harus 2, 4, 8, 16, atau 32 untuk format gugur.';

  const handleRegister = async () => {
    if (!me) return;
    setBusy(true);
    const res = await registerForTournament(tournament.id, me.id, me.name);
    setBusy(false);
    if (res.success) {
      success('Terdaftar', 'Anda masuk daftar peserta turnamen ini.');
      await load();
      onChanged();
    } else {
      error('Gagal mendaftar', res.error || 'Coba lagi.');
    }
  };

  const handleCancel = async () => {
    if (!me) return;
    setBusy(true);
    const ok = await unregisterFromTournament(tournament.id, me.id);
    setBusy(false);
    if (ok) {
      await load();
      onChanged();
    }
  };

  const handleRemove = async (regId: string) => {
    setBusy(true);
    await removeRegistration(regId);
    setBusy(false);
    await load();
    onChanged();
  };

  const handleStart = async () => {
    setStarting(true);
    await onStart(regs);
    setStarting(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 py-3 border-y border-rule">
        <div className="flex items-center gap-2 text-ink">
          <Users className="w-4 h-4 text-ink-3" />
          <span className="font-semibold num text-lg">
            {regs.length}
            {max > 0 && <span className="text-ink-3"> / {max}</span>}
          </span>
          <span className="text-sm text-ink-2">peserta terdaftar</span>
        </div>
        <span className="tag tag-live shrink-0">Pendaftaran dibuka</span>
      </div>

      {/* Join / leave (logged-in players only) */}
      {me ? (
        myReg ? (
          <button onClick={handleCancel} disabled={busy} className="btn btn-secondary btn-block">
            <UserMinus className="w-4 h-4" /> Batalkan pendaftaran saya
          </button>
        ) : (
          <button
            onClick={handleRegister}
            disabled={busy || isFull}
            className="btn btn-primary btn-block"
          >
            <UserPlus className="w-4 h-4" /> {isFull ? 'Kuota penuh' : 'Daftar sebagai peserta'}
          </button>
        )
      ) : (
        <p className="text-[13px] text-ink-3 text-center py-2">
          Masuk dengan akun untuk mendaftar sebagai peserta.
        </p>
      )}

      {/* Registrant list */}
      {loading ? (
        <p className="py-8 text-center text-sm text-ink-3">Memuat…</p>
      ) : regs.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-3">
          Belum ada yang mendaftar. Bagikan turnamen ini agar pemain bisa bergabung.
        </p>
      ) : (
        <div className="rows border-y border-rule">
          {regs.map((r, idx) => (
            <div key={r.id} className="flex items-center gap-3 py-2.5">
              <span className="num text-sm text-ink-3 w-6 text-right shrink-0">{idx + 1}</span>
              <span className="flex-1 min-w-0 truncate text-ink">
                {r.name}
                {me && r.userId === me.id && <span className="text-ink-3"> (Anda)</span>}
              </span>
              {isOwner && (
                <button
                  onClick={() => handleRemove(r.id)}
                  disabled={busy}
                  className="icon-btn hover:!text-danger shrink-0"
                  title="Keluarkan peserta"
                  aria-label={`Keluarkan ${r.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Owner: start the tournament */}
      {isOwner && (
        <div className="pt-1 space-y-2">
          <button
            onClick={handleStart}
            disabled={!canStart || starting}
            className="btn btn-lg btn-primary btn-block"
          >
            <Play className="w-4 h-4" /> {starting ? 'Menyusun bagan…' : 'Mulai turnamen'}
          </button>
          {!canStart && <p className="text-[13px] text-ink-3 text-center">{startHint}</p>}
        </div>
      )}
    </div>
  );
};

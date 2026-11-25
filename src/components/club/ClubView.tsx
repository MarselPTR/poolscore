import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ClubTable, RentalSession } from '../../types';
import { db } from '../../db/database';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  fetchTablesForOwner,
  fetchAllTables,
  createTable,
  renameTable,
  deleteTable,
  setTableRate,
  setVenueDefaultRate,
  fetchActiveRentals,
  fetchClosedRentalsSince,
  startRental,
  closeRental,
  cancelRental,
} from '../../services/supabaseService';
import { DEFAULT_TABLE_RATE, rentalElapsedSeconds, rentalCostRaw, rentalCost } from '../../lib/billing';
import { formatRupiah, formatRupiahShort } from '../../utils/currency';
import { RentalReceiptModal } from './RentalReceiptModal';
import { RentalRateModal } from './RentalRateModal';
import { RentalStartModal } from './RentalStartModal';
import { RentalRecapModal } from './RentalRecapModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Tv, Plus, Trash2, Pencil, Check, X, Coins, Play, Square, User } from 'lucide-react';

interface ClubViewProps {
  onOpenQuickMatchForTable: (tableId: string, tableLabel: string) => void;
  onOpenTVView: () => void;
}

const DEFAULT_TABLE_COUNT = 4;

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Ticking clock H:MM:SS (drops the hour below 1h). */
const fmtClock = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

export const ClubView: React.FC<ClubViewProps> = ({
  onOpenQuickMatchForTable,
  onOpenTVView,
}) => {
  const { user, refreshProfile } = useAuth();
  const { success, error, warning } = useToast();
  const isSuperAdmin = user?.role === 'super_admin';
  const ownerId = user && !user.isGuest ? user.id : undefined;
  const canBill = !isSuperAdmin && !!ownerId;
  const venueDefaultRate = user?.defaultRate ?? DEFAULT_TABLE_RATE;

  const [tables, setTables] = useState<ClubTable[]>([]);
  const [rentals, setRentals] = useState<RentalSession[]>([]);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [matchesToday, setMatchesToday] = useState<number>(0);
  const [now, setNow] = useState<number>(Date.now());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [countDraft, setCountDraft] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const seededRef = useRef(false);

  // Billing modals. `rateEditor` targets either a specific table or the
  // venue-wide default; `reopenStart` loops back to the start sheet after a
  // tariff edit launched from it.
  const [rateEditor, setRateEditor] = useState<
    { table: ClubTable; reopenStart: boolean } | { venue: true } | null
  >(null);
  const [startTarget, setStartTarget] = useState<ClubTable | null>(null);
  const [closing, setClosing] = useState<{ session: RentalSession; endTime: number } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<RentalSession | null>(null);
  const [recapOpen, setRecapOpen] = useState(false);

  const rentalByTable = new Map(rentals.map((r) => [r.tableId, r]));

  const nextPosition = (list: ClubTable[]) =>
    list.reduce((max, t) => Math.max(max, t.position ?? 0), 0) + 1;

  const loadTables = useCallback(async () => {
    const list = isSuperAdmin ? await fetchAllTables() : ownerId ? await fetchTablesForOwner(ownerId) : [];
    setTables(list);
    return list;
  }, [isSuperAdmin, ownerId]);

  const loadRentals = useCallback(async () => {
    if (!canBill || !ownerId) return;
    const [active, closedToday] = await Promise.all([
      fetchActiveRentals(ownerId),
      fetchClosedRentalsSince(ownerId, startOfToday()),
    ]);
    setRentals(active);
    setTodayRevenue(closedToday.reduce((sum, s) => sum + (s.totalCost || 0), 0));
  }, [canBill, ownerId]);

  const loadStats = useCallback(async () => {
    try {
      const oneDayAgo = Date.now() - 86400000;
      const recent = await db.matches.where('startedAt').above(oneDayAgo).toArray();
      setMatchesToday(recent.filter((m) => m.createdBy === ownerId).length);
    } catch {
      // ignore
    }
  }, [ownerId]);

  // Initial load + auto-seed a few tables for a brand-new venue admin.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await loadTables();
      if (cancelled) return;
      if (!isSuperAdmin && ownerId && list.length === 0 && !seededRef.current) {
        seededRef.current = true;
        for (let i = 0; i < DEFAULT_TABLE_COUNT; i++) {
          await createTable(ownerId, `Meja ${i + 1}`, i + 1, venueDefaultRate);
        }
        if (!cancelled) await loadTables();
      }
    })();
    loadStats();
    loadRentals();
    return () => {
      cancelled = true;
    };
  }, [loadTables, loadStats, loadRentals, isSuperAdmin, ownerId]);

  // Poll for live score + rental updates.
  useEffect(() => {
    const interval = setInterval(() => {
      loadTables();
      loadStats();
      loadRentals();
    }, 3000);
    return () => clearInterval(interval);
  }, [loadTables, loadStats, loadRentals]);

  // Tick every second while a rental is running, for the live timer/cost.
  useEffect(() => {
    if (rentals.length === 0) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [rentals.length]);

  const addTable = async () => {
    if (!ownerId || busy) return;
    setBusy(true);
    const pos = nextPosition(tables);
    const created = await createTable(ownerId, `Meja ${pos}`, pos, venueDefaultRate);
    setBusy(false);
    if (created) setTables((prev) => [...prev, created]);
    else error('Gagal', 'Tidak bisa menambah meja.');
  };

  const removeTable = async (table: ClubTable) => {
    if (table.status === 'LIVE') {
      warning('Meja sedang dipakai', 'Selesaikan pertandingan di meja ini sebelum menghapusnya.');
      return;
    }
    if (rentalByTable.has(table.id)) {
      warning('Sewa masih berjalan', 'Tutup sewa meja ini sebelum menghapusnya.');
      return;
    }
    const ok = await deleteTable(table.id);
    if (ok) setTables((prev) => prev.filter((t) => t.id !== table.id));
    else error('Gagal', 'Tidak bisa menghapus meja.');
  };

  const applyCount = async () => {
    if (!ownerId || busy) return;
    const target = parseInt(countDraft, 10);
    if (!target || target < 0 || target > 60) {
      error('Angka tidak valid', 'Masukkan jumlah meja 0–60.');
      return;
    }
    setBusy(true);
    const current = tables.length;
    if (target > current) {
      for (let i = current; i < target; i++) {
        const pos = i + 1;
        await createTable(ownerId, `Meja ${pos}`, pos, venueDefaultRate);
      }
    } else if (target < current) {
      // Remove tables that are free (no match, no active rental) from the end only.
      const removable = [...tables]
        .filter((t) => t.status !== 'LIVE' && !rentalByTable.has(t.id))
        .sort((a, b) => (b.position ?? 0) - (a.position ?? 0));
      let toRemove = current - target;
      for (const t of removable) {
        if (toRemove <= 0) break;
        await deleteTable(t.id);
        toRemove -= 1;
      }
      if (toRemove > 0) {
        warning('Sebagian meja sibuk', 'Meja yang sedang dipakai atau disewa tidak dihapus.');
      }
    }
    setBusy(false);
    setCountDraft('');
    await loadTables();
    success('Jumlah meja diperbarui', '');
  };

  const saveRename = async (id: string) => {
    const name = editName.trim();
    if (!name) {
      setEditingId(null);
      return;
    }
    const ok = await renameTable(id, name);
    if (ok) setTables((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
    setEditingId(null);
  };

  // ---- Billing actions ----
  const saveRate = async (ratePerHour: number) => {
    if (!rateEditor) return;
    setBusy(true);

    if ('venue' in rateEditor) {
      // Venue-wide default (stored on the owner's profile).
      const ok = ownerId ? await setVenueDefaultRate(ownerId, ratePerHour) : false;
      setBusy(false);
      if (ok) {
        setRateEditor(null);
        await refreshProfile();
        success('Tarif default disimpan', `${formatRupiah(ratePerHour)} / jam untuk meja baru.`);
      } else {
        error('Gagal', 'Tidak bisa menyimpan tarif default.');
      }
      return;
    }

    // Per-table tariff.
    const { table, reopenStart } = rateEditor;
    const ok = await setTableRate(table.id, ratePerHour);
    setBusy(false);
    if (ok) {
      const updated = { ...table, ratePerHour };
      setTables((prev) => prev.map((t) => (t.id === table.id ? updated : t)));
      setRateEditor(null);
      if (reopenStart) setStartTarget(updated);
      else success('Tarif disimpan', `${table.name}: ${formatRupiah(ratePerHour)} / jam.`);
    } else {
      error('Gagal', 'Tidak bisa menyimpan tarif.');
    }
  };

  const openRental = async (note: string) => {
    if (!ownerId || busy || !startTarget) return;
    const table = startTarget;
    const rate = table.ratePerHour ?? DEFAULT_TABLE_RATE;
    setBusy(true);
    const session = await startRental(ownerId, table.id, table.name, rate, note || undefined);
    setBusy(false);
    if (session) {
      setRentals((prev) => [...prev, session]);
      setNow(Date.now());
      setStartTarget(null);
      success('Sewa dibuka', `${table.name} · ${formatRupiah(rate)} / jam.`);
    } else {
      error('Gagal', 'Tidak bisa membuka sewa.');
    }
  };

  const confirmClose = async (): Promise<boolean> => {
    if (!closing) return false;
    const { session, endTime } = closing;
    const total = rentalCost(session.startTime, endTime, session.ratePerHour);
    setBusy(true);
    const ok = await closeRental(session.id, endTime, total);
    setBusy(false);
    if (ok) {
      setRentals((prev) => prev.filter((r) => r.id !== session.id));
      setTodayRevenue((v) => v + total);
      return true;
    }
    error('Gagal', 'Tidak bisa menutup sewa.');
    return false;
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    const ok = await cancelRental(cancelTarget.id);
    if (ok) {
      setRentals((prev) => prev.filter((r) => r.id !== cancelTarget.id));
    } else {
      error('Gagal', 'Tidak bisa membatalkan sewa.');
    }
    setCancelTarget(null);
  };

  const liveCount = tables.filter((t) => t.status === 'LIVE').length;
  const rentedCount = rentals.length;

  const figures: { label: string; value: string; suffix?: string; onClick?: () => void }[] = [
    { label: 'Meja dipakai', value: `${liveCount}`, suffix: `/ ${tables.length}` },
    ...(canBill
      ? [
          { label: 'Disewa', value: `${rentedCount}` },
          {
            label: 'Pemasukan hari ini',
            value: formatRupiahShort(todayRevenue),
            onClick: () => setRecapOpen(true),
          },
        ]
      : [{ label: 'Total meja', value: `${tables.length}` }]),
    { label: 'Pertandingan 24 jam', value: `${matchesToday}` },
  ];

  return (
    <div className="w-full space-y-6 select-none">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Klub</h1>
          {user?.venueName && !isSuperAdmin && (
            <p className="text-sm text-ink-2 mt-1.5">{user.venueName}{user.venueArea ? ` · ${user.venueArea}` : ''}</p>
          )}
          {isSuperAdmin && <p className="text-sm text-ink-2 mt-1.5">Semua meja (semua tempat)</p>}
        </div>
        <button onClick={onOpenTVView} className="btn btn-secondary shrink-0">
          <Tv className="w-4 h-4" />
          Tampilan TV
        </button>
      </div>

      {/* Figures */}
      <div
        className={`grid grid-cols-2 ${
          figures.length >= 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'
        } gap-x-4 gap-y-4 border-y border-rule py-3`}
      >
        {figures.map((s) => {
          const inner = (
            <>
              <div className="eyebrow">{s.label}</div>
              <div className="num text-3xl sm:text-4xl text-ink mt-1.5 tabular-nums">
                {s.value}
                {s.suffix && <span className="text-xl text-ink-3 ml-1.5">{s.suffix}</span>}
              </div>
            </>
          );
          return s.onClick ? (
            <button
              key={s.label}
              onClick={s.onClick}
              className="text-left sm:border-l sm:first:border-l-0 sm:pl-4 sm:first:pl-0 group"
            >
              <div className="group-hover:opacity-70 transition-opacity">{inner}</div>
              <span className="text-[11px] text-ink-3 underline underline-offset-2">Lihat rekap</span>
            </button>
          ) : (
            <div key={s.label} className="sm:border-l sm:first:border-l-0 sm:pl-4 sm:first:pl-0 border-rule">
              {inner}
            </div>
          );
        })}
      </div>

      {/* Management toolbar (venue admin only) */}
      {!isSuperAdmin && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-2 border-b border-rule">
          <button onClick={addTable} disabled={busy} className="btn btn-primary shrink-0">
            <Plus className="w-4 h-4" /> Tambah meja
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-ink-3 shrink-0">Atur jumlah:</span>
            <input
              type="number"
              min="0"
              max="60"
              value={countDraft}
              onChange={(e) => setCountDraft(e.target.value)}
              placeholder={`${tables.length}`}
              aria-label="Jumlah meja"
              className="field !h-9 w-24"
            />
            <button onClick={applyCount} disabled={busy || !countDraft} className="btn btn-secondary btn-sm">
              Terapkan
            </button>
          </div>
          <button
            onClick={() => setRateEditor({ venue: true })}
            className="btn btn-ghost btn-sm sm:ml-auto"
            title="Tarif default untuk meja baru"
          >
            <Coins className="w-4 h-4" /> Tarif default: {formatRupiah(venueDefaultRate)}
          </button>
        </div>
      )}

      {/* Tables */}
      {tables.length === 0 ? (
        <div className="py-16 text-center border-y border-rule">
          <div className="display text-2xl">Belum ada meja</div>
          <p className="text-sm text-ink-2 mt-2">
            {isSuperAdmin ? 'Belum ada tempat yang mendaftarkan meja.' : 'Tambahkan meja untuk mulai mengelola tempat Anda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {tables.map((table) => {
            const isLive = table.status === 'LIVE';
            const isEditing = editingId === table.id;
            const rental = rentalByTable.get(table.id);
            const rate = table.ratePerHour ?? DEFAULT_TABLE_RATE;

            return (
              <div
                key={table.id}
                className={`flex flex-col bg-panel border rounded-[4px] min-h-[150px] ${
                  isLive || rental ? 'border-ink' : 'border-rule'
                }`}
              >
                <div className="flex items-center justify-between gap-2 px-3 h-11 border-b border-rule">
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename(table.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="field !h-8 !text-sm flex-1"
                      aria-label="Nama meja"
                    />
                  ) : (
                    <span className="display text-lg truncate">{table.name}</span>
                  )}

                  {isEditing ? (
                    <div className="flex items-center shrink-0">
                      <button onClick={() => saveRename(table.id)} className="icon-btn !w-8 !h-8" aria-label="Simpan nama">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="icon-btn !w-8 !h-8" aria-label="Batal">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1.5 shrink-0">
                      {rental && <span className="tag tag-live">Disewa</span>}
                      <span className={`tag ${isLive ? 'tag-live' : ''}`}>
                        {isLive ? 'Dipakai' : table.status === 'MAINTENANCE' ? 'Perbaikan' : 'Kosong'}
                      </span>
                    </span>
                  )}
                </div>

                {/* Match snapshot */}
                {isLive ? (
                  <div className="flex-1 flex flex-col">
                    <div className="rows">
                      <div className="flex items-center gap-2.5 h-11 pr-3">
                        <span className="w-1 self-stretch bg-p1" />
                        <span className="flex-1 truncate text-[15px] text-ink">{table.player1Name}</span>
                        <span className="num text-2xl text-ink">{table.score1 ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-2.5 h-11 pr-3">
                        <span className="w-1 self-stretch bg-p2" />
                        <span className="flex-1 truncate text-[15px] text-ink">{table.player2Name}</span>
                        <span className="num text-2xl text-ink">{table.score2 ?? 0}</span>
                      </div>
                    </div>
                    <div className="px-3 py-2 border-t border-rule text-[13px] text-ink-3">
                      {table.gameType || 'Pertandingan'} berlangsung
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-stretch justify-center gap-2 p-3">
                    {!isSuperAdmin && (
                      <button
                        onClick={() => onOpenQuickMatchForTable(table.id, table.name)}
                        className="btn btn-secondary btn-block"
                      >
                        Mulai di meja ini
                      </button>
                    )}
                    {!isSuperAdmin && (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setEditingId(table.id);
                            setEditName(table.name);
                          }}
                          className="btn btn-ghost btn-sm"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Ganti nama
                        </button>
                        <button onClick={() => removeTable(table)} className="btn btn-ghost btn-sm hover:!text-danger">
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                    )}
                    {isSuperAdmin && <span className="text-sm text-ink-3 text-center">Kosong</span>}
                  </div>
                )}

                {/* Billing footer (venue admin only) */}
                {canBill &&
                  (rental ? (
                    <div className="border-t border-rule px-3 py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-ink">
                          <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse" />
                          <span className="num text-sm tabular-nums">
                            {fmtClock(rentalElapsedSeconds(rental.startTime, now))}
                          </span>
                        </span>
                        <span className="num text-sm text-ink tabular-nums">
                          {formatRupiah(rentalCostRaw(rental.startTime, now, rental.ratePerHour))}
                        </span>
                      </div>
                      {rental.note && (
                        <div className="flex items-center gap-1 text-[12px] text-ink-3 truncate mt-1.5">
                          <User className="w-3 h-3 shrink-0" /> <span className="truncate">{rental.note}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-2">
                        <button
                          onClick={() => setClosing({ session: rental, endTime: Date.now() })}
                          className="btn btn-primary btn-sm flex-1"
                        >
                          <Square className="w-3.5 h-3.5" /> Tutup &amp; tagih
                        </button>
                        <button
                          onClick={() => setCancelTarget(rental)}
                          className="btn btn-ghost btn-sm hover:!text-danger"
                          title="Batalkan sewa"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 px-3 h-11 border-t border-rule">
                      <button
                        onClick={() => setRateEditor({ table, reopenStart: false })}
                        className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink"
                        title="Ubah tarif meja ini"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span className="num tabular-nums">{formatRupiah(rate)}</span>
                        <span>/jam</span>
                      </button>
                      <button onClick={() => setStartTarget(table)} disabled={busy} className="btn btn-ghost btn-sm">
                        <Play className="w-3.5 h-3.5" /> Buka sewa
                      </button>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Billing modals */}
      <RentalStartModal
        isOpen={!!startTarget}
        onClose={() => setStartTarget(null)}
        table={startTarget}
        onEditRate={() => {
          if (startTarget) {
            const t = startTarget;
            setStartTarget(null);
            setRateEditor({ table: t, reopenStart: true });
          }
        }}
        onStart={openRental}
        busy={busy}
      />
      <RentalRateModal
        isOpen={!!rateEditor}
        onClose={() => setRateEditor(null)}
        title={rateEditor && 'venue' in rateEditor ? 'Tarif default tempat' : 'Tarif sewa'}
        subtitle={
          rateEditor && 'venue' in rateEditor
            ? 'Dipakai sebagai tarif awal setiap meja baru. Tidak mengubah meja yang sudah ada.'
            : rateEditor && 'table' in rateEditor
              ? rateEditor.table.name
              : undefined
        }
        initialRate={
          rateEditor && 'table' in rateEditor
            ? (rateEditor.table.ratePerHour ?? venueDefaultRate)
            : venueDefaultRate
        }
        saveLabel={rateEditor && 'venue' in rateEditor ? 'Simpan tarif default' : 'Simpan tarif'}
        onSave={saveRate}
        busy={busy}
      />
      <RentalReceiptModal
        isOpen={!!closing}
        onClose={() => setClosing(null)}
        session={closing?.session ?? null}
        endTime={closing?.endTime ?? Date.now()}
        venueName={user?.venueName}
        onConfirm={confirmClose}
        busy={busy}
      />
      <RentalRecapModal isOpen={recapOpen} onClose={() => setRecapOpen(false)} ownerId={ownerId} />
      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
        title="Batalkan sewa?"
        message={`Sewa ${cancelTarget?.tableName ?? ''} akan dihapus tanpa dicatat sebagai pemasukan. Meja kembali bebas.`}
        confirmText="Ya, batalkan"
        cancelText="Kembali"
        type="danger"
        iconType="delete"
      />
    </div>
  );
};

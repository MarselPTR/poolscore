import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ClubTable } from '../../types';
import { db } from '../../db/database';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  fetchTablesForOwner,
  fetchAllTables,
  createTable,
  renameTable,
  deleteTable,
} from '../../services/supabaseService';
import { Tv, Plus, Trash2, Pencil, Check, X } from 'lucide-react';

interface ClubViewProps {
  onOpenQuickMatchForTable: (tableId: string, tableLabel: string) => void;
  onOpenTVView: () => void;
}

const DEFAULT_TABLE_COUNT = 4;

export const ClubView: React.FC<ClubViewProps> = ({
  onOpenQuickMatchForTable,
  onOpenTVView,
}) => {
  const { user } = useAuth();
  const { success, error, warning } = useToast();
  const isSuperAdmin = user?.role === 'super_admin';
  const ownerId = user && !user.isGuest ? user.id : undefined;

  const [tables, setTables] = useState<ClubTable[]>([]);
  const [matchesToday, setMatchesToday] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [countDraft, setCountDraft] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const seededRef = useRef(false);

  const nextPosition = (list: ClubTable[]) =>
    list.reduce((max, t) => Math.max(max, t.position ?? 0), 0) + 1;

  const loadTables = useCallback(async () => {
    const list = isSuperAdmin ? await fetchAllTables() : ownerId ? await fetchTablesForOwner(ownerId) : [];
    setTables(list);
    return list;
  }, [isSuperAdmin, ownerId]);

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
          await createTable(ownerId, `Meja ${i + 1}`, i + 1);
        }
        if (!cancelled) await loadTables();
      }
    })();
    loadStats();
    return () => {
      cancelled = true;
    };
  }, [loadTables, loadStats, isSuperAdmin, ownerId]);

  // Poll for live score updates.
  useEffect(() => {
    const interval = setInterval(() => {
      loadTables();
      loadStats();
    }, 3000);
    return () => clearInterval(interval);
  }, [loadTables, loadStats]);

  const addTable = async () => {
    if (!ownerId || busy) return;
    setBusy(true);
    const pos = nextPosition(tables);
    const created = await createTable(ownerId, `Meja ${pos}`, pos);
    setBusy(false);
    if (created) setTables((prev) => [...prev, created]);
    else error('Gagal', 'Tidak bisa menambah meja.');
  };

  const removeTable = async (table: ClubTable) => {
    if (table.status === 'LIVE') {
      warning('Meja sedang dipakai', 'Selesaikan pertandingan di meja ini sebelum menghapusnya.');
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
        await createTable(ownerId, `Meja ${pos}`, pos);
      }
    } else if (target < current) {
      // Remove FREE tables from the end only.
      const removable = [...tables]
        .filter((t) => t.status !== 'LIVE')
        .sort((a, b) => (b.position ?? 0) - (a.position ?? 0));
      let toRemove = current - target;
      for (const t of removable) {
        if (toRemove <= 0) break;
        await deleteTable(t.id);
        toRemove -= 1;
      }
      if (toRemove > 0) {
        warning('Sebagian meja aktif', 'Meja yang sedang dipakai tidak dihapus.');
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

  const liveCount = tables.filter((t) => t.status === 'LIVE').length;

  const stats = [
    { label: 'Meja dipakai', value: `${liveCount}`, suffix: `/ ${tables.length}` },
    { label: 'Total meja', value: `${tables.length}` },
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
      <div className="grid grid-cols-3 border-y border-rule divide-x divide-rule">
        {stats.map((s, i) => (
          <div key={s.label} className={`py-3 ${i === 0 ? 'pr-3' : 'px-3'}`}>
            <div className="eyebrow">{s.label}</div>
            <div className="num text-4xl text-ink mt-1.5">
              {s.value}
              {s.suffix && <span className="text-xl text-ink-3 ml-1.5">{s.suffix}</span>}
            </div>
          </div>
        ))}
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

            return (
              <div
                key={table.id}
                className={`flex flex-col bg-panel border rounded-[4px] min-h-[150px] ${
                  isLive ? 'border-ink' : 'border-rule'
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
                    <span className={`tag shrink-0 ${isLive ? 'tag-live' : ''}`}>
                      {isLive ? 'Dipakai' : table.status === 'MAINTENANCE' ? 'Perbaikan' : 'Kosong'}
                    </span>
                  )}
                </div>

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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

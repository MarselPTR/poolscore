import React, { useState, useEffect, useCallback } from 'react';
import { fetchVenueAdmins, setProfileApproval, type VenueAdminRow } from '../../services/supabaseService';
import { useToast } from '../../context/ToastContext';
import { Check, X } from 'lucide-react';

export const SuperAdminPanel: React.FC = () => {
  const { success, error } = useToast();
  const [admins, setAdmins] = useState<VenueAdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const rows = await fetchVenueAdmins();
    setAdmins(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, status: 'approved' | 'rejected') => {
    setBusyId(id);
    const ok = await setProfileApproval(id, status);
    setBusyId(null);
    if (ok) {
      success(status === 'approved' ? 'Disetujui' : 'Ditolak', 'Status pengelola diperbarui.');
      setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, approvalStatus: status } : a)));
    } else {
      error('Gagal', 'Tidak bisa memperbarui status. Periksa koneksi / hak akses.');
    }
  };

  const pending = admins.filter((a) => a.approvalStatus === 'pending');
  const decided = admins.filter((a) => a.approvalStatus !== 'pending');

  const row = (a: VenueAdminRow, withActions: boolean) => (
    <div key={a.id} className="flex items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-ink truncate">{a.venueName || a.name}</div>
        <div className="text-[13px] text-ink-3 truncate">
          {a.name}
          {a.venueArea ? ` · ${a.venueArea}` : ''}
          {a.email ? ` · ${a.email}` : ''}
        </div>
      </div>
      {withActions ? (
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => act(a.id, 'rejected')}
            disabled={busyId === a.id}
            className="btn btn-danger btn-sm"
          >
            <X className="w-4 h-4" /> Tolak
          </button>
          <button
            onClick={() => act(a.id, 'approved')}
            disabled={busyId === a.id}
            className="btn btn-primary btn-sm"
          >
            <Check className="w-4 h-4" /> Setujui
          </button>
        </div>
      ) : (
        <span className={`tag shrink-0 ${a.approvalStatus === 'approved' ? 'tag-live' : ''}`}>
          {a.approvalStatus === 'approved' ? 'Aktif' : 'Ditolak'}
        </span>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="page-title">Panel Super Admin</h1>
        <p className="text-sm text-ink-2 mt-1.5">Persetujuan pendaftaran pengelola tempat billiard.</p>
      </div>

      <section>
        <h2 className="eyebrow pb-2 border-b border-rule-strong">
          Menunggu persetujuan ({pending.length})
        </h2>
        {loading ? (
          <p className="py-8 text-center text-sm text-ink-3">Memuat…</p>
        ) : pending.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-3">Tidak ada pendaftaran yang menunggu.</p>
        ) : (
          <div className="rows border-b border-rule">{pending.map((a) => row(a, true))}</div>
        )}
      </section>

      {decided.length > 0 && (
        <section>
          <h2 className="eyebrow pb-2 border-b border-rule-strong">Sudah diproses</h2>
          <div className="rows border-b border-rule">{decided.map((a) => row(a, false))}</div>
        </section>
      )}
    </div>
  );
};

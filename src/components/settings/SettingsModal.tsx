import { useState } from 'react';
import type React from 'react';
import { Modal } from '../common/Modal';
import { useSettings } from '../../context/SettingsContext';
import { useAuth, ROLE_LABELS } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import type { TouchProtectionMode, GameType, AppSettings } from '../../types';
import { db } from '../../db/database';
import { Sun, Moon, Download, Upload, Trash2, LogOut } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { user, logout } = useAuth();
  const { success, error, info } = useToast();

  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleExportBackup = async () => {
    try {
      const matches = await db.matches.toArray();
      const players = await db.players.toArray();
      const tournaments = await db.tournaments.toArray();
      const data = {
        version: 1,
        exportedAt: Date.now(),
        settings,
        matches,
        players,
        tournaments,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PoolScore_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      success('Ekspor Berhasil', 'File backup data pertandingan telah diunduh.');
    } catch {
      error('Gagal Ekspor', 'Terjadi kesalahan saat mengekspor data database.');
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (json.matches) await db.matches.bulkPut(json.matches);
        if (json.players) await db.players.bulkPut(json.players);
        if (json.tournaments) await db.tournaments.bulkPut(json.tournaments);
        if (json.settings) updateSettings(json.settings);
        success('Impor Berhasil', 'Data backup berhasil dipulihkan ke aplikasi.');
      } catch {
        error('Format Tidak Valid', 'Format file backup JSON tidak dikenali.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmClearData = async () => {
    try {
      await db.matches.clear();
      await db.players.clear();
      await db.tournaments.clear();
      resetSettings();
      success('Database Bersih', 'Seluruh riwayat pertandingan lokal telah dikosongkan.');
    } catch {
      error('Gagal', 'Terjadi kesalahan saat membersihkan database.');
    }
  };

  const handleConfirmLogout = () => {
    onClose();
    logout();
    info('Berhasil Keluar', 'Sesi akun Anda telah diakhiri.');
  };

  const isLight = settings.theme === 'light';

  const touchModes: { id: TouchProtectionMode; label: string; desc: string }[] = [
    { id: 'hold', label: 'Tahan', desc: 'Paling aman' },
    { id: 'confirm', label: 'Dua ketukan', desc: 'Ketuk lalu konfirmasi' },
    { id: 'quick', label: 'Satu ketukan', desc: 'Paling cepat' },
  ];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Pengaturan">
        <div className="space-y-7 select-none">
          {/* Account */}
          {user && (
            <section>
              <h4 className="eyebrow pb-2 border-b border-rule">Akun</h4>
              <div className="flex items-center justify-between gap-3 pt-3">
                <div className="flex items-center gap-3 min-w-0">
                  <PlayerAvatar name={user.name} size="md" />
                  <div className="min-w-0">
                    <div className="font-semibold text-ink truncate">{user.name}</div>
                    <div className="text-[13px] text-ink-3 truncate">
                      {user.isGuest ? 'Mode tamu' : `${user.email} · ${ROLE_LABELS[user.role]}`} · rating {user.rating}
                    </div>
                  </div>
                </div>

                <button onClick={() => setIsLogoutConfirmOpen(true)} className="btn btn-secondary btn-sm shrink-0">
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>
            </section>
          )}

          {/* Display */}
          <section>
            <h4 className="eyebrow pb-2 border-b border-rule">Tampilan</h4>
            <div className="pt-3">
              <span className="label">Tema</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateSettings({ theme: 'dark' })}
                  data-on={!isLight}
                  className="opt !flex-row !gap-2"
                >
                  <Moon className="w-4 h-4" /> Gelap
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'light' })}
                  data-on={isLight}
                  className="opt !flex-row !gap-2"
                >
                  <Sun className="w-4 h-4" /> Terang
                </button>
              </div>

              <div className="mt-4">
                <span className="label">Ukuran angka skor</span>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'standard', label: 'Sedang' },
                    { id: 'large', label: 'Besar' },
                    { id: 'massive', label: 'Raksasa' },
                  ] as { id: AppSettings['fontSize']; label: string }[]).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => updateSettings({ fontSize: f.id })}
                      data-on={settings.fontSize === f.id}
                      className="opt"
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Match */}
          <section>
            <h4 className="eyebrow pb-2 border-b border-rule">Pertandingan</h4>
            <div className="pt-3 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="set-game" className="label">
                    Permainan bawaan
                  </label>
                  <select
                    id="set-game"
                    value={settings.defaultGame}
                    onChange={(e) => updateSettings({ defaultGame: e.target.value as GameType })}
                    className="field"
                  >
                    <option value="9-Ball">9-Ball</option>
                    <option value="8-Ball">8-Ball</option>
                    <option value="10-Ball">10-Ball</option>
                    <option value="Straight Pool">Straight Pool</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="set-race" className="label">
                    Race to bawaan
                  </label>
                  <input
                    id="set-race"
                    type="number"
                    min="1"
                    max="50"
                    value={settings.defaultRace}
                    onChange={(e) => updateSettings({ defaultRace: parseInt(e.target.value, 10) || 7 })}
                    className="field"
                  />
                </div>
              </div>

              <div>
                <span className="label">Cara mencatat rack menang</span>
                <div className="grid grid-cols-3 gap-2">
                  {touchModes.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => updateSettings({ touchProtection: m.id })}
                      data-on={settings.touchProtection === m.id}
                      className="opt !px-1.5"
                    >
                      <span>{m.label}</span>
                      <span className="opt-sub">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {settings.touchProtection === 'hold' && (
                <div>
                  <label htmlFor="set-hold" className="label">
                    Durasi tahan: {(settings.holdDurationMs / 1000).toFixed(1)} detik
                  </label>
                  <input
                    id="set-hold"
                    type="range"
                    min="300"
                    max="1500"
                    step="100"
                    value={settings.holdDurationMs}
                    onChange={(e) => updateSettings({ holdDurationMs: parseInt(e.target.value, 10) })}
                    className="w-full accent-[var(--ink)]"
                  />
                </div>
              )}

              <div className="rows border-y border-rule">
                <label className="flex items-center justify-between gap-4 py-2.5 cursor-pointer">
                  <span className="text-sm text-ink">Efek suara</span>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                    className="switch"
                  />
                </label>

                {settings.soundEnabled && (
                  <div className="flex items-center justify-between gap-4 py-2.5">
                    <span className="text-sm text-ink shrink-0">Volume</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.soundVolume}
                      onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                      className="w-40 accent-[var(--ink)]"
                      aria-label="Volume suara"
                    />
                  </div>
                )}

                <label className="flex items-center justify-between gap-4 py-2.5 cursor-pointer">
                  <span className="text-sm text-ink">Getaran</span>
                  <input
                    type="checkbox"
                    checked={settings.vibrationEnabled}
                    onChange={(e) => updateSettings({ vibrationEnabled: e.target.checked })}
                    className="switch"
                  />
                </label>

                <label className="flex items-center justify-between gap-4 py-2.5 cursor-pointer">
                  <span className="text-sm text-ink">Tampilkan timer</span>
                  <input
                    type="checkbox"
                    checked={settings.showTimer}
                    onChange={(e) => updateSettings({ showTimer: e.target.checked })}
                    className="switch"
                  />
                </label>

                <label className="flex items-center justify-between gap-4 py-2.5 cursor-pointer">
                  <span className="text-sm text-ink">Jaga layar tetap menyala</span>
                  <input
                    type="checkbox"
                    checked={settings.wakeLockEnabled}
                    onChange={(e) => updateSettings({ wakeLockEnabled: e.target.checked })}
                    className="switch"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Data */}
          <section>
            <h4 className="eyebrow pb-2 border-b border-rule">Data</h4>
            <div className="pt-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleExportBackup} className="btn btn-secondary">
                  <Download className="w-4 h-4" /> Ekspor cadangan
                </button>

                <label className="btn btn-secondary cursor-pointer">
                  <Upload className="w-4 h-4" /> Impor cadangan
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>

              <button onClick={() => setIsClearConfirmOpen(true)} className="btn btn-danger btn-block">
                <Trash2 className="w-4 h-4" /> Hapus semua data lokal
              </button>
            </div>
          </section>

          <p className="text-[13px] text-ink-3 text-center">
            PoolScore 1.0.0 · &copy; {new Date().getFullYear()} NugrahaTech Innovations
          </p>
        </div>
      </Modal>

      {/* Clear DB Confirm Dialog */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleConfirmClearData}
        title="Reset Seluruh Database?"
        message="PERINGATAN: Seluruh riwayat pertandingan, pemain, dan turnamen lokal akan dihapus permanen. Lanjutkan?"
        confirmText="Ya, Hapus Semua"
        cancelText="Batal"
        iconType="delete"
        type="danger"
      />

      {/* Logout Confirm Dialog */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Keluar dari Akun?"
        message="Anda akan keluar dari sesi akun saat ini dan dialihkan kembali ke form masuk."
        confirmText="Ya, Keluar"
        cancelText="Batal"
        iconType="logout"
        type="danger"
      />
    </>
  );
};

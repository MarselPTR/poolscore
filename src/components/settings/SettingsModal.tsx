import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import type { TouchProtectionMode, GameType } from '../../types';
import { db } from '../../db/database';
import { Sun, Moon, Smartphone, Database, Download, Upload, Trash2, Check, Sliders, User, LogOut } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { user, logout } = useAuth();
  const { success, error, info } = useToast();
  const [copiedMsg] = useState<string>('');

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

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Pengaturan PoolScore">
        <div className="space-y-5 select-none text-xs">
          {copiedMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-medium flex items-center gap-2">
              <Check className="w-4 h-4" /> {copiedMsg}
            </div>
          )}

          {/* 0. User Account Card */}
          {user && (
            <div>
              <label className="block uppercase tracking-wider text-zinc-400 font-semibold mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-500" /> Akun Terhubung
              </label>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-3 min-w-0">
                  <PlayerAvatar name={user.name} size="md" />
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-white truncate">{user.name}</div>
                    <div className="text-[11px] text-zinc-400 truncate">{user.email}</div>
                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-semibold">
                      <span>{user.role}</span>
                      <span>·</span>
                      <span>Rating {user.rating}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsLogoutConfirmOpen(true)}
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" /> Keluar
                </button>
              </div>
            </div>
          )}

          {/* 1. Theme Selector */}
          <div>
            <label className="block uppercase tracking-wider text-zinc-400 font-semibold mb-2">
              Tema Tampilan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                  !isLight
                    ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                <Moon className="w-4 h-4" /> Dark Mode
              </button>
              <button
                onClick={() => updateSettings({ theme: 'light' })}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                  isLight
                    ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4" /> Light Mode
              </button>
            </div>
          </div>

          {/* 2. Default Game & Race To */}
          <div>
            <label className="block uppercase tracking-wider text-zinc-400 font-semibold mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-zinc-400" /> Preferensi Pertandingan
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">Game Bawaan</span>
                <select
                  value={settings.defaultGame}
                  onChange={(e) => updateSettings({ defaultGame: e.target.value as GameType })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-rose-500 font-medium"
                >
                  <option value="9-Ball">9-Ball</option>
                  <option value="8-Ball">8-Ball</option>
                  <option value="10-Ball">10-Ball</option>
                  <option value="Straight Pool">Straight Pool</option>
                </select>
              </div>

              <div>
                <span className="text-[11px] text-zinc-400 block mb-1">Default Race To</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.defaultRace}
                  onChange={(e) => updateSettings({ defaultRace: parseInt(e.target.value, 10) || 7 })}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 3. Audio Sound Effects */}
          <div>
            <label className="block uppercase tracking-wider text-zinc-400 font-semibold mb-2">
              Efek Suara Audio
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateSettings({ soundEnabled: true })}
                className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                  settings.soundEnabled
                    ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                Suara Aktif (ON)
              </button>
              <button
                onClick={() => updateSettings({ soundEnabled: false })}
                className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                  !settings.soundEnabled
                    ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                Mute (OFF)
              </button>
            </div>
          </div>

          {/* 4. Touch Protection Mode */}
          <div>
            <label className="block uppercase tracking-wider text-zinc-400 font-semibold mb-2 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-zinc-400" /> Proteksi Layar Sentuh Wasit
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'single_tap', label: '1 Tap', desc: 'Instan' },
                { id: 'double_tap', label: '2 Tap', desc: 'Aman' },
                { id: 'hold_to_confirm', label: 'Tahan 1s', desc: 'Anti Sentuh' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => updateSettings({ touchProtection: m.id as TouchProtectionMode })}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    settings.touchProtection === m.id
                      ? 'border-rose-500 bg-rose-600 text-white shadow-sm font-bold'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-semibold">{m.label}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Database & Backup Controls */}
          <div>
            <label className="block uppercase tracking-wider text-zinc-400 font-semibold mb-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-zinc-400" /> Manajemen Backup Data
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportBackup}
                className="py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 text-zinc-200 transition-all active:scale-95"
              >
                <Download className="w-4 h-4 text-zinc-400" /> Ekspor Backup
              </button>

              <label className="py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 text-zinc-200 cursor-pointer transition-all active:scale-95">
                <Upload className="w-4 h-4 text-zinc-400" /> Impor Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setIsClearConfirmOpen(true)}
                className="col-span-2 py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Trash2 className="w-4 h-4" /> Reset Database Lokal
              </button>
            </div>
          </div>

          {/* 6. Copyright & Developer Credit */}
          <div className="pt-3 border-t border-zinc-800/80 text-center space-y-1">
            <div className="text-[11px] font-medium text-zinc-400">
              &copy; {new Date().getFullYear()} PoolScore Championship Suite · Versi 1.0.0 Pro
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">
              Designed &amp; Engineered by <span className="text-rose-500 font-semibold">NugrahaTech Innovations</span>
            </div>
          </div>
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

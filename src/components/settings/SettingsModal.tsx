import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import type { TouchProtectionMode } from '../../types';
import { db } from '../../db/database';
import { Sun, Moon, Smartphone, Database, Download, Upload, Trash2, Check, Sliders, Shield, User, LogOut } from 'lucide-react';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { user, logout } = useAuth();
  const [copiedMsg, setCopiedMsg] = useState<string>('');

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
      setCopiedMsg('Backup data berhasil diekspor!');
      setTimeout(() => setCopiedMsg(''), 3000);
    } catch {
      alert('Gagal mengekspor data.');
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
        setCopiedMsg('Data backup berhasil diimpor!');
        setTimeout(() => setCopiedMsg(''), 3000);
      } catch {
        alert('Format file backup tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (confirm('PERINGATAN: Seluruh riwayat pertandingan, pemain, dan turnamen lokal akan dihapus. Lanjutkan?')) {
      await db.matches.clear();
      await db.players.clear();
      await db.tournaments.clear();
      resetSettings();
      alert('Database lokal berhasil dibersihkan.');
    }
  };

  const handleLogout = () => {
    if (confirm('Keluar dari akun Anda saat ini?')) {
      onClose();
      logout();
    }
  };

  const isLight = settings.theme === 'light';

  return (
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
              <User className="w-3.5 h-3.5 text-zinc-400" /> Akun Pengguna Aktif
            </label>
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PlayerAvatar name={user.name} size="md" />
                <div>
                  <div className="font-bold text-sm text-white">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {user.email} · <span className="text-rose-400 font-medium">{user.role}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 font-semibold text-xs"
                title="Keluar dari akun ini"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        )}

        {/* 1. Mode Tampilan: Mode Malam (Dark) & Mode Siang (Light) */}
        <div>
          <label className="block uppercase tracking-wider text-zinc-400 font-semibold mb-2 flex items-center gap-1.5">
            {isLight ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-rose-500" />} Mode Tampilan Aplikasi
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => updateSettings({ theme: 'obsidian' })}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                !isLight
                  ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
              }`}
            >
              <Moon className="w-4 h-4" />
              Mode Malam (Dark)
            </button>

            <button
              onClick={() => updateSettings({ theme: 'light' })}
              className={`p-3 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                isLight
                  ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-300" />
              Mode Siang (Light)
            </button>
          </div>
        </div>

        {/* 2. Accidental Touch Protection */}
        <div>
          <label className="block uppercase tracking-wider text-zinc-400 font-semibold mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-zinc-400" /> Proteksi Tombol Skor (Win Rack)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'hold', label: 'Tahan 0.5s', desc: 'Hold to Win' },
              { id: 'confirm', label: 'Konfirmasi', desc: 'Tap lalu Konfirmasi' },
              { id: 'quick', label: 'Instan', desc: 'Tap Langsung' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => updateSettings({ touchProtection: mode.id as TouchProtectionMode })}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  settings.touchProtection === mode.id
                    ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-semibold">{mode.label}</div>
                <div className={`text-[10px] mt-0.5 ${settings.touchProtection === mode.id ? 'text-white/80' : 'text-zinc-500'}`}>{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Device & Hardware Controls */}
        <div>
          <label className="block uppercase tracking-wider text-zinc-400 font-semibold mb-2 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-zinc-400" /> Pengaturan Perangkat
          </label>
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Screen Wake Lock</span>
                <div className="text-[11px] text-zinc-500">Mencegah layar HP mati saat match aktif</div>
              </div>
              <input
                type="checkbox"
                checked={settings.wakeLockEnabled}
                onChange={(e) => updateSettings({ wakeLockEnabled: e.target.checked })}
                className="w-4 h-4 accent-rose-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <div>
                <span className="font-semibold text-white">Efek Suara Audio</span>
                <div className="text-[11px] text-zinc-500">Suara pukulan stik, kemenangan rack, dan foul</div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-rose-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <div>
                <span className="font-semibold text-white">Efek Getar (Haptic)</span>
                <div className="text-[11px] text-zinc-500">Getaran singkat saat tombol ditekan</div>
              </div>
              <input
                type="checkbox"
                checked={settings.vibrationEnabled}
                onChange={(e) => updateSettings({ vibrationEnabled: e.target.checked })}
                className="w-4 h-4 accent-rose-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* 4. Scoreboard Font Size */}
        <div>
          <label className="block uppercase tracking-wider text-zinc-400 font-semibold mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-zinc-400" /> Ukuran Angka Skor
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'standard', label: 'Standar' },
              { id: 'large', label: 'Besar' },
              { id: 'massive', label: 'Ekstra Besar' },
            ].map((size) => (
              <button
                key={size.id}
                onClick={() => updateSettings({ fontSize: size.id as 'standard' | 'large' | 'massive' })}
                className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                  settings.fontSize === size.id
                    ? 'border-rose-500 bg-rose-600 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Data Backup & Reset */}
        <div>
          <label className="block uppercase tracking-wider text-zinc-400 font-semibold mb-2 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-zinc-400" /> Data & Cadangan (Backup)
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
              onClick={handleClearData}
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
  );
};

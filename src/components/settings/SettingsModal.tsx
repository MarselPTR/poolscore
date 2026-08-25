import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useSettings } from '../../context/SettingsContext';
import type { ThemeMode, TouchProtectionMode } from '../../types';
import { db } from '../../db/database';
import { Moon, Smartphone, Database, Download, Upload, Trash2, Check, Sliders, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [copiedMsg, setCopiedMsg] = useState<string>('');

  const themes: { id: ThemeMode; label: string; bg: string; accent: string }[] = [
    { id: 'obsidian', label: 'Obsidian Zinc', bg: '#09090b', accent: '#e11d48' },
    { id: 'felt-green', label: 'Midnight Felt', bg: '#050a08', accent: '#10b981' },
    { id: 'carbon', label: 'Pro Carbon', bg: '#000000', accent: '#3b82f6' },
    { id: 'navy', label: 'Tournament Navy', bg: '#050811', accent: '#38bdf8' },
  ];

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pengaturan PoolScore">
      <div className="space-y-5 select-none text-xs">
        {copiedMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium flex items-center gap-2">
            <Check className="w-4 h-4" /> {copiedMsg}
          </div>
        )}

        {/* 1. Theme & Appearance */}
        <div>
          <label className="block uppercase tracking-wider text-zinc-400 font-semibold mb-2 flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-zinc-400" /> Tema Tampilan
          </label>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => updateSettings({ theme: t.id })}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium transition-all ${
                  settings.theme === t.id
                    ? 'border-zinc-300 bg-zinc-800 text-white shadow-sm'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                  style={{ backgroundColor: t.accent }}
                />
                <span className="truncate">{t.label}</span>
              </button>
            ))}
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
                    ? 'border-rose-500/50 bg-rose-500/15 text-rose-300 shadow-sm'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-semibold">{mode.label}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{mode.desc}</div>
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
                    ? 'border-zinc-300 bg-zinc-800 text-white shadow-sm'
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
              <Download className="w-4 h-4 text-emerald-400" /> Ekspor Backup
            </button>

            <label className="py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 text-zinc-200 cursor-pointer transition-all active:scale-95">
              <Upload className="w-4 h-4 text-blue-400" /> Impor Backup
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
      </div>
    </Modal>
  );
};

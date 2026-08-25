import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useSettings } from '../../context/SettingsContext';
import type { ThemeMode, TouchProtectionMode } from '../../types';
import { db } from '../../db/database';
import { Moon, Smartphone, Database, Download, Upload, Trash2, Check, Sliders } from 'lucide-react';
import { IconTouchShield } from '../common/BilliardIcons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [copiedMsg, setCopiedMsg] = useState<string>('');

  const themes: { id: ThemeMode; label: string; bg: string; accent: string }[] = [
    { id: 'obsidian', label: 'Obsidian Table', bg: '#0a0e0c', accent: '#1f8a5a' },
    { id: 'felt-green', label: 'Midnight Felt', bg: '#061510', accent: '#04e2ac' },
    { id: 'carbon', label: 'Pro Carbon', bg: '#080808', accent: '#3b82f6' },
    { id: 'navy', label: 'Tournament Navy', bg: '#050b14', accent: '#38bdf8' },
  ];

  // Export JSON backup
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
      setCopiedMsg('Backup data berhasil diexport!');
      setTimeout(() => setCopiedMsg(''), 3000);
    } catch {
      alert('Gagal mengekspor data.');
    }
  };

  // Import JSON backup
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
        setCopiedMsg('Data backup berhasil diimport!');
        setTimeout(() => setCopiedMsg(''), 3000);
      } catch {
        alert('Format file backup tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  // Clear Database
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
      <div className="space-y-6 select-none">
        {copiedMsg && (
          <div className="p-3 rounded-xl bg-felt/20 border border-felt text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
            <Check className="w-4 h-4" /> {copiedMsg}
          </div>
        )}

        {/* 1. Theme & Appearance */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-2 flex items-center gap-1.5">
            <Moon className="w-3.5 h-3.5 text-felt" /> Tema Meja & Tampilan
          </label>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => updateSettings({ theme: t.id })}
                className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-mono uppercase font-bold transition-all ${
                  settings.theme === t.id
                    ? 'border-felt bg-felt/20 text-text shadow-sm'
                    : 'border-line bg-surface-2 text-text-dim hover:text-text'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full border border-line shrink-0"
                  style={{ backgroundColor: t.accent }}
                />
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Accidental Touch Protection */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-2 flex items-center gap-2">
            <IconTouchShield size={16} /> Proteksi Sentuhan Tombol Skor (Win Rack)
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
                className={`p-3 rounded-2xl border text-center transition-all ${
                  settings.touchProtection === mode.id
                    ? 'border-felt bg-felt/20 text-emerald-300 shadow-sm'
                    : 'border-line bg-surface-2 text-text-dim hover:text-text'
                }`}
              >
                <div className="text-xs font-mono font-bold uppercase">{mode.label}</div>
                <div className="text-[10px] text-text-faint mt-0.5">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Device & Hardware Controls */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-2 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-blue" /> Pengaturan Perangkat
          </label>
          <div className="p-3.5 rounded-2xl bg-surface-2 border border-line space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-text">Screen Wake Lock API</span>
                <div className="text-[11px] text-text-faint">Mencegah layar smartphone mati saat match aktif</div>
              </div>
              <input
                type="checkbox"
                checked={settings.wakeLockEnabled}
                onChange={(e) => updateSettings({ wakeLockEnabled: e.target.checked })}
                className="w-4 h-4 accent-felt rounded"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-line/60">
              <div>
                <span className="font-bold text-text">Efek Suara Audio</span>
                <div className="text-[11px] text-text-faint">Bunyi stik billiard, kemenangan rack, dan foul</div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-felt rounded"
              />
            </div>

            {settings.soundEnabled && (
              <div className="pt-2 border-t border-line/60">
                <div className="flex justify-between font-mono text-[11px] text-text-dim mb-1">
                  <span>Volume Efek Suara</span>
                  <span>{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                  className="w-full accent-felt"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-line/60">
              <div>
                <span className="font-bold text-text">Efek Getar (Haptic Feedback)</span>
                <div className="text-[11px] text-text-faint">Getaran singkat saat tombol skor ditekan</div>
              </div>
              <input
                type="checkbox"
                checked={settings.vibrationEnabled}
                onChange={(e) => updateSettings({ vibrationEnabled: e.target.checked })}
                className="w-4 h-4 accent-felt rounded"
              />
            </div>
          </div>
        </div>

        {/* 4. Scoreboard Font Size */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-felt" /> Ukuran Angka Skor
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'standard', label: 'Standar' },
              { id: 'large', label: 'Besar (Rekomendasi)' },
              { id: 'massive', label: 'Ekstra Besar' },
            ].map((size) => (
              <button
                key={size.id}
                onClick={() => updateSettings({ fontSize: size.id as 'standard' | 'large' | 'massive' })}
                className={`py-2 px-2 rounded-2xl border text-center text-xs font-mono font-bold uppercase transition-all ${
                  settings.fontSize === size.id
                    ? 'border-felt bg-felt/20 text-emerald-300 shadow-sm'
                    : 'border-line bg-surface-2 text-text-dim hover:text-text'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Data Backup & Reset */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-text-dim mb-2 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-text-dim" /> Data & Cadangan (Backup)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportBackup}
              className="py-2.5 px-3 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-line text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 text-text transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-felt" /> Export Backup
            </button>

            <label className="py-2.5 px-3 rounded-2xl bg-surface-2 hover:bg-surface-3 border border-line text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 text-text cursor-pointer transition-all active:scale-95">
              <Upload className="w-4 h-4 text-blue" /> Import Backup
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>

            <button
              onClick={handleClearData}
              className="col-span-2 py-2 px-3 rounded-2xl bg-red/10 hover:bg-red/20 border border-red/30 text-xs font-mono font-bold uppercase text-red transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Trash2 className="w-4 h-4" /> Reset / Bersihkan Database Lokal
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

import React from 'react';
import type { Match } from '../../types';
import { ArrowLeft, Maximize, Minimize, QrCode, Settings, Tv, Sun, Moon, LogOut } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

interface MatchTopBarProps {
  match: Match;
  isWakeLocked: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenQR: () => void;
  onOpenTV: () => void;
  onOpenSettings: () => void;
  /** Leave the scoreboard without ending the match (it keeps running). */
  onMinimize: () => void;
  /** Cancel the match entirely (asks for confirmation upstream). */
  onCancelMatch: () => void;
}

export const MatchTopBar: React.FC<MatchTopBarProps> = ({
  match,
  isWakeLocked,
  isFullscreen,
  onToggleFullscreen,
  onOpenQR,
  onOpenTV,
  onOpenSettings,
  onMinimize,
  onCancelMatch,
}) => {
  const { isDarkMode, toggleTheme } = useSettings();
  const maxPossibleRacks = match.raceTo * 2 - 1;
  const isMultiSet = match.targetSets && match.targetSets > 1;

  return (
    <div className="h-12 flex items-center justify-between gap-3 pl-1.5 pr-1.5 border-b border-rule bg-bg select-none shrink-0">
      {/* Back: leaves the scoreboard but keeps the match running in the background. */}
      <button
        onClick={onMinimize}
        className="btn btn-secondary !px-2.5 shrink-0 mr-1"
        title="Kembali — pertandingan tetap berjalan"
        aria-label="Kembali, pertandingan tetap berjalan"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Kembali</span>
      </button>

      {/* Match facts */}
      <div className="flex items-baseline gap-x-4 min-w-0 overflow-hidden whitespace-nowrap">
        <span className="display text-xl text-ink">{match.gameType}</span>

        <span className="text-sm text-ink-2">
          Race to <b className="num text-base text-ink">{match.raceTo}</b>
        </span>

        <span className="text-sm text-ink-2">
          Rack <b className="num text-base text-ink">{match.currentRack}</b>
          <span className="text-ink-3">/{maxPossibleRacks}</span>
        </span>

        {isMultiSet && (
          <span className="text-sm text-ink-2">
            Set <b className="num text-base text-ink">{match.currentSet}</b>
            <span className="hidden sm:inline text-ink-3">
              {' '}
              · skor set{' '}
              <b className="num text-base text-p1-ink">{match.player1Sets}</b>
              <span className="mx-0.5">–</span>
              <b className="num text-base text-p2-ink">{match.player2Sets}</b>
            </span>
          </span>
        )}

        {match.tableLabel && (
          <span className="hidden sm:inline text-sm text-ink-2">{match.tableLabel}</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center shrink-0">
        {isWakeLocked && (
          <span
            className="hidden lg:inline text-[13px] text-ink-3 mr-2"
            title="Layar dijaga tetap menyala selama pertandingan"
          >
            Layar tetap menyala
          </span>
        )}

        <button
          onClick={toggleTheme}
          className="icon-btn"
          title={isDarkMode ? 'Tema terang' : 'Tema gelap'}
          aria-label={isDarkMode ? 'Tema terang' : 'Tema gelap'}
        >
          {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
        </button>

        <button onClick={onOpenQR} className="icon-btn" title="Bagikan pertandingan" aria-label="Bagikan pertandingan">
          <QrCode className="w-[18px] h-[18px]" />
        </button>

        <button
          onClick={onOpenTV}
          className="icon-btn hidden sm:inline-flex"
          title="Tampilan TV"
          aria-label="Tampilan TV"
        >
          <Tv className="w-[18px] h-[18px]" />
        </button>

        <button
          onClick={onToggleFullscreen}
          className="icon-btn"
          title={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
          aria-label={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
        >
          {isFullscreen ? <Minimize className="w-[18px] h-[18px]" /> : <Maximize className="w-[18px] h-[18px]" />}
        </button>

        <button onClick={onOpenSettings} className="icon-btn" title="Pengaturan" aria-label="Pengaturan">
          <Settings className="w-[18px] h-[18px]" />
        </button>

        {/* Cancel the whole match (only while it is still running). */}
        {match.status === 'in_progress' && (
          <button
            onClick={onCancelMatch}
            className="ml-1 inline-flex items-center gap-1.5 px-2.5 h-8 text-[13px] font-semibold uppercase tracking-wide text-danger hover:bg-danger/10 transition-colors"
            title="Batalkan pertandingan"
            aria-label="Batalkan pertandingan"
          >
            <LogOut className="w-4 h-4" />
            Batalkan
          </button>
        )}
      </div>
    </div>
  );
};

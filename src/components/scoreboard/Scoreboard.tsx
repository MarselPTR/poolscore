import React, { useState } from 'react';
import { useMatch } from '../../context/MatchContext';
import { useSettings } from '../../context/SettingsContext';
import { useWakeLock } from '../../hooks/useWakeLock';
import { useFullscreen } from '../../hooks/useFullscreen';
import { MatchTopBar } from './MatchTopBar';
import { PlayerPanel } from './PlayerPanel';
import { ActionBar } from './ActionBar';
import { FoulModal } from './FoulModal';
import { BreakModal } from './BreakModal';
import { HistoryDrawer } from './HistoryDrawer';
import { MatchResultModal } from './MatchResultModal';

interface ScoreboardProps {
  /** Side by side when the screen is wide, stacked when it is tall. */
  orientation: 'landscape' | 'portrait';
  onOpenQR: () => void;
  onOpenTV: () => void;
  onOpenSettings: () => void;
  onOpenShareCard: () => void;
  onNewMatchModal: () => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  orientation,
  onOpenQR,
  onOpenTV,
  onOpenSettings,
  onOpenShareCard,
  onNewMatchModal,
}) => {
  const {
    activeMatch,
    rackSeconds,
    isPaused,
    foulAlert,
    setWonAlert,
    winRack,
    undo,
    recordFoul,
    recordBreak,
    switchTurn,
    adjustScore,
    togglePauseTimer,
    finishAndSaveMatch,
    startMatch,
  } = useMatch();

  const { settings } = useSettings();
  const { isLocked: isWakeLocked } = useWakeLock(settings.wakeLockEnabled);
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const [isFoulModalOpen, setIsFoulModalOpen] = useState(false);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  if (!activeMatch) return null;

  const isGameFinished = activeMatch.status === 'finished';
  const isMultiSet = activeMatch.targetSets > 1;

  const handleRematch = async () => {
    await startMatch({
      gameType: activeMatch.gameType,
      format: activeMatch.format,
      raceTo: activeMatch.raceTo,
      targetSets: activeMatch.targetSets,
      player1Name: activeMatch.player1.name,
      player2Name: activeMatch.player2.name,
      breakRule: activeMatch.breakRule,
      isFoulTracking: activeMatch.isFoulTracking,
      isTimerEnabled: activeMatch.isTimerEnabled,
      tournamentId: activeMatch.tournamentId,
      tournamentMatchId: activeMatch.tournamentMatchId,
      tableNumber: activeMatch.tableNumber,
    });
  };

  const recentRacks = activeMatch.rackHistory.slice(-24);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-bg select-none relative">
      <MatchTopBar
        match={activeMatch}
        isWakeLocked={isWakeLocked}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenQR={onOpenQR}
        onOpenTV={onOpenTV}
        onOpenSettings={onOpenSettings}
      />

      {/* The two halves */}
      <div
        className={`relative flex-1 min-h-0 grid ${
          orientation === 'landscape' ? 'grid-cols-2' : 'grid-rows-2'
        }`}
      >
        <PlayerPanel
          player={activeMatch.player1}
          playerNumber={1}
          isActiveTurn={activeMatch.currentTurn === 1}
          onWinRack={() => winRack(1)}
          onAdjustScore={(delta) => adjustScore(1, delta)}
          isGameFinished={isGameFinished}
          raceTo={activeMatch.raceTo}
          setsWon={activeMatch.player1Sets}
          targetSets={activeMatch.targetSets}
          fontSizePreference={settings.fontSize}
        />

        <PlayerPanel
          player={activeMatch.player2}
          playerNumber={2}
          isActiveTurn={activeMatch.currentTurn === 2}
          onWinRack={() => winRack(2)}
          onAdjustScore={(delta) => adjustScore(2, delta)}
          isGameFinished={isGameFinished}
          raceTo={activeMatch.raceTo}
          setsWon={activeMatch.player2Sets}
          targetSets={activeMatch.targetSets}
          fontSizePreference={settings.fontSize}
        />

        {/* Announcements sit over the seam between the halves */}
        {(setWonAlert || foulAlert) && (
          <div className="absolute inset-x-0 top-4 z-30 flex flex-col items-center gap-2 px-4 pointer-events-none">
            {setWonAlert && (
              <div
                role="status"
                className="flex items-center gap-4 px-5 py-3 bg-white text-black shadow-xl animate-rise"
              >
                <span className="display text-2xl">{setWonAlert.text}</span>
                <span className="font-display font-semibold uppercase tracking-wide text-lg opacity-70">
                  {setWonAlert.setScoreText}
                </span>
              </div>
            )}
            {foulAlert && (
              <div
                role="status"
                className="px-5 py-3 bg-warn text-black shadow-xl animate-rise font-display font-bold uppercase tracking-wide text-xl text-center"
              >
                {foulAlert.text}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rack sequence */}
      <div className="flex items-center gap-3 h-8 px-4 border-t border-rule bg-bg shrink-0">
        <span className="eyebrow shrink-0">
          {isMultiSet ? `Set ${activeMatch.currentSet} · Rack` : 'Rack'}
        </span>
        {recentRacks.length === 0 ? (
          <span className="text-[13px] text-ink-3">Rack pertama sedang berlangsung</span>
        ) : (
          <div className="flex items-center gap-1 overflow-hidden">
            {recentRacks.map((r, i) => (
              <span
                key={i}
                className={`w-3 h-3 shrink-0 ${r.winner === 1 ? 'bg-p1' : 'bg-p2'}`}
                title={`Rack ${r.rackNumber}: ${
                  r.winner === 1 ? activeMatch.player1.name : activeMatch.player2.name
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <ActionBar
        onUndo={undo}
        onOpenFoul={() => setIsFoulModalOpen(true)}
        onOpenBreak={() => setIsBreakModalOpen(true)}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        onSwitchTurn={() => switchTurn()}
        durationSeconds={activeMatch.durationSeconds}
        rackSeconds={rackSeconds}
        isPaused={isPaused}
        onTogglePause={togglePauseTimer}
        canUndo={activeMatch.events.length > 1}
      />

      <FoulModal
        isOpen={isFoulModalOpen}
        onClose={() => setIsFoulModalOpen(false)}
        player1Name={activeMatch.player1.name}
        player2Name={activeMatch.player2.name}
        currentTurn={activeMatch.currentTurn}
        onSubmitFoul={recordFoul}
      />

      <BreakModal
        isOpen={isBreakModalOpen}
        onClose={() => setIsBreakModalOpen(false)}
        player1Name={activeMatch.player1.name}
        player2Name={activeMatch.player2.name}
        currentTurn={activeMatch.currentTurn}
        onSubmitBreak={recordBreak}
      />

      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        match={activeMatch}
      />

      <MatchResultModal
        isOpen={isGameFinished}
        match={activeMatch}
        onNewMatch={onNewMatchModal}
        onRematch={handleRematch}
        onSaveAndFinish={finishAndSaveMatch}
        onOpenShareCard={onOpenShareCard}
      />
    </div>
  );
};

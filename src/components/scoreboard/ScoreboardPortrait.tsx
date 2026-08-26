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

interface ScoreboardPortraitProps {
  onOpenQR: () => void;
  onOpenTV: () => void;
  onOpenSettings: () => void;
  onOpenShareCard: () => void;
  onNewMatchModal: () => void;
}

export const ScoreboardPortrait: React.FC<ScoreboardPortraitProps> = ({
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
    adjustScore,
    recordFoul,
    recordBreak,
    switchTurn,
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
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface select-none relative">
      <MatchTopBar
        match={activeMatch}
        isWakeLocked={isWakeLocked}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenQR={onOpenQR}
        onOpenTV={onOpenTV}
        onOpenSettings={onOpenSettings}
      />

      {/* Set Won Toast */}
      {setWonAlert && (
        <div className="mx-3 mt-2 bg-zinc-950/95 border-2 border-amber-400 text-amber-300 px-4 py-2.5 rounded-2xl font-mono font-bold text-xs shadow-xl animate-bounce flex items-center justify-between shadow-amber-950/50">
          <span className="flex items-center gap-2">
            <span className="text-base">🏆</span>
            <span className="text-white font-bold">{setWonAlert.text}</span>
          </span>
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded text-[11px] font-black">
            {setWonAlert.setScoreText}
          </span>
        </div>
      )}

      {/* Main Stack for Portrait: Reusing PlayerPanel with Full-Box tap/hold */}
      <div className="flex-1 flex flex-col p-2.5 gap-2.5">
        <div className="flex-1 min-h-0">
          <PlayerPanel
            player={activeMatch.player1}
            playerNumber={1}
            isActiveTurn={activeMatch.currentTurn === 1}
            onWinRack={() => winRack(1)}
            onAdjustScore={(delta) => adjustScore(1, delta)}
            onSelectTurn={() => switchTurn(1)}
            isGameFinished={isGameFinished}
            setsWon={activeMatch.player1Sets}
            targetSets={activeMatch.targetSets}
            fontSizePreference={settings.fontSize}
          />
        </div>

        <div className="flex-1 min-h-0">
          <PlayerPanel
            player={activeMatch.player2}
            playerNumber={2}
            isActiveTurn={activeMatch.currentTurn === 2}
            onWinRack={() => winRack(2)}
            onAdjustScore={(delta) => adjustScore(2, delta)}
            onSelectTurn={() => switchTurn(2)}
            isGameFinished={isGameFinished}
            setsWon={activeMatch.player2Sets}
            targetSets={activeMatch.targetSets}
            fontSizePreference={settings.fontSize}
          />
        </div>
      </div>

      {foulAlert && (
        <div className="mx-3 mb-2 bg-amber-500/95 text-black font-mono font-bold text-xs p-2.5 rounded-xl text-center shadow-lg">
          {foulAlert.text}
        </div>
      )}

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

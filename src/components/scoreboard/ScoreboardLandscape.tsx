import React, { useState } from 'react';
import { useMatch } from '../../context/MatchContext';
import { useSettings } from '../../context/SettingsContext';
import { useWakeLock } from '../../hooks/useWakeLock';
import { useFullscreen } from '../../hooks/useFullscreen';
import { MatchTopBar } from './MatchTopBar';
import { PlayerPanel } from './PlayerPanel';
import { DiamondRail } from './DiamondRail';
import { ActionBar } from './ActionBar';
import { FoulModal } from './FoulModal';
import { BreakModal } from './BreakModal';
import { HistoryDrawer } from './HistoryDrawer';
import { MatchResultModal } from './MatchResultModal';

interface ScoreboardLandscapeProps {
  onOpenQR: () => void;
  onOpenTV: () => void;
  onOpenSettings: () => void;
  onOpenShareCard: () => void;
  onNewMatchModal: () => void;
}

export const ScoreboardLandscape: React.FC<ScoreboardLandscapeProps> = ({
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

  return (
    <div className="flex flex-col h-screen w-screen max-h-screen max-w-screen overflow-hidden bg-surface select-none relative">
      {/* 1. Match Top Bar */}
      <MatchTopBar
        match={activeMatch}
        isWakeLocked={isWakeLocked}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenQR={onOpenQR}
        onOpenTV={onOpenTV}
        onOpenSettings={onOpenSettings}
      />

      {/* Set Won Celebration Toast/Banner */}
      {setWonAlert && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-amber/95 text-black px-6 py-2.5 rounded-2xl font-mono font-bold text-sm shadow-2xl animate-bounce border-2 border-white flex items-center gap-3">
          <span>{setWonAlert.text}</span>
          <span className="bg-black/20 px-2 py-0.5 rounded text-xs">{setWonAlert.setScoreText}</span>
        </div>
      )}

      {/* 2. Main Arena (P1 - Center Diamond Rail - P2) */}
      <div className="flex-1 grid grid-cols-[1fr_36px_1fr] sm:grid-cols-[1fr_44px_1fr] p-2 sm:p-4 gap-1 sm:gap-3 overflow-hidden relative">
        {/* Left Player 1 (Red) */}
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

        {/* Center Billiard Diamond Rail Divider */}
        <DiamondRail currentTurn={activeMatch.currentTurn} />

        {/* Right Player 2 (Blue) */}
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

      {/* 3. Recent Rack History Dot Strip */}
      <div className="flex items-center justify-center gap-1.5 py-1 bg-surface-2/40 border-t border-line/50">
        {activeMatch.rackHistory.length === 0 ? (
          <span className="text-[10px] font-mono text-text-faint uppercase">
            {activeMatch.targetSets > 1 ? `Set ${activeMatch.currentSet} · Rack 1 Berlangsung` : 'Rack 1 Berlangsung'}
          </span>
        ) : (
          activeMatch.rackHistory.slice(-15).map((r, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-transform hover:scale-125 ${
                r.winner === 1
                  ? 'bg-red shadow-[0_0_6px_rgba(240,74,58,0.7)]'
                  : 'bg-blue shadow-[0_0_6px_rgba(63,123,250,0.7)]'
              }`}
              title={`Rack #${r.rackNumber} dimenangkan oleh ${r.winner === 1 ? activeMatch.player1.name : activeMatch.player2.name}`}
            />
          ))
        )}
      </div>

      {/* 4. Foul Floating Alert Toast */}
      {foulAlert && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 bg-amber/95 text-black px-5 py-2 rounded-xl font-mono font-bold text-xs tracking-wider shadow-2xl border border-amber/40 animate-fade-in flex items-center gap-2">
          <span>●</span>
          <span>{foulAlert.text}</span>
        </div>
      )}

      {/* 5. Bottom Action Bar */}
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

      {/* Modals */}
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

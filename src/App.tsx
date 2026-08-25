import React, { useState, useEffect } from 'react';
import { useMatch } from './context/MatchContext';
import { useSettings } from './context/SettingsContext';
import { initializeDatabase } from './db/database';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { LandscapeBanner } from './components/common/LandscapeBanner';
import { ScoreboardLandscape } from './components/scoreboard/ScoreboardLandscape';
import { ScoreboardPortrait } from './components/scoreboard/ScoreboardPortrait';
import { HomeView } from './components/home/HomeView';
import { MatchHistoryView } from './components/history/MatchHistoryView';
import { LeaderboardView } from './components/stats/LeaderboardView';
import { TournamentView } from './components/tournament/TournamentView';
import { ClubView } from './components/club/ClubView';
import { TVScoreboardView } from './components/tv/TVScoreboardView';
import { QuickMatchModal } from './components/match/QuickMatchModal';
import { ShareCardModal } from './components/match/ShareCardModal';
import { QRModal } from './components/match/QRModal';
import { SettingsModal } from './components/settings/SettingsModal';
import type { Match, GameType } from './types';

export const App: React.FC = () => {
  const { activeMatch, startMatch } = useMatch();
  const { settings } = useSettings();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isTVMode, setIsTVMode] = useState<boolean>(false);
  const [isQuickMatchOpen, setIsQuickMatchOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isQROpen, setIsQROpen] = useState<boolean>(false);
  const [shareCardMatch, setShareCardMatch] = useState<Match | null>(null);

  // Setup options for table assignment or tournament launch
  const [tableAssignmentNumber, setTableAssignmentNumber] = useState<number | undefined>(undefined);
  const [tournamentSetup] = useState<{
    tournamentId?: string;
    tournamentMatchId?: string;
    player1?: string;
    player2?: string;
    gameType?: GameType;
    raceTo?: number;
  }>({});

  const [isLandscapeOrientation, setIsLandscapeOrientation] = useState<boolean>(true);

  // Initialize DB on app load
  useEffect(() => {
    initializeDatabase();

    const checkOrientation = () => {
      setIsLandscapeOrientation(window.innerWidth >= window.innerHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const isMatchRunning = activeMatch !== null && activeMatch.status === 'in_progress';

  // Handle launch match from tournament tree
  const handleLaunchTournamentMatch = async (
    tId: string,
    tmId: string,
    p1: string,
    p2: string,
    game: GameType,
    race: number
  ) => {
    await startMatch({
      gameType: game,
      format: 'Race To',
      raceTo: race,
      player1Name: p1,
      player2Name: p2,
      breakRule: settings.defaultBreakRule,
      isFoulTracking: true,
      isTimerEnabled: true,
      tournamentId: tId,
      tournamentMatchId: tmId,
    });
  };

  const handleOpenTableQuickMatch = (tableNum: number) => {
    setTableAssignmentNumber(tableNum);
    setIsQuickMatchOpen(true);
  };

  // 1. TV Fullscreen Spectator Mode
  if (isTVMode) {
    return <TVScoreboardView onBack={() => setIsTVMode(false)} />;
  }

  // 2. Active Match View (Full Screen Immersion)
  if (isMatchRunning) {
    return (
      <div className="relative min-h-screen bg-bg text-text">
        <LandscapeBanner />
        {isLandscapeOrientation ? (
          <ScoreboardLandscape
            onOpenQR={() => setIsQROpen(true)}
            onOpenTV={() => setIsTVMode(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenShareCard={() => setShareCardMatch(activeMatch)}
            onNewMatchModal={() => setIsQuickMatchOpen(true)}
          />
        ) : (
          <ScoreboardPortrait
            onOpenQR={() => setIsQROpen(true)}
            onOpenTV={() => setIsTVMode(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenShareCard={() => setShareCardMatch(activeMatch)}
            onNewMatchModal={() => setIsQuickMatchOpen(true)}
          />
        )}

        {/* Global Modals */}
        <QuickMatchModal
          isOpen={isQuickMatchOpen}
          onClose={() => setIsQuickMatchOpen(false)}
        />

        {shareCardMatch && (
          <ShareCardModal
            isOpen={!!shareCardMatch}
            onClose={() => setShareCardMatch(null)}
            match={shareCardMatch}
          />
        )}

        {activeMatch && (
          <QRModal
            isOpen={isQROpen}
            onClose={() => setIsQROpen(false)}
            match={activeMatch}
            onOpenTVView={() => setIsTVMode(true)}
          />
        )}

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    );
  }

  // 3. Normal Application Dashboard View
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTV={() => setIsTVMode(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        <div key={currentTab} className="animate-page-enter">
          {currentTab === 'home' && (
            <HomeView
              onOpenQuickMatch={() => {
                setTableAssignmentNumber(undefined);
                setIsQuickMatchOpen(true);
              }}
              onSelectTab={setCurrentTab}
              onOpenMatchDetail={(m) => setShareCardMatch(m)}
            />
          )}

          {currentTab === 'history' && (
            <MatchHistoryView
              onOpenShareCard={(m) => setShareCardMatch(m)}
            />
          )}

          {currentTab === 'stats' && <LeaderboardView />}

          {currentTab === 'tournament' && (
            <TournamentView onLaunchTournamentMatch={handleLaunchTournamentMatch} />
          )}

          {currentTab === 'club' && (
            <ClubView
              onOpenQuickMatchForTable={handleOpenTableQuickMatch}
              onOpenTVView={() => setIsTVMode(true)}
            />
          )}
        </div>
      </main>

      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isVisible={!isMatchRunning}
      />

      {/* Global Modals */}
      <QuickMatchModal
        isOpen={isQuickMatchOpen}
        onClose={() => {
          setIsQuickMatchOpen(false);
          setTableAssignmentNumber(undefined);
        }}
        tableNumber={tableAssignmentNumber}
        initialPlayer1={tournamentSetup.player1}
        initialPlayer2={tournamentSetup.player2}
        initialGameType={tournamentSetup.gameType}
        initialRaceTo={tournamentSetup.raceTo}
        tournamentId={tournamentSetup.tournamentId}
        tournamentMatchId={tournamentSetup.tournamentMatchId}
      />

      {shareCardMatch && (
        <ShareCardModal
          isOpen={!!shareCardMatch}
          onClose={() => setShareCardMatch(null)}
          match={shareCardMatch}
        />
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useMatch } from './context/MatchContext';
import { useSettings } from './context/SettingsContext';
import { useAuth } from './context/AuthContext';
import { initializeDatabase } from './db/database';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { LandscapeBanner } from './components/common/LandscapeBanner';
import { Scoreboard } from './components/scoreboard/Scoreboard';
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
import { AuthView } from './components/auth/AuthView';
import type { Match, GameType } from './types';

export const App: React.FC = () => {
  const { activeMatch, startMatch } = useMatch();
  const { settings } = useSettings();
  const { user } = useAuth();

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

  // 1. Auth Guard: Show Login / Register Page if not authenticated
  if (!user) {
    return <AuthView />;
  }

  // 2. TV Fullscreen Spectator Mode
  if (isTVMode) {
    return <TVScoreboardView onBack={() => setIsTVMode(false)} />;
  }

  // Keep the scoreboard mounted while a match is in progress AND once it has
  // finished — the finished state is where the result screen (rematch, share,
  // save) lives. We only leave the scoreboard when the match is cleared to null.
  const isMatchRunning =
    activeMatch !== null &&
    (activeMatch.status === 'in_progress' || activeMatch.status === 'finished');

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

  // 3. Active Match View (Full Screen Immersion)
  if (isMatchRunning) {
    return (
      <div className="h-dvh flex flex-col overflow-hidden bg-bg text-ink">
        <LandscapeBanner />
        <Scoreboard
          orientation={isLandscapeOrientation ? 'landscape' : 'portrait'}
          onOpenQR={() => setIsQROpen(true)}
          onOpenTV={() => setIsTVMode(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenShareCard={() => setShareCardMatch(activeMatch)}
          onNewMatchModal={() => setIsQuickMatchOpen(true)}
        />

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

  // 4. Normal Application Dashboard View
  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTV={() => setIsTVMode(true)}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-24 md:pb-12">
        <div key={currentTab} className="animate-fade">
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

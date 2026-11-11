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
import { PendingApprovalScreen } from './components/auth/PendingApprovalScreen';
import { SuperAdminPanel } from './components/admin/SuperAdminPanel';
import { canAccessTab } from './lib/roles';
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
  const [tableAssignment, setTableAssignment] = useState<{ id: string; label: string } | undefined>(undefined);
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

  // 1b. Venue admin awaiting (or denied) approval cannot use the app yet.
  if (user.role === 'venue_admin' && user.approvalStatus !== 'approved') {
    return <PendingApprovalScreen />;
  }

  // 2. TV Fullscreen Spectator Mode
  if (isTVMode) {
    return <TVScoreboardView onBack={() => setIsTVMode(false)} />;
  }

  // Keep the current tab within what this role may access.
  const safeTab = canAccessTab(user, currentTab) ? currentTab : 'home';

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

  const handleOpenTableQuickMatch = (tableId: string, tableLabel: string) => {
    setTableAssignment({ id: tableId, label: tableLabel });
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
        currentTab={safeTab}
        onSelectTab={setCurrentTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTV={() => setIsTVMode(true)}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-24 md:pb-12">
        <div key={safeTab} className="animate-fade">
          {safeTab === 'home' && (
            <HomeView
              onOpenQuickMatch={() => {
                setTableAssignment(undefined);
                setIsQuickMatchOpen(true);
              }}
              onSelectTab={setCurrentTab}
              onOpenMatchDetail={(m) => setShareCardMatch(m)}
            />
          )}

          {safeTab === 'history' && (
            <MatchHistoryView
              onOpenShareCard={(m) => setShareCardMatch(m)}
            />
          )}

          {safeTab === 'stats' && <LeaderboardView />}

          {safeTab === 'tournament' && (
            <TournamentView onLaunchTournamentMatch={handleLaunchTournamentMatch} />
          )}

          {safeTab === 'club' && (
            <ClubView
              onOpenQuickMatchForTable={handleOpenTableQuickMatch}
              onOpenTVView={() => setIsTVMode(true)}
            />
          )}

          {safeTab === 'admin' && <SuperAdminPanel />}
        </div>
      </main>

      <BottomNav
        currentTab={safeTab}
        onSelectTab={setCurrentTab}
        isVisible={!isMatchRunning}
      />

      {/* Global Modals */}
      <QuickMatchModal
        isOpen={isQuickMatchOpen}
        onClose={() => {
          setIsQuickMatchOpen(false);
          setTableAssignment(undefined);
        }}
        tableId={tableAssignment?.id}
        tableLabel={tableAssignment?.label}
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

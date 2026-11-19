import React, { useState, useEffect, useRef } from 'react';
import { useMatch } from './context/MatchContext';
import { useSettings } from './context/SettingsContext';
import { useAuth } from './context/AuthContext';
import { initializeDatabase } from './db/database';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ResumeMatchBar } from './components/common/ResumeMatchBar';
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
  // Minimized = the match is still running but we've stepped back to the
  // dashboard. The match itself is never paused or cleared by this.
  const [isMatchMinimized, setIsMatchMinimized] = useState<boolean>(false);
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

  // A newly started/resumed match should always open on the scoreboard, not stay
  // hidden behind the dashboard because a previous match was minimized.
  const prevMatchIdRef = useRef<string | null>(null);
  useEffect(() => {
    const id = activeMatch?.id ?? null;
    if (id && id !== prevMatchIdRef.current) setIsMatchMinimized(false);
    prevMatchIdRef.current = id;
  }, [activeMatch?.id]);

  // When a minimized match finishes, pop back to the scoreboard so the result
  // screen (rematch / save / share) is shown immediately.
  useEffect(() => {
    if (activeMatch?.status === 'finished') setIsMatchMinimized(false);
  }, [activeMatch?.status]);

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

  // The immersive scoreboard takes over the screen only when it is not
  // minimized; minimizing returns to the dashboard while the match runs on.
  const showScoreboard = isMatchRunning && !isMatchMinimized;

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
  if (showScoreboard) {
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
          onMinimize={() => setIsMatchMinimized(true)}
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

      <main
        className={`flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8 ${
          isMatchRunning ? 'pb-36 md:pb-28' : 'pb-24 md:pb-12'
        }`}
      >
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

      {/* Running match, minimized: a persistent bar to jump back in. */}
      <ResumeMatchBar onResume={() => setIsMatchMinimized(false)} />

      <BottomNav
        currentTab={safeTab}
        onSelectTab={setCurrentTab}
        isVisible={true}
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

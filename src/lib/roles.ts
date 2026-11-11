import type { UserProfile } from '../context/AuthContext';

export type TabId = 'home' | 'history' | 'stats' | 'tournament' | 'club' | 'admin';

/**
 * Which tabs a user may see (Fase 2).
 * - Guest: Beranda + Peringkat (etalase) only.
 * - Participant: + Riwayat, Turnamen.
 * - Venue admin (approved): + Klub.
 * - Super admin: everything + Panel (approval).
 */
export function allowedTabs(user: UserProfile | null): TabId[] {
  if (!user) return ['home'];
  if (user.isGuest) return ['home', 'stats'];

  switch (user.role) {
    case 'super_admin':
      return ['home', 'history', 'stats', 'tournament', 'club', 'admin'];
    case 'venue_admin':
      return ['home', 'history', 'stats', 'tournament', 'club'];
    case 'participant':
    default:
      return ['home', 'history', 'stats', 'tournament'];
  }
}

export function canAccessTab(user: UserProfile | null, tab: string): boolean {
  return allowedTabs(user).includes(tab as TabId);
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserRole, ApprovalStatus } from '../types';

export interface VenueInfo {
  name: string;
  area: string;
  phone?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  role: UserRole;
  approvalStatus: ApprovalStatus;
  rating: number;
  avatarColor?: string;
  isGuest?: boolean;
  venueName?: string;
  venueArea?: string;
  /** Default table-rental tariff (Rupiah/hour) for new tables. */
  defaultRate?: number;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  participant: 'Peserta',
  venue_admin: 'Pengelola tempat',
  super_admin: 'Super Admin',
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isSupabaseOnline: boolean;
  isPasswordRecoveryMode: boolean;
  setIsPasswordRecoveryMode: (val: boolean) => void;
  login: (emailOrName: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (params: {
    name: string;
    emailOrPhone: string;
    password: string;
    role: 'participant' | 'venue_admin';
    username?: string;
    venue?: VenueInfo;
  }) => Promise<{ success: boolean; error?: string }>;
  sendPasswordResetLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'poolscore_auth_user';
const BACKEND_REQUIRED = 'Fitur ini membutuhkan koneksi server. Silakan coba lagi nanti.';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeAuthEmail(identifier: string): string {
  const clean = identifier.trim().toLowerCase();
  if (clean.includes('@') && clean.includes('.')) return clean;
  const sanitized = clean.replace(/[^a-z0-9_]/g, '');
  return `${sanitized || 'player'}@poolscore.club`;
}

// Build a UserProfile by combining the auth user with its profiles row (role,
// approval status, venue info). Falls back to sensible defaults if the row is
// not readable yet.
async function buildProfile(authUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): Promise<UserProfile> {
  const meta = authUser.user_metadata || {};
  const fallbackName =
    (meta.full_name as string) || (meta.name as string) || authUser.email?.split('@')[0] || 'Player';

  let role: UserRole = 'participant';
  let approvalStatus: ApprovalStatus = 'approved';
  let name = fallbackName;
  let username = (meta.username as string) || authUser.email?.split('@')[0];
  let venueName: string | undefined;
  let venueArea: string | undefined;
  let defaultRate: number | undefined;
  let rating = 1400;

  try {
    const { data } = await supabase
      .from('profiles')
      .select('role, approval_status, name, username, venue_name, venue_area, default_rate_per_hour, rating')
      .eq('id', authUser.id)
      .maybeSingle();
    if (data) {
      role = (data.role as UserRole) || role;
      approvalStatus = (data.approval_status as ApprovalStatus) || approvalStatus;
      name = data.name || name;
      username = data.username || username;
      venueName = data.venue_name || undefined;
      venueArea = data.venue_area || undefined;
      defaultRate = (data.default_rate_per_hour as number) ?? undefined;
      rating = data.rating ?? rating;
    }
  } catch {
    // profile not reachable — use defaults
  }

  return {
    id: authUser.id,
    name,
    username,
    email: authUser.email || '',
    role,
    approvalStatus,
    rating,
    avatarColor: '#d81e3a',
    isGuest: false,
    venueName,
    venueArea,
    defaultRate,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isPasswordRecoveryMode, setIsPasswordRecoveryMode] = useState<boolean>(() => {
    return (
      window.location.hash.includes('type=recovery') ||
      window.location.search.includes('type=recovery')
    );
  });

  // Listen to Supabase auth state changes.
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(await buildProfile(session.user));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecoveryMode(true);
      }
      if (session?.user) {
        setUser(await buildProfile(session.user));
      } else {
        // Keep a local guest session; otherwise sign out.
        setUser((prev) => (prev?.isGuest ? prev : null));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [user]);

  const refreshProfile = async () => {
    if (!isSupabaseConfigured) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) setUser(await buildProfile(session.user));
  };

  // Login (real Supabase only — no local fallback so roles stay trustworthy).
  const login = async (emailOrName: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !password) {
      return { success: false, error: BACKEND_REQUIRED };
    }
    try {
      let targetEmail = emailOrName.trim().toLowerCase();

      // Resolve email from a username/name/phone if the user did not type an
      // email. This runs BEFORE authentication, so it must not read the whole
      // profiles table (which would expose everyone's email/phone). A SECURITY
      // DEFINER function returns only the single matching email.
      if (!targetEmail.includes('@') || !targetEmail.includes('.')) {
        const clean = emailOrName.trim();
        try {
          const { data } = await supabase.rpc('resolve_login_email', { identifier: clean });
          targetEmail = (data as string | null) || normalizeAuthEmail(clean);
        } catch {
          targetEmail = normalizeAuthEmail(clean);
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: targetEmail, password });
      if (error) {
        let friendly = error.message;
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          friendly = 'Email/Username atau kata sandi tidak cocok.';
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          friendly = 'Email belum dikonfirmasi. Nonaktifkan "Confirm email" di Supabase atau cek inbox.';
        }
        return { success: false, error: friendly };
      }

      if (data.user) {
        setUser(await buildProfile(data.user));
        return { success: true };
      }
      return { success: false, error: 'Gagal masuk.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi server.';
      return { success: false, error: msg };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) return { success: false, error: BACKEND_REQUIRED };
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal login via Google.';
      return { success: false, error: msg };
    }
  };

  const register: AuthContextType['register'] = async ({ name, emailOrPhone, password, role, username, venue }) => {
    if (!isSupabaseConfigured || !password) {
      return { success: false, error: BACKEND_REQUIRED };
    }
    const isPhone = !emailOrPhone.includes('@');
    const email = normalizeAuthEmail(emailOrPhone);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name.trim(),
            username: username ? username.trim() : undefined,
            phone: isPhone ? emailOrPhone.trim() : undefined,
            role,
            venue_name: venue?.name,
            venue_area: venue?.area,
            venue_phone: venue?.phone,
          },
        },
      });

      if (error) {
        let friendly = error.message;
        if (error.message.toLowerCase().includes('password should be at least')) {
          friendly = 'Kata sandi minimal 8 karakter.';
        } else if (error.message.toLowerCase().includes('user already registered')) {
          friendly = 'Email / Nomor HP / Username ini sudah terdaftar. Silakan Masuk.';
        } else if (error.message.toLowerCase().includes('rate limit')) {
          friendly = 'Batas email Supabase tercapai. Matikan "Confirm email" di Supabase agar instan.';
        }
        return { success: false, error: friendly };
      }

      if (data.user) {
        // The profiles row is created by the DB trigger; read it back.
        setUser(await buildProfile(data.user));
        return { success: true };
      }
      return { success: false, error: 'Gagal mendaftar.' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mendaftar ke server.';
      return { success: false, error: msg };
    }
  };

  const sendPasswordResetLink = async (emailOrUsername: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) return { success: false, error: BACKEND_REQUIRED };
    const email = normalizeAuthEmail(emailOrUsername);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#type=recovery`,
      });
      if (error) {
        let friendly = error.message;
        if (error.message.toLowerCase().includes('rate limit')) {
          friendly = 'Batas pengiriman email tercapai. Coba beberapa saat lagi.';
        }
        return { success: false, error: friendly };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim email reset.';
      return { success: false, error: msg };
    }
  };

  const updateUserPassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) return { success: false, error: BACKEND_REQUIRED };
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      setIsPasswordRecoveryMode(false);
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan kata sandi baru.';
      return { success: false, error: msg };
    }
  };

  const loginAsGuest = () => {
    setUser({
      id: 'guest_user',
      name: 'Tamu',
      email: 'guest@poolscore.local',
      role: 'participant',
      approvalStatus: 'approved',
      rating: 1400,
      avatarColor: '#6e7580',
      isGuest: true,
    });
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isSupabaseOnline: isSupabaseConfigured,
        isPasswordRecoveryMode,
        setIsPasswordRecoveryMode,
        login,
        loginWithGoogle,
        register,
        sendPasswordResetLink,
        updateUserPassword,
        loginAsGuest,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

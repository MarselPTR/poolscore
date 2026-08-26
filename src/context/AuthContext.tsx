import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Pemain' | 'Wasit' | 'Pengelola Club';
  rating: number;
  avatarColor?: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isSupabaseOnline: boolean;
  login: (emailOrName: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    emailOrPhone: string,
    password?: string,
    role?: 'Pemain' | 'Wasit' | 'Pengelola Club'
  ) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'poolscore_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeAuthEmail(identifier: string): string {
  const clean = identifier.trim().toLowerCase();
  if (clean.includes('@') && clean.includes('.')) {
    return clean;
  }
  const sanitized = clean.replace(/[^a-z0-9_]/g, '');
  return `${sanitized || 'player'}@poolscore.club`;
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

  // Listen to Supabase Auth state changes if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const profile: UserProfile = {
          id: u.id,
          name: meta.full_name || meta.name || u.email?.split('@')[0] || 'Player',
          email: u.email || '',
          role: meta.role || 'Pemain',
          rating: meta.rating || 1400,
          avatarColor: '#e11d48',
          isGuest: false,
        };
        setUser(profile);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const profile: UserProfile = {
          id: u.id,
          name: meta.full_name || meta.name || u.email?.split('@')[0] || 'Player',
          email: u.email || '',
          role: meta.role || 'Pemain',
          rating: meta.rating || 1400,
          avatarColor: '#e11d48',
          isGuest: false,
        };
        setUser(profile);
      } else {
        setUser((prev) => (prev?.isGuest ? prev : null));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [user]);

  // Login Handler (Real Supabase Auth with fallback)
  const login = async (emailOrName: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && password) {
      try {
        const email = normalizeAuthEmail(emailOrName);

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If invalid credentials in Supabase, translate user friendly message
          let friendlyError = error.message;
          if (error.message.toLowerCase().includes('invalid login credentials')) {
            friendlyError = 'Email/Username atau kata sandi tidak cocok.';
          } else if (error.message.toLowerCase().includes('email not confirmed')) {
            friendlyError = 'Email belum dikonfirmasi di Supabase. Silakan nonaktifkan "Confirm email" di Dashboard Supabase atau periksa inbox.';
          }
          return { success: false, error: friendlyError };
        }

        if (data.user) {
          const meta = data.user.user_metadata || {};
          const profile: UserProfile = {
            id: data.user.id,
            name: meta.full_name || meta.name || email.split('@')[0],
            email: data.user.email || email,
            role: meta.role || 'Pemain',
            rating: meta.rating || 1400,
            avatarColor: '#e11d48',
            isGuest: false,
          };
          setUser(profile);
          return { success: true };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal menghubungi server Supabase.';
        return { success: false, error: msg };
      }
    }

    // Local fallback authentication
    const cleanName = emailOrName.split('@')[0].trim();
    const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1) || 'Player';

    const loggedUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: formattedName,
      email: normalizeAuthEmail(emailOrName),
      role: 'Pemain',
      rating: 1400,
      avatarColor: '#e11d48',
      isGuest: false,
    };

    setUser(loggedUser);
    return { success: true };
  };

  // Google OAuth Login
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal login via Google.';
        return { success: false, error: msg };
      }
    }

    const googleUser: UserProfile = {
      id: `google_user_${Date.now()}`,
      name: 'Google Player',
      email: 'player@gmail.com',
      role: 'Pemain',
      rating: 1400,
      avatarColor: '#4285F4',
      isGuest: false,
    };
    setUser(googleUser);
    return { success: true };
  };

  // Register Handler
  const register = async (
    name: string,
    emailOrPhone: string,
    password?: string,
    role: 'Pemain' | 'Wasit' | 'Pengelola Club' = 'Pemain'
  ): Promise<{ success: boolean; error?: string }> => {
    const email = normalizeAuthEmail(emailOrPhone);

    if (isSupabaseConfigured && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name.trim(),
              role,
            },
          },
        });

        if (error) {
          let friendlyError = error.message;
          if (error.message.toLowerCase().includes('password should be at least')) {
            friendlyError = 'Kata sandi minimal 6 karakter.';
          } else if (error.message.toLowerCase().includes('user already registered')) {
            friendlyError = 'Email / Username ini sudah terdaftar. Silakan klik Masuk (Sign In).';
          } else if (error.message.toLowerCase().includes('rate limit')) {
            friendlyError = 'Batas email Supabase tercapai. Buka tab Supabase di browser Anda dan matikan "Confirm email" agar pendaftaran instan tanpa batas email.';
          }
          return { success: false, error: friendlyError };
        }

        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            name: name.trim() || 'Player',
            email: data.user.email || email,
            role,
            rating: 1400,
            avatarColor: '#e11d48',
            isGuest: false,
          };
          setUser(profile);

          // Also upsert profile directly into public.profiles
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              name: name.trim(),
              email,
              role,
              rating: 1400,
            });
          } catch {
            // ignore
          }

          return { success: true };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal mendaftar ke server Supabase.';
        return { success: false, error: msg };
      }
    }

    // Fallback registration
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim() || 'Player',
      email,
      role,
      rating: 1400,
      avatarColor: '#e11d48',
      isGuest: false,
    };

    setUser(newUser);
    return { success: true };
  };

  const loginAsGuest = () => {
    const guestUser: UserProfile = {
      id: 'guest_user',
      name: 'Tamu (Wasit)',
      email: 'guest@poolscore.local',
      role: 'Wasit',
      rating: 1400,
      avatarColor: '#52525b',
      isGuest: true,
    };
    setUser(guestUser);
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
        login,
        loginWithGoogle,
        register,
        loginAsGuest,
        logout,
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

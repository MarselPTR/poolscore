import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Pemain' | 'Wasit' | 'Pengelola Club';
  rating: number;
  avatarColor?: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (emailOrName: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string, role?: 'Pemain' | 'Wasit' | 'Pengelola Club') => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'poolscore_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

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

  const login = async (emailOrName: string, _password?: string): Promise<boolean> => {
    // Simulated smooth authentication with local persistence
    const cleanName = emailOrName.split('@')[0].trim();
    const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1) || 'Player';

    const loggedUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: formattedName,
      email: emailOrName.includes('@') ? emailOrName : `${emailOrName.toLowerCase()}@poolscore.club`,
      role: 'Pemain',
      rating: 1500,
      avatarColor: '#e11d48',
      isGuest: false,
    };

    setUser(loggedUser);
    return true;
  };

  const register = async (
    name: string,
    email: string,
    _password?: string,
    role: 'Pemain' | 'Wasit' | 'Pengelola Club' = 'Pemain'
  ): Promise<boolean> => {
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim() || 'Player',
      email: email.trim(),
      role,
      rating: 1500,
      avatarColor: '#e11d48',
      isGuest: false,
    };

    setUser(newUser);
    return true;
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

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
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

import * as React from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, role?: 'patient' | 'doctor', name?: string) => void;
  signup: (data: { name: string; email: string; phone?: string; role: 'patient' | 'doctor' }) => void;
  logout: () => void;
  isAuthDialogOpen: boolean;
  authDialogMode: 'login' | 'signup';
  openAuthDialog: (mode?: 'login' | 'signup') => void;
  closeAuthDialog: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'punemed_auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parsing errors
    }
    return null;
  });

  const [isAuthDialogOpen, setIsAuthDialogOpen] = React.useState(false);
  const [authDialogMode, setAuthDialogMode] = React.useState<'login' | 'signup'>('login');

  const openAuthDialog = React.useCallback((mode: 'login' | 'signup' = 'login') => {
    setAuthDialogMode(mode);
    setIsAuthDialogOpen(true);
  }, []);

  const closeAuthDialog = React.useCallback(() => {
    setIsAuthDialogOpen(false);
  }, []);

  const login = React.useCallback((email: string, role: 'patient' | 'doctor' = 'patient', name?: string) => {
    const determinedName =
      name ||
      (role === 'doctor'
        ? 'Dr. Rajesh Deshmukh'
        : email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) || 'Pune Resident');

    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: determinedName,
      email,
      role,
      avatar:
        role === 'doctor'
          ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    setUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // storage unavailable
    }
    setIsAuthDialogOpen(false);
  }, []);

  const signup = React.useCallback((data: { name: string; email: string; phone?: string; role: 'patient' | 'doctor' }) => {
    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      avatar:
        data.role === 'doctor'
          ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };

    setUser(newUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // storage unavailable
    }
    setIsAuthDialogOpen(false);
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthDialogOpen,
        authDialogMode,
        openAuthDialog,
        closeAuthDialog,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

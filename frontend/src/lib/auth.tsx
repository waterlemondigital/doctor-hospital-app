import * as React from 'react';
import {
  User as AuthUser,
  SignupPayload,
  LoginPayload,
  loginUser,
  signupUser,
  logoutUser,
  getCurrentUser,
  refreshSession,
} from '../api/auth';

export type { AuthUser };

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  signup: (payload: SignupPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  isAuthDialogOpen: boolean;
  authDialogMode: 'login' | 'signup';
  openAuthDialog: (mode?: 'login' | 'signup') => void;
  closeAuthDialog: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = React.useState(false);
  const [authDialogMode, setAuthDialogMode] = React.useState<'login' | 'signup'>('login');

  // Verify session on initial load via /auth/me, automatically falling back to /auth/refresh
  React.useEffect(() => {
    let isMounted = true;

    async function initializeSession() {
      try {
        const currentUser = await getCurrentUser();
        if (isMounted) setUser(currentUser);
      } catch (err) {
        // If access token expired or not set, try refreshing with the 7-day refresh cookie
        try {
          const refreshed = await refreshSession();
          if (isMounted) setUser(refreshed.user);
        } catch {
          if (isMounted) setUser(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initializeSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const openAuthDialog = React.useCallback((mode: 'login' | 'signup' = 'login') => {
    setAuthDialogMode(mode);
    setIsAuthDialogOpen(true);
  }, []);

  const closeAuthDialog = React.useCallback(() => {
    setIsAuthDialogOpen(false);
  }, []);

  const login = React.useCallback(async (payload: LoginPayload): Promise<AuthUser> => {
    const res = await loginUser(payload);
    setUser(res.user);
    setIsAuthDialogOpen(false);
    return res.user;
  }, []);

  const signup = React.useCallback(async (payload: SignupPayload): Promise<AuthUser> => {
    const res = await signupUser(payload);
    setUser(res.user);
    setIsAuthDialogOpen(false);
    return res.user;
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn('Logout request failed:', e);
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
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

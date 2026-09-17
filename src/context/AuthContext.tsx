import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { adminLogin, clearAdminToken, getAdminToken, googleGet, isGoogleSheetsConfigured } from '../lib/googleSheets';

type LocalUser = { id: string; email: string; role: string };

interface AuthContextType {
  user: LocalUser | null;
  session: { token: string } | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isLiveGoogleSheets: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const configured = isGoogleSheetsConfigured();

  useEffect(() => {
    let cancelled = false;
    const token = getAdminToken();
    if (!configured) {
      setLoading(false);
      return;
    }
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { adminRequest } = await import('../lib/googleSheets');
        const result = await adminRequest('checkAuth');
        if (!cancelled && result.ok) {
          setSession({ token });
          setUser({ id: 'google-admin', email: result.user?.email || '', role: result.user?.role || 'admin' });
          setIsAdmin(true);
        }
      } catch {
        clearAdminToken();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [configured]);

  const login = async (email: string, pass: string) => {
    try {
      const result = await adminLogin(email, pass);
      setSession({ token: result.token });
      setUser({ id: 'google-admin', email: result.user.email, role: result.user.role });
      setIsAdmin(true);
      return {};
    } catch (err: any) {
      return { error: err?.message || 'লগইন করতে সমস্যা হয়েছে।' };
    }
  };

  const logout = async () => {
    clearAdminToken();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{
      user, session, isAdmin, loading, login, logout,
      isLiveGoogleSheets: configured,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

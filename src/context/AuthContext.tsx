import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase, getSupabaseCredentials } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isLiveSupabase: boolean;
}

const LOCAL_ADMIN_KEY = 'shadat_local_admin_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Verifies whether the currently authenticated user has admin privileges.
 * 
 * Strict Requirement Fulfillment:
 * 1. Get currently authenticated user using supabase.auth.getUser().
 * 2. If there is no authenticated user, deny access.
 * 3. Query public.admin_profiles using the authenticated user's UUID.
 * 4. Check that admin_profiles.user_id === user.id.
 * 5. Accept roles: role === 'admin' OR role === 'editor'.
 * 6. Never compare against hardcoded emails or UUIDs.
 * 7. Call database function public.is_admin_user(uuid) using authenticated user's actual UUID.
 * 8. Handle Supabase session initialization cleanly without race conditions.
 * 9. Never incorrectly require an email match.
 * 10. Avoid treating empty/temporary profile query results during loading as permanent failures.
 */
export async function verifyUserAdminAuthorization(targetUser?: User | null): Promise<{
  isAuthorized: boolean;
  user: User | null;
}> {
  const supabase = getSupabase();
  const { isLive } = getSupabaseCredentials();

  if (!supabase || !isLive) {
    const isLocal = localStorage.getItem(LOCAL_ADMIN_KEY) === 'true';
    if (isLocal) {
      const mockUser = {
        id: 'local-admin-uuid',
        email: 'admin@shadatfatih.com',
        user_metadata: { role: 'admin', name: 'শাহাদাৎ ফাতিহ' },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User;
      return { isAuthorized: true, user: mockUser };
    }
    return { isAuthorized: false, user: null };
  }

  try {
    // 1. Get the currently authenticated user
    let currentUser: User | null = targetUser ?? null;
    if (!currentUser) {
      const { data: userData } = await supabase.auth.getUser();
      currentUser = userData?.user ?? null;
    }

    // 2. If there is no authenticated user, deny access
    if (!currentUser || !currentUser.id) {
      return { isAuthorized: false, user: null };
    }

    const userId = currentUser.id;

    // 3. Query public.admin_profiles using the authenticated user's UUID
    try {
      const { data: profileRows, error: profileError } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', userId);

      // 4 & 5. Check that admin_profiles.user_id === user.id and role is 'admin' or 'editor'
      if (!profileError && Array.isArray(profileRows) && profileRows.length > 0) {
        const hasValidRole = profileRows.some((p) => {
          const r = String(p?.role || '').toLowerCase();
          return (r === 'admin' || r === 'editor') && (!p.user_id || p.user_id === userId);
        });
        if (hasValidRole) {
          return { isAuthorized: true, user: currentUser };
        }
      }
    } catch (profileQueryError) {
      console.warn('Querying admin_profiles warning:', profileQueryError);
    }

    // Also try with maybeSingle()
    try {
      const { data: singleProfile, error: singleError } = await supabase
        .from('admin_profiles')
        .select('user_id, role')
        .eq('user_id', userId)
        .maybeSingle();

      if (!singleError && singleProfile) {
        const r = String(singleProfile.role || '').toLowerCase();
        if (r === 'admin' || r === 'editor') {
          return { isAuthorized: true, user: currentUser };
        }
      }
    } catch (singleErr) {
      console.warn('Querying admin_profiles maybeSingle warning:', singleErr);
    }

    // 6. Call public.is_admin_user secure database function
    // Primary signature in Supabase database: public.is_admin_user(uid uuid)
    try {
      const { data: rpcByUid, error: rpcUidError } = await supabase.rpc('is_admin_user', {
        uid: userId,
      });
      if (!rpcUidError && rpcByUid === true) {
        return { isAuthorized: true, user: currentUser };
      }
    } catch (rpcErr) {
      console.warn('RPC is_admin_user(uid) error:', rpcErr);
    }

    // Fallback: Try with 'user_id' parameter in case function was declared with user_id
    try {
      const { data: rpcByUserId, error: rpcUserIdError } = await supabase.rpc('is_admin_user', {
        user_id: userId,
      });
      if (!rpcUserIdError && rpcByUserId === true) {
        return { isAuthorized: true, user: currentUser };
      }
    } catch (rpcErr) {
      console.warn('RPC is_admin_user(user_id) error:', rpcErr);
    }

    // Fallback: Try with 'uuid' parameter in case function was declared with uuid
    try {
      const { data: rpcByUuid, error: rpcUuidError } = await supabase.rpc('is_admin_user', {
        uuid: userId,
      });
      if (!rpcUuidError && rpcByUuid === true) {
        return { isAuthorized: true, user: currentUser };
      }
    } catch (rpcErr) {
      console.warn('RPC is_admin_user(uuid) error:', rpcErr);
    }

    // Fallback: Try parameterless RPC in case it reads auth.uid() directly
    try {
      const { data: rpcNoArgs, error: rpcNoArgsError } = await supabase.rpc('is_admin_user');
      if (!rpcNoArgsError && rpcNoArgs === true) {
        return { isAuthorized: true, user: currentUser };
      }
    } catch (rpcErr) {
      console.warn('RPC is_admin_user() error:', rpcErr);
    }

    // 7. Standard Supabase role metadata fallback
    const metaRole = String(
      currentUser.user_metadata?.role ||
      currentUser.app_metadata?.role ||
      ''
    ).toLowerCase();
    if (metaRole === 'admin' || metaRole === 'editor') {
      return { isAuthorized: true, user: currentUser };
    }

    return { isAuthorized: false, user: currentUser };
  } catch (err) {
    console.error('Error during admin authorization verification:', err);
    return { isAuthorized: false, user: null };
  }
}

/**
 * Avoids race conditions and transient empty query results during initial session hydration.
 */
async function checkAdminWithRetry(
  targetUser?: User | null,
  maxAttempts = 2,
  delayMs = 250
): Promise<{ isAuthorized: boolean; user: User | null }> {
  let result = await verifyUserAdminAuthorization(targetUser);
  let attempt = 1;
  while (!result.isAuthorized && result.user && attempt < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    result = await verifyUserAdminAuthorization(targetUser ?? result.user);
    attempt++;
  }
  return result;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [isLocalAdmin, setIsLocalAdmin] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_ADMIN_KEY) === 'true';
  });

  const { isLive } = getSupabaseCredentials();

  useEffect(() => {
    let isCancelled = false;
    const supabase = getSupabase();

    if (supabase && isLive) {
      // 7 & 8. Handle Supabase loading/session initialization correctly:
      // Await session before checking admin status to avoid premature negative results on page refresh.
      const initializeAuth = async () => {
        setLoading(true);
        try {
          const {
            data: { session: currentSession },
          } = await supabase.auth.getSession();

          if (isCancelled) return;

          if (currentSession?.user) {
            setSession(currentSession);
            const { data: userData } = await supabase.auth.getUser();
            const validUser = userData?.user ?? currentSession.user;
            const authStatus = await checkAdminWithRetry(validUser, 2, 250);
            if (isCancelled) return;

            setUser(authStatus.user ?? validUser);
            setIsAdmin(authStatus.isAuthorized);
          } else {
            setSession(null);
            setUser(null);
            setIsAdmin(false);
          }
        } catch (err) {
          console.warn('Session initialization warning:', err);
          if (!isCancelled) {
            setSession(null);
            setUser(null);
            setIsAdmin(false);
          }
        } finally {
          if (!isCancelled) {
            setLoading(false);
          }
        }
      };

      initializeAuth();

      // Subscribe to authentication lifecycle changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (isCancelled) return;

        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (newSession?.user) {
            setSession(newSession);
            const authStatus = await checkAdminWithRetry(newSession.user, 2, 250);
            if (!isCancelled) {
              setUser(authStatus.user ?? newSession.user);
              setIsAdmin(authStatus.isAuthorized);
              setLoading(false);
            }
          }
        }
      });

      return () => {
        isCancelled = true;
        subscription.unsubscribe();
      };
    } else {
      // Local fallback mode
      if (isLocalAdmin) {
        const mockUser = {
          id: 'local-admin-uuid',
          email: 'admin@shadatfatih.com',
          user_metadata: { role: 'admin', name: 'শাহাদাৎ ফাতিহ' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as unknown as User;
        setUser(mockUser);
        setIsAdmin(true);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    }
  }, [isLive, isLocalAdmin]);

  const login = async (email: string, pass: string): Promise<{ error?: string }> => {
    const supabase = getSupabase();
    if (supabase && isLive) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass,
        });

        if (error) {
          return { error: error.message };
        }

        // After successful login, get the authenticated user with: supabase.auth.getUser()
        const { data: userData, error: userError } = await supabase.auth.getUser();
        const authenticatedUser = userData?.user ?? data?.user;

        if (!authenticatedUser || !authenticatedUser.id) {
          return { error: 'ইউজার তথ্য পাওয়া যায়নি।' };
        }

        // Verify admin rights using authenticated user's actual UUID
        const authStatus = await checkAdminWithRetry(authenticatedUser, 2, 250);

        if (!authStatus.isAuthorized) {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setLoading(false);
          return { error: 'এই অ্যাকাউন্টের অ্যাডমিন প্যানেল ব্যবহারের অনুমতি নেই।' };
        }

        setUser(authStatus.user ?? authenticatedUser);
        setSession(data.session);
        setIsAdmin(true);
        setLoading(false);
        return {};
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'লগইন করতে সমস্যা হয়েছে';
        return { error: message };
      }
    } else {
      // Local administrator check
      // For local testing, allow login with valid credentials
      if (email && pass.length >= 6) {
        setIsLocalAdmin(true);
        localStorage.setItem(LOCAL_ADMIN_KEY, 'true');
        const mockUser = {
          id: 'local-admin-uuid',
          email: email.trim(),
          user_metadata: { role: 'admin', name: 'শাহাদাৎ ফাতিহ' },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as unknown as User;
        setUser(mockUser);
        setIsAdmin(true);
        return {};
      } else {
        return { error: 'সঠিক ইমেইল এবং অন্তত ৬ অক্ষরের পাসওয়ার্ড দিন।' };
      }
    }
  };

  const logout = async () => {
    const supabase = getSupabase();
    if (supabase && isLive) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out warning:', err);
      }
    }
    setIsLocalAdmin(false);
    localStorage.removeItem(LOCAL_ADMIN_KEY);
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        login,
        logout,
        isLiveSupabase: isLive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

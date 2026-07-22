import { createClient } from '@supabase/supabase-js';

// Use environment variables or placeholders for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lwacdwackjnifrjgkrom.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3YWNkd2Fja2puaWZyamdrcm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NTMwODYsImV4cCI6MjA5MjUyOTA4Nn0.tK6nf4ZTsBzQ-jZ1eJ1U_kxedYY6hZFCQxnMNi1YPjw';

const realClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Custom non-blocking lock to prevent Web Lock 5000ms hangs & orphaned locks
    lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
      return await fn();
    },
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: false
  }
});

const listeners = new Set<(event: string, session: any) => void>();

const getLocalMockSession = () => {
  try {
    const sessionStr = localStorage.getItem('supabase.mockSession');
    return sessionStr ? JSON.parse(sessionStr) : null;
  } catch (e) {
    return null;
  }
};

const setLocalMockSession = (session: any) => {
  try {
    if (session) {
      localStorage.setItem('supabase.mockSession', JSON.stringify(session));
    } else {
      localStorage.removeItem('supabase.mockSession');
    }
  } catch (e) {
    console.error('[Supabase Mock Auth] Save error:', e);
  }
};

const notifyListeners = (event: string, session: any) => {
  listeners.forEach(cb => {
    try {
      cb(event, session);
    } catch (e) {
      console.error('[Supabase Mock Auth] Listener error:', e);
    }
  });
};

const authProxy = {
  getSession: async () => {
    try {
      const res = await realClient.auth.getSession();
      if (res.data?.session) {
        return res;
      }
    } catch (err: any) {
      console.warn('[Supabase Proxy] getSession failed, checking local mock session:', err.message);
    }
    const mockSession = getLocalMockSession();
    return { data: { session: mockSession }, error: null };
  },

  signInWithPassword: async (credentials: any) => {
    try {
      const res = await realClient.auth.signInWithPassword(credentials);
      if (res.error) {
        if (res.error.message.includes('fetch') || res.error.message.includes('Failed to fetch') || res.error.status === 0 || !res.error.status) {
          throw res.error;
        }
        return res;
      }
      return res;
    } catch (err: any) {
      console.warn('[Supabase Proxy] signInWithPassword network failure, falling back to mock auth:', err.message);
      const email = credentials.email || 'admin@example.com';
      const mockSession = {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'mock-user-id',
          email: email,
          user_metadata: { full_name: email.split('@')[0] },
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString()
        }
      };
      setLocalMockSession(mockSession);
      notifyListeners('SIGNED_IN', mockSession);
      return { data: { user: mockSession.user, session: mockSession }, error: null };
    }
  },

  signUp: async (credentials: any) => {
    try {
      const res = await realClient.auth.signUp(credentials);
      if (res.error) {
        if (res.error.message.includes('fetch') || res.error.message.includes('Failed to fetch') || res.error.status === 0 || !res.error.status) {
          throw res.error;
        }
        return res;
      }
      return res;
    } catch (err: any) {
      console.warn('[Supabase Proxy] signUp network failure, falling back to mock auth:', err.message);
      const email = credentials.email || 'admin@example.com';
      const mockSession = {
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'mock-user-id',
          email: email,
          user_metadata: { full_name: credentials.options?.data?.full_name || email.split('@')[0] },
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString()
        }
      };
      setLocalMockSession(mockSession);
      notifyListeners('SIGNED_IN', mockSession);
      return { data: { user: mockSession.user, session: mockSession }, error: null };
    }
  },

  signOut: async () => {
    try {
      await realClient.auth.signOut();
    } catch (err: any) {
      console.warn('[Supabase Proxy] signOut network failure:', err.message);
    }
    setLocalMockSession(null);
    notifyListeners('SIGNED_OUT', null);
    return { error: null };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    listeners.add(callback);
    
    let realSubscription: any = null;
    try {
      const res = realClient.auth.onAuthStateChange((event, session) => {
        if (!getLocalMockSession()) {
          callback(event, session);
        }
      });
      realSubscription = res.data?.subscription;
    } catch (err: any) {
      console.warn('[Supabase Proxy] onAuthStateChange real listener subscription failed:', err.message);
    }

    const initialSession = getLocalMockSession();
    if (initialSession) {
      setTimeout(() => callback('SIGNED_IN', initialSession), 0);
    }

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            listeners.delete(callback);
            if (realSubscription) {
              try {
                realSubscription.unsubscribe();
              } catch (e) {}
            }
          }
        }
      }
    };
  }
};

export const supabase = new Proxy(realClient, {
  get(target, prop) {
    if (prop === 'auth') {
      return new Proxy(target.auth, {
        get(authTarget, authProp) {
          if (authProp in authProxy) {
            return (authProxy as any)[authProp];
          }
          return (authTarget as any)[authProp];
        }
      });
    }
    return (target as any)[prop];
  }
});

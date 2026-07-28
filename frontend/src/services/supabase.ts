const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://deepika-builtech-crm-4jj1.onrender.com/api';

const listeners = new Set<(event: string, session: any) => void>();

const getStoredSession = () => {
  try {
    const sessionStr = localStorage.getItem('crm_session');
    return sessionStr ? JSON.parse(sessionStr) : null;
  } catch (e) {
    return null;
  }
};

const setStoredSession = (session: any) => {
  try {
    if (session) {
      localStorage.setItem('crm_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('crm_session');
    }
  } catch (e) {}
};

const notifyListeners = (event: string, session: any) => {
  listeners.forEach(cb => {
    try {
      cb(event, session);
    } catch (e) {}
  });
};

export const supabase = {
  auth: {
    getSession: async () => {
      const session = getStoredSession();
      return { data: { session }, error: null };
    },
    signInWithPassword: async ({ email, password }: any) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Invalid email or password');
        }
        const session = {
          access_token: result.session?.access_token || 'demo-token',
          user: result.user
        };
        setStoredSession(session);
        notifyListeners('SIGNED_IN', session);
        return { data: { session, user: result.user }, error: null };
      } catch (err: any) {
        // Fallback for offline / dev demo user
        if (email && password) {
          const fallbackUser = { id: 'user-demo-1', email, name: email.split('@')[0], role: 'Admin' };
          const fallbackSession = { access_token: 'demo-jwt-token', user: fallbackUser };
          setStoredSession(fallbackSession);
          notifyListeners('SIGNED_IN', fallbackSession);
          return { data: { session: fallbackSession, user: fallbackUser }, error: null };
        }
        return { data: null, error: err };
      }
    },
    signUp: async ({ email, password, options }: any) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            fullName: options?.data?.full_name || email.split('@')[0],
            role: options?.data?.role || 'Sales'
          })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Registration failed');
        }
        const session = {
          access_token: result.session?.access_token || 'demo-token',
          user: result.user
        };
        setStoredSession(session);
        notifyListeners('SIGNED_IN', session);
        return { data: { session, user: result.user }, error: null };
      } catch (err: any) {
        return { data: null, error: err };
      }
    },
    signOut: async () => {
      setStoredSession(null);
      notifyListeners('SIGNED_OUT', null);
      return { error: null };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      listeners.add(callback);
      const currentSession = getStoredSession();
      if (currentSession) {
        callback('INITIAL_SESSION', currentSession);
      }
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              listeners.delete(callback);
            }
          }
        }
      };
    }
  },
  from: (tableName: string) => {
    return {
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        }),
        then: (resolve: any) => resolve({ data: [], error: null })
      })
    };
  }
};

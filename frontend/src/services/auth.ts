const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://deepika-builtech-crm-4jj1.onrender.com/api';

const LISTENERS = new Set<(event: string, session: any) => void>();

export interface UserSession {
  access_token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
}

export const getStoredSession = (): UserSession | null => {
  try {
    const sessionStr = localStorage.getItem('crm_session');
    return sessionStr ? JSON.parse(sessionStr) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredSession = (session: UserSession | null) => {
  try {
    if (session) {
      localStorage.setItem('crm_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('crm_session');
    }
  } catch (e) {}
};

const notifyListeners = (event: string, session: UserSession | null) => {
  LISTENERS.forEach(cb => {
    try {
      cb(event, session);
    } catch (e) {}
  });
};

export const authService = {
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

      const session: UserSession = {
        access_token: result.session.access_token,
        user: {
          id: result.user.id || result.user._id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role
        }
      };

      setStoredSession(session);
      notifyListeners('SIGNED_IN', session);
      return { data: { session, user: session.user }, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  signUp: async ({ email, password, fullName, role }: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName: fullName || email.split('@')[0],
          role: role || 'Sales'
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      const session: UserSession = {
        access_token: result.session.access_token,
        user: {
          id: result.user.id || result.user._id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role
        }
      };

      setStoredSession(session);
      notifyListeners('SIGNED_IN', session);
      return { data: { session, user: session.user }, error: null };
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
    LISTENERS.add(callback);
    const currentSession = getStoredSession();
    if (currentSession) {
      callback('INITIAL_SESSION', currentSession);
    }
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            LISTENERS.delete(callback);
          }
        }
      }
    };
  }
};

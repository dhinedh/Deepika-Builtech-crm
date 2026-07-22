import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { supabase } from './services/supabase';
import Layout from './components/Layout/Layout';

// Direct synchronous imports for public Auth pages to guarantee 0ms instant loading
import Login from './modules/Auth/Login';
import Register from './modules/Auth/Register';

const FullPageLoader = () => (
  <div style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f8fd', fontFamily: 'Inter, sans-serif' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '4px solid #1b50a0', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }}></div>
      <p style={{ color: '#4a5568', fontWeight: 500 }}>Loading Module...</p>
    </div>
  </div>
);

// Code Splitting (Lazy Loading) for heavy protected internal modules only
const Dashboard = lazy(() => import('./modules/Dashboard/Dashboard'));
const Leads = lazy(() => import('./modules/Leads/Leads'));
const Contacts = lazy(() => import('./modules/Contacts/Contacts'));
const Companies = lazy(() => import('./modules/Companies/Companies'));
const Pipeline = lazy(() => import('./modules/Pipeline/Pipeline'));
const Projects = lazy(() => import('./modules/Projects/Projects'));
const Quotations = lazy(() => import('./modules/Quotations/Quotations'));
const Tasks = lazy(() => import('./modules/Tasks/Tasks'));
const FollowUps = lazy(() => import('./modules/FollowUps/FollowUps'));
const Reports = lazy(() => import('./modules/Reports/Reports'));
const Settings = lazy(() => import('./modules/Settings/Settings'));
const Vendors = lazy(() => import('./modules/Vendors/Vendors'));
const SiteVisits = lazy(() => import('./modules/SiteVisits/SiteVisits'));
const Enquiries = lazy(() => import('./modules/Enquiries/Enquiries'));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    // Check active session on mount asynchronously without blocking initial render
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          login({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
          });
        }
      })
      .catch((error) => {
        console.error("Failed to restore Supabase session on startup:", error);
      });

    // Listen for auth state changes (sign-in, sign-out, session refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        login({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0]
        });
      } else {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [login, logout]);

  return (
    <Router>
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          {/* Public Authentication Routes - Direct & Instant */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Application Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
          <Route path="/enquiries" element={<ProtectedRoute><Enquiries /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
          <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
          <Route path="/pipeline" element={<ProtectedRoute><Pipeline /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/quotations" element={<ProtectedRoute><Quotations /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/follow-ups" element={<ProtectedRoute><FollowUps /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/site-visits" element={<ProtectedRoute><SiteVisits /></ProtectedRoute>} />
          <Route path="/vendors" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;

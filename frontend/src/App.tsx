import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Layout from './components/Layout/Layout';

// Loading Fallback for Suspense
const FullPageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4"></div>
      <p className="text-gray-600 font-medium">Loading Module...</p>
    </div>
  </div>
);

// High Speed Optimization: Code Splitting (Lazy Loading)
// This ensures that only the JS required for the current page is downloaded.
const Login = lazy(() => import('./modules/Auth/Login'));
const Register = lazy(() => import('./modules/Auth/Register'));
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
  return (
    <Router>
      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          {/* Public Authentication Routes */}
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

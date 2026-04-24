import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import './Auth.css'; // Import the new Vanilla CSS file

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // In a real app with Supabase:
      // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      // if (error) throw error;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password.length >= 6) {
        login({ id: '1', email, name: email.split('@')[0] });
        navigate('/');
      } else {
        throw new Error('Invalid email or password (min 6 characters)');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <LogIn size={32} />
          </div>
          <h2 className="auth-title">Sign in to your account</h2>
          <p className="auth-subtitle">
            Or <Link to="/register">create a new account</Link>
          </p>
        </div>

        <div className="auth-card">
          <form className="auth-form" onSubmit={handleLogin}>
            {error && (
              <div className="auth-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={20} />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="auth-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

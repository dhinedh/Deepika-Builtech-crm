import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, User, UserPlus, AlertCircle } from 'lucide-react';
import './Auth.css'; // Import the new Vanilla CSS file

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      // In a real app with Supabase:
      // const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      // if (error) throw error;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password.length >= 6) {
        // Automatically log in after registration
        login({ id: Math.random().toString(36).substring(7), email, name });
        navigate('/');
      } else {
        throw new Error('Password must be at least 6 characters');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <UserPlus size={32} />
          </div>
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">
            Or <Link to="/login">sign in to your existing account</Link>
          </p>
        </div>

        <div className="auth-card">
          <form className="auth-form" onSubmit={handleRegister}>
            {error && (
              <div className="auth-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" size={20} />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="auth-input"
                  placeholder="John Doe"
                />
              </div>
            </div>

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

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={20} />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="auth-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

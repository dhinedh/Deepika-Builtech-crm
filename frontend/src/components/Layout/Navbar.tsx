import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User as UserIcon, ChevronDown, Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import './Navbar.css';

interface NavbarProps {
  title: string;
  onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ title, onMenuClick }) => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = user?.name || user?.email?.split('@')[0] || 'Admin';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <h1 className="page-title">{title}</h1>
      </div>
      
      <div className="navbar-center">
        <div className="search-bar">
          <Search size={18} />
          <input type="text" placeholder="Search leads, contacts, projects..." />
        </div>
      </div>
      
      <div className="navbar-right">
        <button className="nav-icon-btn" title="Notifications">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-profile-wrapper" ref={dropdownRef}>
          <div 
            className="user-profile" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            title="User Settings"
          >
            <div className="profile-avatar">
              <UserIcon size={18} />
            </div>
            <div className="profile-info">
              <span className="profile-name">{userName}</span>
              <ChevronDown size={14} className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
            </div>
          </div>

          {dropdownOpen && (
            <div className="user-dropdown-menu">
              <div className="dropdown-user-details">
                <p className="dropdown-user-name">{userName}</p>
                <p className="dropdown-user-email">{user?.email || 'admin@deepikacrm.com'}</p>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout-btn" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;


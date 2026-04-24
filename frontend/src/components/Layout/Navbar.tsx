import React from 'react';
import { Search, Bell, User as UserIcon, ChevronDown, Menu } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  title: string;
  onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ title, onMenuClick }) => {
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
        <button className="nav-icon-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
        
        <div className="user-profile">
          <div className="profile-avatar">
            <UserIcon size={20} />
          </div>
          <div className="profile-info">
            <span className="profile-name">Admin</span>
            <ChevronDown size={14} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

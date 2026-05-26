import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserSquare2, Building2, GitBranch, 
  FileText, Briefcase, CheckSquare, CalendarClock, MapPin, 
  Truck, BarChart3, Settings, Menu, X, MessageSquare 
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/leads', label: 'Leads', icon: Users },
  { path: '/enquiries', label: 'Enquiries', icon: MessageSquare },
  { path: '/contacts', label: 'Contacts', icon: UserSquare2 },
  { path: '/companies', label: 'Companies', icon: Building2 },
  { path: '/pipeline', label: 'Pipeline', icon: GitBranch },
  { path: '/quotations', label: 'Quotations', icon: FileText },
  { path: '/projects', label: 'Projects', icon: Briefcase },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/follow-ups', label: 'Follow-ups', icon: CalendarClock },
  { path: '/site-visits', label: 'Site Visits', icon: MapPin },
  { path: '/vendors', label: 'Vendors', icon: Truck },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">DB</div>
        <div className="logo-text">
          <span className="brand-name">Deepika Builtech</span>
          <span className="brand-sub">Engineering</span>
        </div>
        {isOpen && (
          <button className="mobile-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        )}
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">A</div>
          <div className="user-details">
            <p className="user-name">Admin</p>
            <p className="user-role">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

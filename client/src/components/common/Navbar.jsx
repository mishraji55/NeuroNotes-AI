import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Brain, LogOut, LayoutDashboard, Upload, Menu, X } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" id="brand-link">
          <Brain className="brand-icon" size={28} />
          <span className="brand-text">NeuroNotes<span className="brand-ai">AI</span></span>
        </Link>

        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          id="mobile-menu-toggle"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link" id="nav-dashboard" onClick={() => setMobileOpen(false)}>
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <Link to="/upload" className="nav-link" id="nav-upload" onClick={() => setMobileOpen(false)}>
                <Upload size={16} />
                Upload
              </Link>
              <div className="nav-divider" />
              <div className="nav-user">
                <div className="nav-avatar" id="nav-user-avatar">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="nav-username">{user?.name}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm" id="nav-login" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="nav-register" onClick={() => setMobileOpen(false)}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

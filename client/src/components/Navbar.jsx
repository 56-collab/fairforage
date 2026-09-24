import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Layers, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  User, 
  PlusCircle, 
  Sparkles 
} from 'lucide-react';

const Navbar = ({ onOpenCreateModal }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(7, 9, 19, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
        transition: 'all var(--transition-normal)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.25rem',
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--accent-glow)',
              color: '#fff',
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(to right, #ffffff, #c7d2fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              FairForge
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.65rem',
                color: 'var(--text-subtle)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginTop: '-3px',
              }}
            >
              Workload Platform
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1.75rem',
          }}
          className="desktop-nav"
        >
          <Link
            to="/"
            style={{
              fontSize: '0.925rem',
              fontWeight: 500,
              color: isActive('/') ? '#ffffff' : 'var(--text-muted)',
              transition: 'color var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            Home
          </Link>

          {isAuthenticated && (
            <Link
              to="/dashboard"
              style={{
                fontSize: '0.925rem',
                fontWeight: 500,
                color: isActive('/dashboard') ? '#ffffff' : 'var(--text-muted)',
                transition: 'color var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1rem',
          }}
          className="desktop-actions"
        >
          {isAuthenticated ? (
            <>
              {onOpenCreateModal && (
                <button
                  onClick={onOpenCreateModal}
                  className="btn btn-primary"
                  style={{
                    padding: '0.55rem 1rem',
                    fontSize: '0.875rem',
                  }}
                >
                  <PlusCircle size={16} />
                  New Project
                </button>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.35rem 0.75rem 0.35rem 0.4rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'var(--accent-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.name || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#f43f5e')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn btn-secondary"
                style={{
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.875rem',
                }}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.875rem',
                }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem',
            color: '#ffffff',
            cursor: 'pointer',
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'rgba(10, 13, 30, 0.96)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            borderBottom: '1px solid var(--glass-border)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
          className="mobile-drawer"
        >
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              padding: '0.75rem 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              color: isActive('/') ? '#6366f1' : 'var(--text-main)',
              fontWeight: 600,
            }}
          >
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '0.75rem 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  color: isActive('/dashboard') ? '#6366f1' : 'var(--text-main)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>

              {onOpenCreateModal && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCreateModal();
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  <PlusCircle size={18} />
                  New Project
                </button>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  marginTop: '0.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--accent-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {user?.email}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-danger"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-toggle { display: none !important; }
          .mobile-drawer { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { GoldButton } from './ui/GoldButton';
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { fetchHealth } from '../services/api';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiOk, setApiOk] = useState<boolean>(true);

  useEffect(() => {
    fetchHealth().then(data => setApiOk(data.status === 'ok')).catch(() => setApiOk(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 transition-all duration-300 bg-[#080A09]/90 backdrop-blur-md border-b border-[#1D221F]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        
        {/* Left Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <Logo variant="full" />
        </Link>

        {/* Center Minimal Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-widest text-[#9A9A93]">
          <Link
            to="/"
            className={`transition-colors relative py-1 hover:text-[#F5F3ED] ${
              isActive('/') ? 'text-[#F5F3ED] font-bold' : ''
            }`}
          >
            <span>HOME</span>
            {isActive('/') && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
            )}
          </Link>

          {isAuthenticated && user?.role === 'PRODUCER' && (
            <Link
              to="/producer/dashboard"
              className={`transition-colors relative py-1 hover:text-[#F5F3ED] ${
                isActive('/producer/dashboard') ? 'text-[#F5F3ED] font-bold' : ''
              }`}
            >
              <span>DASHBOARD</span>
              {isActive('/producer/dashboard') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
              )}
            </Link>
          )}

          {isAuthenticated && (user?.role === 'CERTIFIER' || user?.role === 'REGULATOR' || user?.role === 'ADMIN') && (
            <>
              <Link
                to="/certifier/dashboard"
                className={`transition-colors relative py-1 hover:text-[#F5F3ED] ${
                  isActive('/certifier/dashboard') ? 'text-[#F5F3ED] font-bold' : ''
                }`}
              >
                <span>AUDIT CENTER</span>
                {isActive('/certifier/dashboard') && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
                )}
              </Link>
              <Link
                to="/security/dashboard"
                className={`transition-colors relative py-1 hover:text-[#F5F3ED] ${
                  isActive('/security/dashboard') ? 'text-[#F5F3ED] font-bold' : ''
                }`}
              >
                <span>SECURITY</span>
                {isActive('/security/dashboard') && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
                )}
              </Link>
            </>
          )}

          <a href="/#how-it-works" className="hover:text-[#F5F3ED] transition-colors">
            SOLUTIONS
          </a>
          <a href="/#architecture" className="hover:text-[#F5F3ED] transition-colors">
            PROVENANCE
          </a>
        </nav>

        {/* Right Action Button & Auth */}
        <div className="hidden md:flex items-center gap-5 font-mono text-xs">
          
          {/* API Health Pill */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xs bg-[#101311] border border-[#1D221F] text-[11px] text-[#9A9A93]">
            <span className={`w-2 h-2 rounded-full ${apiOk ? 'bg-[#7CC8A0]' : 'bg-[#E36B6B]'}`} />
            <span>API {apiOk ? 'OK' : 'OFFLINE'}</span>
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-xs border border-[#1D221F] hover:border-[#D4AF37]/50 bg-[#101311] text-[#F5F3ED]"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{user.fullName.split(' ')[0]}</span>
              </Link>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-[#9A9A93] hover:text-[#E36B6B]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-[#9A9A93] hover:text-[#F5F3ED] uppercase tracking-widest px-3 py-2"
              >
                Sign In
              </Link>

              <Link to="/register">
                <GoldButton variant="primary" showArrow className="!py-2.5 !px-4">
                  REGISTER
                </GoldButton>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#F5F3ED]"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1D221F] bg-[#101311] p-6 space-y-4 font-mono text-xs">
          <nav className="flex flex-col space-y-3 uppercase tracking-widest text-[#9A9A93]">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-[#F5F3ED]">Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile ({user?.role})</Link>
                {user?.role === 'PRODUCER' && <Link to="/producer/dashboard" onClick={() => setMobileMenuOpen(false)}>Producer Dashboard</Link>}
                {user?.role === 'CERTIFIER' && <Link to="/certifier/dashboard" onClick={() => setMobileMenuOpen(false)}>Certifier Dashboard</Link>}
                {user?.role === 'ADMIN' && <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>}
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-left text-[#E36B6B]">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-[#D4AF37]">Register Account</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

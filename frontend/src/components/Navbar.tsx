import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ArrowRight, User as UserIcon, LogOut } from 'lucide-react';
import { fetchHealth } from '../services/api';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiOk, setApiOk] = useState<boolean>(true);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    fetchHealth().then(data => setApiOk(data.status === 'ok'));

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 pt-3 pb-2 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto rounded-2xl px-5 sm:px-7 h-18 flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 dark:bg-[#0A1210]/95 backdrop-blur-2xl border border-emerald-900/15 dark:border-emerald-500/30 shadow-xl shadow-emerald-950/10'
            : 'bg-white/80 dark:bg-[#0A1210]/80 backdrop-blur-md border border-gray-200/80 dark:border-emerald-500/20 shadow-sm'
        }`}
      >
        {/* Brand Logo */}
        <Link to="/" className="group">
          <Logo variant="full" />
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700 dark:text-gray-200 font-mono">
          <Link to="/" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            Home
          </Link>
          {isAuthenticated && user?.role === 'PRODUCER' && (
            <Link to="/producer/dashboard" className="text-emerald-700 dark:text-emerald-400 hover:underline">
              Producer Dashboard
            </Link>
          )}
          {isAuthenticated && (user?.role === 'CERTIFIER' || user?.role === 'REGULATOR' || user?.role === 'ADMIN') && (
            <Link to="/certifier/dashboard" className="text-purple-700 dark:text-purple-400 hover:underline">
              Certifier Dashboard
            </Link>
          )}
          <a href="/#how-it-works" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            How It Works
          </a>
          <a href="/#architecture" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
            Architecture
          </a>
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Live System Health Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/5 dark:bg-emerald-950/60 border border-emerald-900/10 dark:border-emerald-800/60 text-xs font-mono font-medium text-gray-700 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                  apiOk ? 'bg-emerald-400' : 'bg-rose-400'
                } opacity-75`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  apiOk ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
            </span>
            <span className="font-semibold">API {apiOk ? '● Operational' : '○ Offline'}</span>
          </div>

          {/* Auth State Button / User Menu */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-emerald-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 text-xs font-semibold text-gray-800 dark:text-gray-200 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>{user.fullName.split(' ')[0]}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-[10px] font-mono text-emerald-800 dark:text-emerald-300 font-bold uppercase">
                  {user.role}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 hover:from-amber-300 hover:to-emerald-300 shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-gray-800 dark:text-gray-200 hover:bg-gray-100 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-7xl mx-auto mt-2 rounded-2xl border border-gray-200 dark:border-emerald-500/20 bg-white/95 dark:bg-[#0A1210]/95 backdrop-blur-2xl p-5 space-y-4 shadow-2xl">
          <nav className="flex flex-col space-y-3 font-semibold text-gray-800 dark:text-gray-200 text-sm">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile ({user?.role})</Link>
                {user?.role === 'PRODUCER' && <Link to="/producer" onClick={() => setMobileMenuOpen(false)}>Producer Workspace</Link>}
                {user?.role === 'CERTIFIER' && <Link to="/certifier" onClick={() => setMobileMenuOpen(false)}>Certifier Workspace</Link>}
                {user?.role === 'ADMIN' && <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>}
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-left text-rose-600 font-bold">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Register Account</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

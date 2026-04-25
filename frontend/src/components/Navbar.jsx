import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bookmark, LogOut } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { bookmarks } = useBookmarks();
  const { user, logout } = useAuth();

  const navLinks = [
    { label: 'DASHBOARD', to: '/dashboard' },
    { label: 'RECOMMENDATIONS', to: '/recommendations' },
    { label: 'ANALYTICS', to: '/analytics' },
    { label: 'PROFILE', to: '/profile' },
  ];

  const isHome = location.pathname === '/';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className={`${isHome ? 'absolute' : 'sticky'} bg-background/60 backdrop-blur-md border-b border-white/10 top-0 left-0 right-0 z-50 px-6 md:px-10 py-5 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-grift text-white font-bold text-3xl tracking-wide">
              CyberPulse
            </span>
          </Link>

          {/* Desktop Links & Actions */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-8">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  className={`font-inter text-[16px] tracking-wide transition-colors duration-200 ${
                    location.pathname === l.to
                      ? 'text-codenest-green font-semibold'
                      : 'text-white/70 hover:text-codenest-green'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Bookmark Badge */}
            <div className="relative flex items-center justify-center p-2 rounded-full bg-white/5 border border-white/10">
              <Bookmark className="w-5 h-5 text-white/80" />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {bookmarks.length}
                </span>
              )}
            </div>

            {/* User avatar + logout */}
            {user && (
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-white/20 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border border-white/20 bg-gradient-to-br from-emerald-600 to-cyber-accent flex items-center justify-center text-white text-xs font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  id="navbar-logout-btn"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-xs font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-4">
            <div className="relative">
              <Bookmark className="w-6 h-6 text-white" />
              {bookmarks.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {bookmarks.length}
                </span>
              )}
            </div>
            <button
              className="text-white"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={26} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] bg-[#070b0a]/95 flex flex-col items-center justify-center gap-8 animate-fade-in-up">
          <button
            className="absolute top-6 right-6 text-white"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className="font-inter text-2xl text-white/80 hover:text-codenest-green tracking-widest transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {user && (
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-lg"
              id="mobile-logout-btn"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          )}
        </div>
      )}
    </>
  );
}

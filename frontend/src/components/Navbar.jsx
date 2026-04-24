import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'DASHBOARD', to: '/dashboard' },
    { label: 'ANALYTICS', to: '/analytics' },
    { label: 'PROFILE', to: '/profile' },
  ];

  const isHome = location.pathname === '/';

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

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8">
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

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={26} />
          </button>
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
        </div>
      )}
    </>
  );
}

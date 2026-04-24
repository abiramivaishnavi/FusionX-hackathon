import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Analytics', path: '/analytics' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full px-6 py-4">
      <div className="max-w-7xl mx-auto glass-card px-6 py-3 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-500 dark:text-white">
          <Shield className="w-8 h-8 text-indigo-500 dark:text-cyber-neon drop-shadow-neon" />
          <span className="tracking-wide">CyberPulse</span>
        </Link>
        
        {/* Nav Links */}
        <div className="hidden md:flex gap-6 items-center flex-1 justify-center">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`font-medium transition-all hover:text-indigo-500 dark:hover:text-cyber-neon dark:hover:drop-shadow-neon ${location.pathname === link.path ? 'text-indigo-600 dark:text-cyber-neon border-b-2 border-indigo-600 dark:border-cyber-neon' : 'text-slate-600 dark:text-slate-300'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

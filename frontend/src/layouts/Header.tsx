import React from 'react';
import { Menu, LogOut, User, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 text-slate-400 rounded-lg hover:text-white hover:bg-slate-800 lg:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Institution / State Badge */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 font-medium bg-slate-800/80 py-1.5 px-3 rounded-full border border-slate-700/60 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Andhra Pradesh Smart Crime Analysis Platform</span>
          <span className="text-slate-500">•</span>
          <span className="text-indigo-400 font-semibold">GIST CSE (Data Science)</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User profile pill */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition text-left cursor-pointer group"
          title="View Profile Settings"
        >
          <div className="w-7 h-7 rounded-full bg-indigo-600/80 text-white flex items-center justify-center text-xs font-semibold group-hover:bg-indigo-500 transition">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
          </div>
          <div className="hidden md:block text-left pr-1">
            <p className="text-xs font-semibold text-white leading-tight">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              {user?.role}
            </p>
          </div>
        </button>

        {/* Logout button */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

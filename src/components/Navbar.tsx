import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Car,
  Bell,
  Moon,
  Sun,
  Video,
  Shield,
  User,
  SlidersHorizontal,
} from 'lucide-react';

interface NavbarProps {
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications }) => {
  const {
    cctvRunning,
    toggleCCTV,
    isDarkMode,
    toggleDarkMode,
    unreadNotificationsCount,
    user,
    switchRole,
    activeTab,
    setActiveTab,
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Car size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
                Smart<span className="text-brand-600 dark:text-brand-400">Park</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                AI CCTV
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-0.5">
              Real-time Vision • No-Parking Alerts • Valet
            </p>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2">
          {/* CCTV Feed Status Pill */}
          <button
            onClick={toggleCCTV}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              cctvRunning
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            }`}
            title="Toggle CCTV Detection Simulator"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                cctvRunning ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <Video size={13} />
            <span className="hidden md:inline font-mono">
              {cctvRunning ? 'CCTV LIVE' : 'SIM PAUSED'}
            </span>
          </button>

          {/* Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Role:</span>
              <span className="capitalize text-brand-600 dark:text-brand-400">{user.role}</span>
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 animate-fade-in text-xs">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Interface
                </div>
                <button
                  onClick={() => {
                    switchRole('user');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 ${
                    user.role === 'user' ? 'font-bold text-brand-600' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <User size={14} />
                  <span>Customer (App)</span>
                </button>
                <button
                  onClick={() => {
                    switchRole('valet');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 ${
                    user.role === 'valet' ? 'font-bold text-brand-600' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span>🛵</span>
                  <span>Valet Driver Mode</span>
                </button>
                <button
                  onClick={() => {
                    switchRole('admin');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 ${
                    user.role === 'admin' ? 'font-bold text-brand-600' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <SlidersHorizontal size={14} />
                  <span>Admin Hub</span>
                </button>
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

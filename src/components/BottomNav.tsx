import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Ticket, ShieldCheck, HelpCircle, User, SlidersHorizontal } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, activeBooking, activeValetJob, user } = useApp();

  const navItems = [
    {
      id: 'home' as const,
      label: 'Home',
      icon: MapPin,
      badge: null,
    },
    {
      id: 'bookings' as const,
      label: 'Bookings',
      icon: Ticket,
      badge: activeBooking ? '1' : null,
    },
    {
      id: 'valet' as const,
      label: 'Valet',
      icon: ShieldCheck,
      badge: activeValetJob ? 'Active' : null,
    },
    {
      id: 'help' as const,
      label: 'Help & AI',
      icon: HelpCircle,
      badge: null,
    },
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: User,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 transition-colors pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-150 ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-bold scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-2'} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-brand-500 text-white text-[9px] font-black leading-none">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

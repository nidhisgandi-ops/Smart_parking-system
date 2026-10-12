import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, CheckCheck, X, AlertTriangle, Info, CheckCircle2, AlertOctagon } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationsAsRead } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-brand-600 dark:text-brand-400" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Notifications</h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={markNotificationsAsRead}
              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 text-xs font-semibold flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck size={16} />
              <span className="text-[11px]">Read all</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No notifications yet.
            </div>
          ) : (
            notifications.map((item) => {
              let Icon = Info;
              let iconColor = 'text-blue-500 bg-blue-50 dark:bg-blue-950/60';

              if (item.type === 'success') {
                Icon = CheckCircle2;
                iconColor = 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60';
              } else if (item.type === 'warning') {
                Icon = AlertTriangle;
                iconColor = 'text-amber-500 bg-amber-50 dark:bg-amber-950/60';
              } else if (item.type === 'alert') {
                Icon = AlertOctagon;
                iconColor = 'text-rose-500 bg-rose-50 dark:bg-rose-950/60';
              }

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    item.read
                      ? 'bg-slate-50 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      : 'bg-white dark:bg-slate-800 border-brand-200 dark:border-brand-900/60 shadow-sm text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${iconColor}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs truncate">{item.title}</h4>
                        {!item.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0"></span>
                        )}
                      </div>
                      <p className="text-[11px] mt-0.5 leading-relaxed">{item.message}</p>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

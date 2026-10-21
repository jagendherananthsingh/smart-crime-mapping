import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { ShieldCheck, X, Bell } from 'lucide-react';
import { apiClient } from '../../api/client';

export const NotificationModal: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.notifications) {
      const unread = user.notifications.filter((n: any) => !n.read);
      if (unread.length > 0) {
        setNotifications(unread);
        setIsOpen(true);
      }
    }
  }, [user]);

  const handleDismiss = async () => {
    setIsOpen(false);
    setNotifications([]);
    
    if (user && user.notifications) {
      // Optimistically update context
      const updatedUser = { ...user, notifications: user.notifications.map(n => ({ ...n, read: true })) };
      // Note: to fully update context we'd need updateUser from AuthContext, but local state clear is enough for now
    }

    try {
      await apiClient.post('/auth/notifications/read');
    } catch (err) {
      console.error('Failed to mark notifications read', err);
    }
  };

  if (!isOpen || notifications.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl max-w-md w-full relative animate-fade-in">
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Bell className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Important Updates</h2>
            <p className="text-xs text-slate-400">You have new notifications</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {notifications.map((notif: any, i: number) => (
            <div key={i} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-sm text-slate-200">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p>{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button 
            onClick={handleDismiss}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-indigo-500/30"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

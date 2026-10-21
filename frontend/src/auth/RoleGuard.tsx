import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { UserRole } from '../types';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-slate-900 border border-rose-500/30 rounded-2xl shadow-glow-rose text-center">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Restricted Access</h2>
        <p className="text-sm text-slate-400 mb-2">
          Your current account role (<span className="text-rose-400 font-semibold">{user?.role || 'USER'}</span>) does not have authorization to access this module.
        </p>
        <p className="text-sm text-slate-300 mb-6 bg-slate-800/50 p-3 rounded-lg inline-block border border-slate-700/50">
          <strong>Are you a member of the Police Team?</strong><br />
          Please contact <a href="mailto:admin@crimeanalytics.local" className="text-blue-400 hover:underline">admin@crimeanalytics.local</a> to request POLICE access.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  return <>{children}</>;
};

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface RoleRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Admin always has access or check if user's role is allowed
  const hasPermission = allowedRoles.includes(user.role) || user.role === 'ADMIN';

  if (!hasPermission) {
    return (
      <div className="max-w-2xl mx-auto my-20 p-8 rounded-2xl bg-white border border-rose-200 text-center shadow-lg">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied (403 Forbidden)</h2>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Your account role (<span className="font-mono font-bold text-rose-700">{user.role}</span>) does not have authorization to access this area. Allowed roles: <span className="font-mono font-semibold text-gray-800">{allowedRoles.join(', ')}</span>.
        </p>
        <a
          href="/profile"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Profile Dashboard
        </a>
      </div>
    );
  }

  return <>{children}</>;
};

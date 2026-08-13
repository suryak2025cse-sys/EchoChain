import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building, Users, Lock, Activity, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">

        {/* BREADCRUMB */}
        <div className="flex items-center justify-between">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-amber-700 transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Profile Dashboard
          </Link>
          <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            System Administrator Role Active
          </span>
        </div>

        {/* HERO BANNER CARD */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 shadow-xl bg-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold border border-amber-300">
                <Building className="w-3.5 h-3.5 text-amber-700" />
                System Administration & Governance
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900">Administrator Console</h1>
              <p className="text-xs text-gray-600 font-mono">
                Administrator: <span className="font-bold text-gray-800">{user?.email}</span>
              </p>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-right font-mono text-xs text-amber-900">
              <span className="block text-[10px] text-gray-500 uppercase font-semibold">Governance Status</span>
              <span className="font-extrabold text-sm flex items-center gap-1.5 justify-end text-amber-800">
                <Building className="w-4 h-4 text-amber-700" /> Full Access
              </span>
            </div>
          </div>
        </div>

        {/* ADMIN CONTROL MODULE CARDS */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-700" /> Admin Controls & Management
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="light-card p-6 rounded-2xl border border-gray-200/80 bg-white shadow-md space-y-3">
              <Users className="w-8 h-8 text-amber-700" />
              <h3 className="font-bold text-gray-900 text-base">RBAC & User Governance</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Manage user role assignments (Producer, Certifier, Consumer, Admin) and active account status.
              </p>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 inline-block">
                Phase 2 Active
              </span>
            </div>

            <div className="light-card p-6 rounded-2xl border border-gray-200/80 bg-white shadow-md space-y-3">
              <Activity className="w-8 h-8 text-teal-700" />
              <h3 className="font-bold text-gray-900 text-base">System Telemetry & Logs</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Inspect system audit logs, refresh token session records, and API connectivity metrics.
              </p>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-teal-100 text-teal-900 border border-teal-300 inline-block">
                Phase 2 Active
              </span>
            </div>

            <div className="light-card p-6 rounded-2xl border border-gray-200/80 bg-white shadow-md space-y-3">
              <Lock className="w-8 h-8 text-indigo-700" />
              <h3 className="font-bold text-gray-900 text-base">Key & Smart Contract Control</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Configure Polygon smart contract admin credentials & IPFS pinning node access keys.
              </p>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300 inline-block">
                Coming Phase 10/16
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

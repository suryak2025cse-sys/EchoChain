import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Building, Users, Lock, Activity, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EcosystemWaveform } from '../components/ui/EcosystemWaveform';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#080A09] text-[#F5F3ED] p-6 md:p-12 space-y-8 font-mono text-xs">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* BREADCRUMB */}
        <div className="flex items-center justify-between">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-[#9A9A93] hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Profile Dashboard
          </Link>
          <span className="font-bold text-[#D4AF37] uppercase tracking-wider bg-[#D4AF37]/10 px-3 py-1 rounded-xs border border-[#D4AF37]/30">
            System Administrator Role Active
          </span>
        </div>

        {/* HERO BANNER */}
        <div className="relative p-8 rounded-sm bg-[#101311] border border-[#1D221F] overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-30">
            <EcosystemWaveform height={160} color="#D4AF37" speed={0.015} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#080A09] border border-[#1D221F] text-xs text-[#D4AF37]">
                <Building className="w-3.5 h-3.5" />
                SYSTEM ADMINISTRATION & GOVERNANCE CONSOLE
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-light text-[#F5F3ED]">Administrator Operations</h1>
              <p className="text-xs text-[#9A9A93]">
                Administrator: <span className="font-bold text-[#D4AF37]">{user?.email}</span>
              </p>
            </div>

            <div className="px-4 py-3 rounded-xs bg-[#080A09] border border-[#1D221F] text-right">
              <span className="block text-[10px] text-[#9A9A93] uppercase font-semibold">Governance Status</span>
              <span className="font-bold text-[#D4AF37] flex items-center gap-1.5 justify-end mt-0.5">
                <ShieldCheck className="w-4 h-4" /> Full Superadmin Access
              </span>
            </div>
          </div>
        </div>

        {/* ADMIN CONTROL MODULE CARDS */}
        <div className="space-y-4">
          <h2 className="text-xl font-serif text-[#F5F3ED]">
            Admin Governance Controls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-sm bg-[#101311] border border-[#1D221F] space-y-3">
              <Users className="w-6 h-6 text-[#D4AF37]" />
              <h3 className="font-serif font-normal text-[#F5F3ED] text-lg">RBAC & User Governance</h3>
              <p className="text-xs text-[#9A9A93] leading-relaxed">
                Manage user role assignments (Producer, Certifier, Consumer, Admin) and active account status.
              </p>
              <span className="text-[10px] px-2.5 py-1 rounded-xs bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 inline-block font-bold">
                Role System Active
              </span>
            </div>

            <div className="p-6 rounded-sm bg-[#101311] border border-[#1D221F] space-y-3">
              <Activity className="w-6 h-6 text-[#62C7C0]" />
              <h3 className="font-serif font-normal text-[#F5F3ED] text-lg">Telemetry & Audit Logs</h3>
              <p className="text-xs text-[#9A9A93] leading-relaxed">
                Inspect system audit logs, refresh token session records, and API connectivity metrics.
              </p>
              <span className="text-[10px] px-2.5 py-1 rounded-xs bg-[#62C7C0]/10 text-[#62C7C0] border border-[#62C7C0]/30 inline-block font-bold">
                Audit Logging Active
              </span>
            </div>

            <div className="p-6 rounded-sm bg-[#101311] border border-[#1D221F] space-y-3">
              <Lock className="w-6 h-6 text-[#E4B95C]" />
              <h3 className="font-serif font-normal text-[#F5F3ED] text-lg">Smart Contract & Security Station</h3>
              <p className="text-xs text-[#9A9A93] leading-relaxed">
                Configure Polygon smart contract admin credentials, IPFS node keys, and fraud scan parameters.
              </p>
              <Link to="/security/dashboard" className="text-[10px] px-2.5 py-1 rounded-xs bg-[#E4B95C]/10 text-[#E4B95C] border border-[#E4B95C]/30 inline-block font-bold hover:underline">
                Open Security Monitor →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, FileCheck, Search, ArrowLeft, Sparkles, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CertifierDashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F7F9F7] text-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">

        {/* TOP BREADCRUMB */}
        <div className="flex items-center justify-between">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-purple-700 transition-colors font-mono"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Profile Dashboard
          </Link>
          <span className="text-xs font-mono font-bold text-purple-700 uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Certifier Role Active
          </span>
        </div>

        {/* HERO BANNER CARD */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 shadow-xl bg-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-mono font-bold border border-purple-300">
                <Shield className="w-3.5 h-3.5 text-purple-700" />
                Certifier & Auditor Portal
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900">Welcome, {user?.fullName}</h1>
              <p className="text-xs text-gray-600 font-mono">
                Organization: <span className="font-bold text-gray-800">{user?.organization || 'Independent Certifier'}</span> • Email: {user?.email}
              </p>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-purple-50 border border-purple-200 text-right font-mono text-xs text-purple-900">
              <span className="block text-[10px] text-gray-500 uppercase font-semibold">Attestation Authority</span>
              <span className="font-extrabold text-sm flex items-center gap-1.5 justify-end text-purple-800">
                <Shield className="w-4 h-4 text-purple-700" /> Verified Auditor
              </span>
            </div>
          </div>
        </div>

        {/* CERTIFIER WORKFLOW CARDS */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-700" /> Compliance & Attestation Suite
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="light-card p-6 rounded-2xl border border-gray-200/80 bg-white shadow-md space-y-3">
              <FileCheck className="w-8 h-8 text-purple-700" />
              <h3 className="font-bold text-gray-900 text-base">Provenance Attestation Portal</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Review harvester batch submissions, verify region terroir data, and issue cryptographic attestations.
              </p>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 inline-block">
                Coming Phase 14
              </span>
            </div>

            <div className="light-card p-6 rounded-2xl border border-gray-200/80 bg-white shadow-md space-y-3">
              <Search className="w-8 h-8 text-indigo-700" />
              <h3 className="font-bold text-gray-900 text-base">Audit Trail & Fraud Detection</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Inspect system audit logs, tamper alerts, replay attack flags, and acoustic similarity breakdowns.
              </p>
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300 inline-block">
                Coming Phase 15/16
              </span>
            </div>
          </div>
        </div>

        {/* ATTESTATION QUEUE PLACEHOLDER */}
        <div className="light-card p-8 rounded-3xl border border-gray-200/80 bg-white shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <span className="text-xs font-mono font-bold text-purple-700 uppercase tracking-wider">Audit Queue</span>
              <h3 className="text-lg font-bold text-gray-900">Pending Producer Attestations</h3>
            </div>
            <span className="text-xs font-mono text-gray-500">0 Pending</span>
          </div>

          <div className="p-8 rounded-2xl bg-gray-50 border border-dashed border-gray-300 text-center space-y-2">
            <Layers className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-xs font-bold text-gray-700">No Pending Batches For Review</p>
            <p className="text-[11px] text-gray-500 max-w-md mx-auto">
              Batches submitted by Producers for regional provenance attestation will appear here.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { HealthBadge } from './HealthBadge';
import { ShieldCheck, Waves, QrCode, Lock, Cpu } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Waves className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white">ECHO<span className="gradient-text">CHAIN</span></span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">Acoustic Provenance & Privacy Engine</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-300 font-medium">
          <a href="#features" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" /> Platform Architecture
          </a>
          <a href="#pipeline" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <Waves className="w-4 h-4 text-emerald-400" /> Acoustic Flow
          </a>
          <a href="#privacy" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-purple-400" /> Privacy & Hash
          </a>
          <a href="#verification" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-indigo-400" /> QR Verification
          </a>
        </div>

        {/* Live System Health Badge & CTA */}
        <div className="flex items-center gap-4">
          <HealthBadge />

          <button className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02]">
            <ShieldCheck className="w-4 h-4" />
            Launch Portal
          </button>
        </div>
      </div>
    </nav>
  );
};

import React from 'react';
import { Waves, Shield, GitBranch, Cpu, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-slate-950/90 py-12 px-4 sm:px-6 lg:px-8 text-gray-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand Summary */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <Waves className="w-6 h-6 text-emerald-400" />
            <span className="font-bold text-lg text-white">ECHO<span className="gradient-text">CHAIN</span></span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Privacy-preserving provenance engine pairing environmental audio fingerprints, AI signal processing, IPFS decentralized storage, and Polygon smart contracts.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Polygon Testnet Connected
          </div>
        </div>

        {/* Core Capabilities */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" /> Core Modules
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="hover:text-emerald-400 transition-colors">Harvester Audio Recorder</li>
            <li className="hover:text-emerald-400 transition-colors">Acoustic Feature Extraction</li>
            <li className="hover:text-emerald-400 transition-colors">SHA-256 Tamper Commitment</li>
            <li className="hover:text-emerald-400 transition-colors">IPFS Multi-hash Storage</li>
          </ul>
        </div>

        {/* Verification Engine */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" /> Trust Architecture
          </h4>
          <ul className="space-y-2 text-xs">
            <li className="hover:text-emerald-400 transition-colors">Probabilistic Acoustic Match</li>
            <li className="hover:text-emerald-400 transition-colors">Polygon Provenance Contract</li>
            <li className="hover:text-emerald-400 transition-colors">Dynamic SVG QR Generator</li>
            <li className="hover:text-emerald-400 transition-colors">Certifier RBAC Attestation</li>
          </ul>
        </div>

        {/* Privacy Principles */}
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" /> Privacy Standards
          </h4>
          <p className="text-xs text-gray-400 leading-relaxed mb-3">
            Sensitive raw GPS coordinates are strictly obfuscated. Only region-level terroir boundaries are exposed publicly.
          </p>
          <div className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800 text-[11px] font-mono text-gray-300">
            Hash Integrity: SHA-256 Data Integrity + AI Embedding Similarity
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
        <p>© 2026 EchoChain Provenance Platform. All rights reserved.</p>
        <div className="flex items-center gap-4 mt-4 sm:mt-0 font-mono">
          <span className="flex items-center gap-1"><GitBranch className="w-3.5 h-3.5 text-cyan-400" /> Phase 1 Foundation</span>
          <span>FastAPI + Vite React TS</span>
        </div>
      </div>
    </footer>
  );
};

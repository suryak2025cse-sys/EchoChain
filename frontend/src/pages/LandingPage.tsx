import React from 'react';
import { 
  Waves, 
  ShieldCheck, 
  Lock, 
  QrCode, 
  Database, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  Radio, 
  FileCode, 
  Search, 
  Users, 
  Sparkles,
  Fingerprint,
  Building2,
  Share2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 pb-20 bg-grid-pattern">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-purple-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-md">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            Environmental Acoustic Provenance Platform
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
            Cryptographic Proof of Origin Powered by <span className="gradient-text">Acoustic Fingerprints</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto font-normal leading-relaxed">
            EchoChain seals product provenance by converting harvest-site ambient acoustic signatures into privacy-preserving tamper-evident commitments backed by AI, IPFS, and Polygon blockchain.
          </p>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#pipeline"
              className="px-8 py-4 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 flex items-center gap-2"
            >
              Explore Provenance Pipeline
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#principles"
              className="px-8 py-4 rounded-xl text-sm font-bold text-white glass-card glass-card-hover flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-purple-400" />
              Privacy & SHA-256 Principles
            </a>
          </div>

          {/* Live Provenance Metrics Preview */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Fingerprint className="w-4 h-4 text-emerald-400" /> Acoustic Vector
              </div>
              <p className="text-xl font-bold text-white font-mono">128-D Embedding</p>
              <p className="text-[11px] text-emerald-400 mt-1">MFCC + Spectral Chroma</p>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Lock className="w-4 h-4 text-cyan-400" /> Geolocation Privacy
              </div>
              <p className="text-xl font-bold text-white font-mono">Region-Level Only</p>
              <p className="text-[11px] text-cyan-400 mt-1">Exact GPS Zero Exposure</p>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <Database className="w-4 h-4 text-purple-400" /> Decentralized Vault
              </div>
              <p className="text-xl font-bold text-white font-mono">IPFS CIDs</p>
              <p className="text-[11px] text-purple-400 mt-1">Pinata Multi-node Backup</p>
            </div>

            <div className="glass-card p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> Polygon Consensus
              </div>
              <p className="text-xl font-bold text-white font-mono">Solidity 0.8.24</p>
              <p className="text-[11px] text-indigo-400 mt-1">Immutable Provenance Log</p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PROVENANCE FLOW */}
      <section id="pipeline" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            The End-to-End <span className="gradient-text">Provenance Lifecycle</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-sm">
            From the ambient sounds of the harvest field to instant consumer QR verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
              <Radio className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs font-mono text-emerald-400">STAGE 01</span>
            <h3 className="text-lg font-bold text-white mt-1">Harvest Site Audio Capture</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Ambient audio is captured at harvest time (birds, wind, rustling canopy, environmental reverberation).
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-xs font-mono text-cyan-400">STAGE 02</span>
            <h3 className="text-lg font-bold text-white mt-1">AI Feature Extraction</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Librosa computes Mel-Spectrograms, MFCCs, Chroma, and Spectral Contrast matrices into neural embeddings.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs font-mono text-purple-400">STAGE 03</span>
            <h3 className="text-lg font-bold text-white mt-1">SHA-256 & IPFS Seal</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Payload data is hashed via SHA-256 for tamper-evidence and stored on IPFS yielding an immutable CID.
            </p>
          </div>

          {/* Step 4 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <span className="text-xs font-mono text-indigo-400">STAGE 04</span>
            <h3 className="text-lg font-bold text-white mt-1">Polygon Provenance Tx</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Batch ID, Harvester Address, Hash, and CID are sealed permanently on Polygon blockchain.
            </p>
          </div>

          {/* Step 5 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6 text-amber-400" />
            </div>
            <span className="text-xs font-mono text-amber-400">STAGE 05</span>
            <h3 className="text-lg font-bold text-white mt-1">Dynamic QR Packaging</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              High-density SVG QR code is printed on product packaging embedding verifiable batch payload.
            </p>
          </div>

          {/* Step 6 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-teal-400" />
            </div>
            <span className="text-xs font-mono text-teal-400">STAGE 06</span>
            <h3 className="text-lg font-bold text-white mt-1">Consumer Verification</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Consumers scan QR code to inspect origin stories, regional map bounds, and blockchain signatures.
            </p>
          </div>

          {/* Step 7 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mb-4">
              <Waves className="w-6 h-6 text-pink-400" />
            </div>
            <span className="text-xs font-mono text-pink-400">STAGE 07</span>
            <h3 className="text-lg font-bold text-white mt-1">Acoustic Match Probe</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Users can optional-record consumer sample to test probabilistic acoustic similarity score.
            </p>
          </div>

          {/* Step 8 */}
          <div className="glass-card glass-card-hover p-6 rounded-2xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs font-mono text-emerald-400">STAGE 08</span>
            <h3 className="text-lg font-bold text-white mt-1">Authenticity Verdict</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              System calculates confidence breakdown and alerts on suspicious counterfeit or replay anomalies.
            </p>
          </div>
        </div>
      </section>

      {/* CORE TECHNICAL PRINCIPLES */}
      <section id="principles" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="glass-card p-8 sm:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono mb-4">
              <FileCode className="w-3.5 h-3.5 text-purple-400" /> Architectural Axiom
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              SHA-256 Data Integrity vs. Probabilistic Acoustic Evidence
            </h2>
            <p className="mt-4 text-sm text-gray-300 leading-relaxed">
              A critical design pillar of EchoChain is transparency regarding cryptographic bounds:
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm mb-2">
                  <Lock className="w-4 h-4" /> SHA-256 Commitment
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Guarantees that audio data, metadata payload, and IPFS CIDs have not been altered or tampered with since creation. SHA-256 does not verify physical location on its own.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/90 border border-cyan-500/30">
                <div className="flex items-center gap-2 font-bold text-cyan-400 text-sm mb-2">
                  <Sparkles className="w-4 h-4" /> Acoustic Similarity Engine
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Evaluates probabilistic ambient sound matching (background fauna, climate acoustics, frequency spectra) against verified baseline recordings to provide evidence of origin.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200 leading-relaxed">
                <strong>Privacy Protocol:</strong> Precise physical GPS coordinates (latitude/longitude) are strictly protected. Public ledger payloads store only region-level geographic names (e.g. "Sidama Zone, Ethiopia") to prevent harvester location exploitation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* USER ROLE PORTALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Designed for the <span className="gradient-text">Entire Ecosystem</span>
          </h2>
          <p className="mt-3 text-sm text-gray-400">
            Tailored interfaces and security permissions for every stakeholder role.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Harvester Card */}
          <div className="glass-card glass-card-hover p-8 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">1. Producer / Harvester</h3>
            <ul className="mt-4 space-y-2 text-xs text-gray-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> In-field ambient audio recorder</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Batch generation & product tagging</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Regional location obfuscation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> One-click IPFS & Polygon seal</li>
            </ul>
          </div>

          {/* Consumer Card */}
          <div className="glass-card glass-card-hover p-8 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">2. Consumer</h3>
            <ul className="mt-4 space-y-2 text-xs text-gray-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Mobile-first QR scanning portal</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Regional map & terroir provenance</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Acoustic similarity probe interface</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Direct Polygon blockchain link</li>
            </ul>
          </div>

          {/* Certifier Card */}
          <div className="glass-card glass-card-hover p-8 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">3. Certifier / Admin</h3>
            <ul className="mt-4 space-y-2 text-xs text-gray-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Attestation review workflow</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Fraud & counterfeit anomaly alerts</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Audit log & telemetry explorer</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> RBAC & organization key management</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

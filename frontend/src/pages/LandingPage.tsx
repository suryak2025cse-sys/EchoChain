import React from 'react';
import { AcousticCircle } from '../components/AcousticCircle';
import { SpectrogramDemo } from '../components/SpectrogramDemo';
import { SystemHealthPanel } from '../components/SystemHealthPanel';
import { 
  Lock, 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  Radio, 
  Cpu, 
  CheckCircle2, 
  Users, 
  FileCode2, 
  EyeOff, 
  Compass, 
  Search, 
  Share2, 
  Building2,
  Volume2,
  Wind,
  Bird,
  Trees
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-0">
      
      {/* SECTION 1: HERO — LIGHT EDITORIAL SECTION */}
      <section id="platform" className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#F7F9F7] overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Small Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/5 border border-emerald-900/10 text-emerald-800 text-xs font-mono font-semibold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
              Environmental Provenance Infrastructure
            </div>

            {/* Main Heading (Fits 2-3 lines) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.12] tracking-tight">
              Proof of Origin.<br />
              <span className="gradient-heading-emerald">Without Revealing</span><br />
              the Origin.
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl font-normal leading-relaxed">
              EchoChain transforms environmental sound into privacy-preserving provenance evidence, connecting physical products with cryptographically verifiable digital records.
            </p>

            {/* Hero Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#how-it-works"
                className="px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-700 shadow-md shadow-emerald-900/10 transition-all flex items-center gap-2"
              >
                Explore the Platform
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#principles"
                className="px-6 py-3.5 rounded-xl text-sm font-semibold text-gray-800 bg-white hover:bg-gray-50 border border-gray-200/80 shadow-sm transition-all flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-emerald-700" />
                See How It Works
              </a>
            </div>
          </div>

          {/* Right Column: Signature Acoustic Visual Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <AcousticCircle />
          </div>
        </div>

        {/* HERO MICRO TRUST STRIP */}
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-200/70">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest text-center">
            <span>AI AUDIO ANALYSIS</span>
            <span className="hidden md:inline">•</span>
            <span>CRYPTOGRAPHIC COMMITMENT</span>
            <span className="hidden md:inline">•</span>
            <span>DECENTRALIZED PROVENANCE</span>
            <span className="hidden md:inline">•</span>
            <span>LOCATION PRIVACY</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE PROBLEM — LIGHT EDITORIAL SECTION */}
      <section id="principles" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">The Provenance Dilemma</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
              Provenance has a privacy problem.
            </h2>
            <p className="mt-4 text-gray-600 text-sm sm:text-base leading-relaxed">
              Exposing exact physical coordinates to prove origin compromises harvesters, invites ecological exploitation, and risks regulatory non-compliance.
            </p>
          </div>

          {/* Two-Column Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Left: Traditional GPS */}
            <div className="p-8 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-mono font-semibold mb-4">
                  Traditional GPS Provenance
                </div>
                <div className="space-y-4 font-mono text-sm text-gray-700">
                  <div className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                    <span>GPS Coordinates</span>
                    <MapPin className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-center text-gray-400">↓</div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between text-rose-700">
                    <span>Exact Origin Exposed</span>
                    <EyeOff className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-center text-gray-400">↓</div>
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-rose-900 font-sans text-xs">
                    Security, poaching & location privacy risks for harvesters.
                  </div>
                </div>
              </div>
            </div>

            {/* Right: EchoChain Approach */}
            <div className="p-8 rounded-2xl bg-emerald-950/5 border border-emerald-900/15 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-mono font-semibold mb-4">
                  EchoChain Innovation
                </div>
                <div className="space-y-3 font-mono text-sm">
                  <div className="p-3 bg-white rounded-lg border border-emerald-200 flex items-center justify-between text-gray-800">
                    <span>Environmental Signal</span>
                    <Volume2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-center text-emerald-600">↓</div>
                  <div className="p-3 bg-white rounded-lg border border-emerald-200 flex items-center justify-between text-gray-800">
                    <span>Acoustic Fingerprint</span>
                    <Cpu className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-center text-emerald-600">↓</div>
                  <div className="p-3 bg-white rounded-lg border border-emerald-200 flex items-center justify-between text-gray-800">
                    <span>Cryptographic Commitment</span>
                    <Lock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-center text-emerald-600">↓</div>
                  <div className="p-3 bg-emerald-800 text-white rounded-lg font-sans text-xs font-semibold flex items-center justify-between">
                    <span>Region-Level Verification</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE CORE IDEA — LIGHT EDITORIAL SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F7F9F7] border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Acoustic Bio-Terroir</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mt-2 mb-6">
            "Every ecosystem has a soundscape."
          </h2>
          <p className="max-w-3xl mx-auto text-gray-600 text-base leading-relaxed mb-12">
            EchoChain captures environmental acoustic patterns and converts them into a machine-readable fingerprint to act as a <strong>probabilistic environmental provenance signal</strong>.
          </p>

          {/* Soundscape Components */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="light-card p-5 rounded-xl text-center light-card-hover">
              <Bird className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
              <span className="text-xs font-bold text-gray-900 block">Fauna</span>
              <span className="text-[10px] text-gray-500 font-mono">Avian Spectral</span>
            </div>
            <div className="light-card p-5 rounded-xl text-center light-card-hover">
              <Wind className="w-6 h-6 text-teal-700 mx-auto mb-2" />
              <span className="text-xs font-bold text-gray-900 block">Atmosphere</span>
              <span className="text-[10px] text-gray-500 font-mono">Wind Resonance</span>
            </div>
            <div className="light-card p-5 rounded-xl text-center light-card-hover">
              <Trees className="w-6 h-6 text-emerald-800 mx-auto mb-2" />
              <span className="text-xs font-bold text-gray-900 block">Canopy</span>
              <span className="text-[10px] text-gray-500 font-mono">Leaf Rustle</span>
            </div>
            <div className="light-card p-5 rounded-xl text-center light-card-hover">
              <Volume2 className="w-6 h-6 text-cyan-700 mx-auto mb-2" />
              <span className="text-xs font-bold text-gray-900 block">Insects</span>
              <span className="text-[10px] text-gray-500 font-mono">High Frequency</span>
            </div>
            <div className="light-card p-5 rounded-xl text-center light-card-hover">
              <Compass className="w-6 h-6 text-indigo-700 mx-auto mb-2" />
              <span className="text-xs font-bold text-gray-900 block">Topography</span>
              <span className="text-[10px] text-gray-500 font-mono">Acoustic Echo</span>
            </div>
            <div className="light-card p-5 rounded-xl text-center light-card-hover">
              <Radio className="w-6 h-6 text-purple-700 mx-auto mb-2" />
              <span className="text-xs font-bold text-gray-900 block">Ambient</span>
              <span className="text-[10px] text-gray-500 font-mono">Noise Floor</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS — HORIZONTAL JOURNEY */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Provenance Lifecycle</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
              Four steps to verifiable trust.
            </h2>
          </div>

          {/* Continuous Journey Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Horizontal Line Connector for Desktop */}
            <div className="hidden md:block absolute top-12 left-12 right-12 h-0.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 -z-0" />

            {/* Stage 01 */}
            <div className="light-card p-6 rounded-2xl relative z-10 light-card-hover flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-mono font-bold text-sm mb-4">
                  01
                </div>
                <h3 className="text-base font-bold text-gray-900">CAPTURE</h3>
                <p className="text-xs font-mono text-emerald-700 mt-0.5">Environmental Audio</p>
                <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                  Harvester records ambient audio at the harvest site via mobile app or web portal.
                </p>
              </div>
            </div>

            {/* Stage 02 */}
            <div className="light-card p-6 rounded-2xl relative z-10 light-card-hover flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-mono font-bold text-sm mb-4">
                  02
                </div>
                <h3 className="text-base font-bold text-gray-900">ANALYZE</h3>
                <p className="text-xs font-mono text-teal-700 mt-0.5">Acoustic Features</p>
                <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                  Extract Mel-Spectrograms, MFCCs, and spectral contrast vectors via signal processing.
                </p>
              </div>
            </div>

            {/* Stage 03 */}
            <div className="light-card p-6 rounded-2xl relative z-10 light-card-hover flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-700 text-white flex items-center justify-center font-mono font-bold text-sm mb-4">
                  03
                </div>
                <h3 className="text-base font-bold text-gray-900">SEAL</h3>
                <p className="text-xs font-mono text-indigo-700 mt-0.5">Cryptographic Commitment</p>
                <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                  SHA-256 metadata hash and IPFS CID are committed to Polygon smart contract.
                </p>
              </div>
            </div>

            {/* Stage 04 */}
            <div className="light-card p-6 rounded-2xl relative z-10 light-card-hover flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-mono font-bold text-sm mb-4">
                  04
                </div>
                <h3 className="text-base font-bold text-gray-900">VERIFY</h3>
                <p className="text-xs font-mono text-purple-700 mt-0.5">Consumer Verification</p>
                <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                  Consumer scans packaging QR code to verify region origin and probabilistic audio match.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: PRIVACY — DARK TECHNOLOGY SECTION */}
      <section id="privacy" className="py-24 px-4 sm:px-6 lg:px-8 dark-tech-section">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Zero Exposure Architecture</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              Prove the origin.<br />
              <span className="gradient-heading-dark">Protect the location.</span>
            </h2>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Exact harvest coordinates remain protected while public verification exposes only the information necessary to establish provenance.
            </p>

            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-200">
              SHA-256 guarantees data integrity; location match is derived from probabilistic ambient acoustics.
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="dark-card p-8 rounded-2xl space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-rose-950/30 border border-rose-500/30">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-rose-400" />
                  <span className="font-mono text-sm text-gray-200">Exact GPS Coordinates</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-mono text-xs font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> PRIVATE
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <Compass className="w-5 h-5 text-emerald-400" />
                  <span className="font-mono text-sm text-gray-200">Region / Terroir Boundary</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> PUBLIC
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-teal-950/40 border border-teal-500/30">
                <div className="flex items-center gap-3">
                  <Radio className="w-5 h-5 text-teal-400" />
                  <span className="font-mono text-sm text-gray-200">Acoustic Provenance Evidence</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 font-mono text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIABLE
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: ACOUSTIC FINGERPRINT — DARK TECHNOLOGY SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 dark-tech-section border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Acoustic Signal Engine</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              From ambient sound to cryptographic proof.
            </h2>
          </div>
          <SpectrogramDemo />
        </div>
      </section>

      {/* SECTION 7: ARCHITECTURE — LIGHT EDITORIAL SECTION */}
      <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">System Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
              Clean modular pipeline.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 font-mono text-xs text-center">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-between h-32">
              <Volume2 className="w-5 h-5 text-emerald-700 mt-1" />
              <span className="font-bold text-gray-900">Environmental Audio</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">FOUNDATION READY</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-between h-32">
              <Cpu className="w-5 h-5 text-teal-700 mt-1" />
              <span className="font-bold text-gray-900">Audio Processing</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">FOUNDATION READY</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-between h-32">
              <Radio className="w-5 h-5 text-cyan-700 mt-1" />
              <span className="font-bold text-gray-900">Acoustic Fingerprint</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">PLANNED (Phase 5)</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-between h-32">
              <Lock className="w-5 h-5 text-purple-700 mt-1" />
              <span className="font-bold text-gray-900">SHA-256 Commitment</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">FOUNDATION READY</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-between h-32">
              <FileCode2 className="w-5 h-5 text-indigo-700 mt-1" />
              <span className="font-bold text-gray-900">IPFS Storage</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">PLANNED (Phase 8)</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-between h-32">
              <ShieldCheck className="w-5 h-5 text-blue-700 mt-1" />
              <span className="font-bold text-gray-900">Polygon Ledger</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">PLANNED (Phase 10)</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-between h-32">
              <Share2 className="w-5 h-5 text-teal-700 mt-1" />
              <span className="font-bold text-gray-900">Dynamic QR</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">PLANNED (Phase 12)</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-between h-32">
              <Search className="w-5 h-5 text-emerald-700 mt-1" />
              <span className="font-bold text-gray-900">Consumer View</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">FOUNDATION READY</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: SYSTEM HEALTH — LIGHT EDITORIAL SECTION */}
      <section id="status" className="py-16 px-4 sm:px-6 lg:px-8 bg-[#F7F9F7] border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto">
          <SystemHealthPanel />
        </div>
      </section>

      {/* SECTION 9: STAKEHOLDERS — ECOSYSTEM WORKFLOW */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Ecosystem Roles</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
              Connecting stakeholders across the value chain.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
              <Users className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
              <h3 className="font-bold text-gray-900">PRODUCER</h3>
              <p className="text-xs text-gray-500 mt-1">Captures environmental audio at harvest site</p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
              <Radio className="w-6 h-6 text-teal-700 mx-auto mb-2" />
              <h3 className="font-bold text-gray-900">ECHOCHAIN</h3>
              <p className="text-xs text-gray-500 mt-1">Extracts features & generates cryptographic proof</p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
              <Building2 className="w-6 h-6 text-indigo-700 mx-auto mb-2" />
              <h3 className="font-bold text-gray-900">CERTIFIER</h3>
              <p className="text-xs text-gray-500 mt-1">Attests regional provenance standards</p>
            </div>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
              <Search className="w-6 h-6 text-purple-700 mx-auto mb-2" />
              <h3 className="font-bold text-gray-900">CONSUMER</h3>
              <p className="text-xs text-gray-500 mt-1">Scans QR to verify authentic product origin</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10: FINAL CTA — DARK TECHNOLOGY SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 dark-tech-section relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Trust what you can verify.
          </h2>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            Privacy-preserving provenance infrastructure for the physical world.
          </p>
          <div className="pt-4">
            <a
              href="#platform"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-xl transition-all"
            >
              Explore EchoChain
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AcousticCircle } from '../components/AcousticCircle';
import { SpectrogramDemo } from '../components/SpectrogramDemo';
import { SystemHealthPanel } from '../components/SystemHealthPanel';
import { EcosystemWaveform } from '../components/ui/EcosystemWaveform';
import { GoldButton } from '../components/ui/GoldButton';
import { HashDisplay } from '../components/ui/HashDisplay';
import { fetchHealth } from '../services/api';
import type { HealthResponse } from '../types';
import { 
  Lock, 
  MapPin, 
  ShieldCheck, 
  Radio, 
  Cpu, 
  Users, 
  FileCode2, 
  EyeOff, 
  Search, 
  Share2, 
  Building2,
  Volume2,
  Wind,
  Bird,
  Trees
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    fetchHealth()
      .then((data) => setHealth(data))
      .catch((err) => console.warn('Health ping notice:', err));
  }, []);

  return (
    <div className="space-y-0 bg-[#080A09] text-[#F5F3ED] selection:bg-[#D4AF37] selection:text-[#080A09]">
      
      {/* SECTION 1: HERO */}
      <section id="platform" className="relative py-20 sm:py-28 px-6 lg:px-12 bg-[#080A09] overflow-hidden border-b border-[#1D221F]">
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <EcosystemWaveform height={650} color="#D4AF37" speed={0.012} />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xs bg-[#101311] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono font-bold uppercase tracking-widest">
              <Radio className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
              Environmental Provenance Infrastructure ({health?.status === 'ok' ? 'HEALTHY' : 'LIVE'})
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-light tracking-tight leading-[1.08] text-[#F5F3ED]">
              Proof of Origin.<br />
              <span className="font-serif italic text-[#D4AF37] font-normal">Without Revealing</span><br />
              the Origin.
            </h1>

            <p className="text-sm sm:text-base text-[#9A9A93] max-w-2xl leading-relaxed font-sans">
              EchoChain transforms environmental sound into privacy-preserving provenance evidence, connecting physical products with cryptographically verifiable digital records.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/register">
                <GoldButton variant="primary" showArrow className="!py-3.5 !px-6 text-xs">
                  Explore the Platform
                </GoldButton>
              </Link>

              <a href="#principles">
                <GoldButton variant="secondary" className="!py-3.5 !px-6 text-xs">
                  <Lock className="w-4 h-4 text-[#D4AF37] inline mr-1" />
                  See How It Works
                </GoldButton>
              </a>
            </div>
          </div>

          {/* Right Column: Signature Acoustic Visual Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <AcousticCircle />
          </div>
        </div>

        {/* HERO MICRO TRUST STRIP */}
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#1D221F] relative z-10">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 text-xs font-mono text-[#9A9A93] uppercase tracking-widest text-center">
            <span>AI AUDIO ANALYSIS</span>
            <span className="hidden md:inline text-[#D4AF37]">•</span>
            <span>CRYPTOGRAPHIC COMMITMENT</span>
            <span className="hidden md:inline text-[#D4AF37]">•</span>
            <span>DECENTRALIZED PROVENANCE</span>
            <span className="hidden md:inline text-[#D4AF37]">•</span>
            <span>LOCATION PRIVACY</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE PROBLEM */}
      <section id="principles" className="py-24 px-6 lg:px-12 bg-[#101311] border-b border-[#1D221F]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest">The Provenance Dilemma</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#F5F3ED]">
              Provenance has a privacy problem.
            </h2>
            <p className="text-[#9A9A93] text-sm leading-relaxed max-w-xl mx-auto">
              Exposing exact physical coordinates to prove origin compromises harvesters, invites ecological exploitation, and risks regulatory non-compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch font-mono text-xs">
            {/* Left: Traditional GPS */}
            <div className="p-8 rounded-sm bg-[#080A09] border border-[#E36B6B]/30 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#E36B6B]/10 text-[#E36B6B] border border-[#E36B6B]/30 font-bold uppercase">
                  Traditional GPS Provenance
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-[#101311] rounded-xs border border-[#1D221F] flex items-center justify-between">
                    <span>GPS Coordinates</span>
                    <MapPin className="w-4 h-4 text-[#E36B6B]" />
                  </div>
                  <div className="text-center text-[#9A9A93]">↓</div>
                  <div className="p-3 bg-[#101311] rounded-xs border border-[#E36B6B]/40 flex items-center justify-between text-[#E36B6B]">
                    <span>Exposing Exact Site Coordinates</span>
                    <EyeOff className="w-4 h-4 text-[#E36B6B]" />
                  </div>
                  <div className="text-center text-[#9A9A93]">↓</div>
                  <div className="p-3 bg-[#101311] rounded-xs border border-[#E36B6B]/40 text-[#E36B6B]">
                    High Security & Privacy Risk for Producers
                  </div>
                </div>
              </div>
            </div>

            {/* Right: EchoChain Acoustic Privacy */}
            <div className="p-8 rounded-sm bg-[#080A09] border border-[#D4AF37]/40 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/40 font-bold uppercase">
                  EchoChain Acoustic Fingerprinting
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-[#101311] rounded-xs border border-[#1D221F] flex items-center justify-between">
                    <span>Ambient Field Audio Soundscape</span>
                    <Volume2 className="w-4 h-4 text-[#62C7C0]" />
                  </div>
                  <div className="text-center text-[#9A9A93]">↓</div>
                  <div className="p-3 bg-[#101311] rounded-xs border border-[#D4AF37]/40 flex items-center justify-between text-[#D4AF37]">
                    <span>128-D Acoustic Feature Embedding</span>
                    <Cpu className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="text-center text-[#9A9A93]">↓</div>
                  <div className="p-3 bg-[#101311] rounded-xs border border-[#7CC8A0]/40 text-[#7CC8A0]">
                    Zero-Location Verification Guarantee
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW ECHOCHAIN SOLVES IT */}
      <section className="py-24 px-6 lg:px-12 bg-[#080A09] border-b border-[#1D221F]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-[#62C7C0] uppercase tracking-widest">Acoustic Proof Paradigm</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#F5F3ED]">
              Sound as physical evidence.
            </h2>
            <p className="text-[#9A9A93] text-sm leading-relaxed max-w-xl mx-auto">
              Every ecosystem possesses a unique acoustic signature created by climate, fauna, canopy reverberation, and ambient soundscapes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-sm bg-[#101311] border border-[#1D221F] hover:border-[#D4AF37]/40 transition-all space-y-4">
              <Wind className="w-8 h-8 text-[#D4AF37]" />
              <h3 className="text-2xl font-serif text-[#F5F3ED]">Canopy Reverberation</h3>
              <p className="text-[#9A9A93] text-xs font-sans leading-relaxed">
                Acoustic impulse reflections measure canopy density and topographical profile without revealing GPS location.
              </p>
            </div>

            <div className="p-8 rounded-sm bg-[#101311] border border-[#1D221F] hover:border-[#62C7C0]/40 transition-all space-y-4">
              <Bird className="w-8 h-8 text-[#62C7C0]" />
              <h3 className="text-2xl font-serif text-[#F5F3ED]">Biophony Signatures</h3>
              <p className="text-[#9A9A93] text-xs font-sans leading-relaxed">
                Fauna acoustic frequency bands verify macro-regional ecosystem authenticity and biodiversity indicators.
              </p>
            </div>

            <div className="p-8 rounded-sm bg-[#101311] border border-[#1D221F] hover:border-[#7CC8A0]/40 transition-all space-y-4">
              <Trees className="w-8 h-8 text-[#7CC8A0]" />
              <h3 className="text-2xl font-serif text-[#F5F3ED]">Microclimate Noise Floor</h3>
              <p className="text-[#9A9A93] text-xs font-sans leading-relaxed">
                Wind speed, humidity attenuation, and atmospheric pressure alter acoustic decay rates in verifiable patterns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: PROTOCOL LIFECYCLE PIPELINE */}
      <section id="how-it-works" className="py-24 px-6 lg:px-12 bg-[#101311] border-b border-[#1D221F]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest">Protocol Lifecycle</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#F5F3ED]">
              End-to-End Provenance Pipeline
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 font-mono text-xs">
            <div className="p-6 rounded-sm bg-[#080A09] border border-[#1D221F] space-y-3">
              <div className="text-[#D4AF37] font-bold">01. CAPTURE</div>
              <h4 className="text-lg font-serif text-[#F5F3ED] font-normal">Environmental Audio</h4>
              <p className="text-[#9A9A93] font-sans text-xs">5-second ambient soundscape recorded at origin.</p>
            </div>

            <div className="p-6 rounded-sm bg-[#080A09] border border-[#1D221F] space-y-3">
              <div className="text-[#62C7C0] font-bold">02. ANALYSIS</div>
              <h4 className="text-lg font-serif text-[#F5F3ED] font-normal">DSP & Liveness</h4>
              <p className="text-[#9A9A93] font-sans text-xs">Librosa extracts 128 Mel bands & verifies noise floor.</p>
            </div>

            <div className="p-6 rounded-sm bg-[#080A09] border border-[#1D221F] space-y-3">
              <div className="text-[#D4AF37] font-bold">03. SEAL</div>
              <h4 className="text-lg font-serif text-[#F5F3ED] font-normal">SHA-256 Digest</h4>
              <p className="text-[#9A9A93] font-sans text-xs">Canonical payload sealed into immutable digest.</p>
            </div>

            <div className="p-6 rounded-sm bg-[#080A09] border border-[#1D221F] space-y-3">
              <div className="text-[#7CC8A0] font-bold">04. ANCHOR</div>
              <h4 className="text-lg font-serif text-[#F5F3ED] font-normal">IPFS & Polygon</h4>
              <p className="text-[#9A9A93] font-sans text-xs">Evidence pinned to Pinata IPFS & anchored on-chain.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: LIVE PROVENANCE TELEMETRY & COMMITMENTS */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-10 font-mono text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">LIVE PROVENANCE LOG</span>
            <h2 className="text-3xl md:text-4xl font-serif text-[#F5F3ED]">
              Canonical SHA-256 Provenance Commitments
            </h2>
          </div>
          <Link to="/register">
            <GoldButton variant="secondary" showArrow className="!py-2.5 !px-5 text-xs">
              EXPLORE PRODUCER DASHBOARD
            </GoldButton>
          </Link>
        </div>

        <div className="p-8 rounded-sm bg-[#101311] border border-[#1D221F] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1D221F] pb-4 text-[#9A9A93] uppercase font-bold">
            <span>BATCH IDENTIFIER</span>
            <span>CANONICAL DIGEST / BLOCKCHAIN TX</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-[#1D221F]">
            <span className="text-[#D4AF37] font-bold text-sm">ECH-COFFEE-8821 (Sidama, Ethiopia)</span>
            <HashDisplay hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" truncate />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-[#1D221F]">
            <span className="text-[#D4AF37] font-bold text-sm">ECH-COCOA-4419 (Kumasi, Ghana)</span>
            <HashDisplay hash="7d1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a" truncate />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
            <span className="text-[#D4AF37] font-bold text-sm">ECH-TEA-1092 (Darjeeling, India)</span>
            <HashDisplay hash="a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0" truncate />
          </div>
        </div>
      </section>

      {/* SECTION 6: ACOUSTIC FINGERPRINT — DEMO ENGINE */}
      <section className="py-24 px-6 lg:px-12 bg-[#101311] border-y border-[#1D221F]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold text-[#62C7C0] uppercase tracking-widest">Acoustic Signal Engine</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#F5F3ED]">
              From ambient sound to cryptographic proof.
            </h2>
          </div>
          <SpectrogramDemo />
        </div>
      </section>

      {/* SECTION 7: ARCHITECTURE — MODULAR PIPELINE */}
      <section id="architecture" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-12 font-mono text-xs">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">System Architecture</span>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#F5F3ED]">
            Clean modular pipeline.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
          <div className="p-4 rounded-sm bg-[#101311] border border-[#1D221F] flex flex-col items-center justify-between h-36">
            <Volume2 className="w-5 h-5 text-[#7CC8A0] mt-1" />
            <span className="font-bold text-[#F5F3ED]">Environmental Audio</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-[#7CC8A0]/10 text-[#7CC8A0]">READY</span>
          </div>

          <div className="p-4 rounded-sm bg-[#101311] border border-[#1D221F] flex flex-col items-center justify-between h-36">
            <Cpu className="w-5 h-5 text-[#62C7C0] mt-1" />
            <span className="font-bold text-[#F5F3ED]">Audio Processing</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-[#62C7C0]/10 text-[#62C7C0]">READY</span>
          </div>

          <div className="p-4 rounded-sm bg-[#101311] border border-[#1D221F] flex flex-col items-center justify-between h-36">
            <Radio className="w-5 h-5 text-[#D4AF37] mt-1" />
            <span className="font-bold text-[#F5F3ED]">Acoustic Fingerprint</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-[#D4AF37]/10 text-[#D4AF37]">LIVE</span>
          </div>

          <div className="p-4 rounded-sm bg-[#101311] border border-[#1D221F] flex flex-col items-center justify-between h-36">
            <Lock className="w-5 h-5 text-[#D4AF37] mt-1" />
            <span className="font-bold text-[#F5F3ED]">SHA-256 Seal</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-[#D4AF37]/10 text-[#D4AF37]">READY</span>
          </div>

          <div className="p-4 rounded-sm bg-[#101311] border border-[#1D221F] flex flex-col items-center justify-between h-36">
            <FileCode2 className="w-5 h-5 text-[#62C7C0] mt-1" />
            <span className="font-bold text-[#F5F3ED]">IPFS Storage</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-[#62C7C0]/10 text-[#62C7C0]">LIVE</span>
          </div>

          <div className="p-4 rounded-sm bg-[#101311] border border-[#1D221F] flex flex-col items-center justify-between h-36">
            <ShieldCheck className="w-5 h-5 text-[#7CC8A0] mt-1" />
            <span className="font-bold text-[#F5F3ED]">Polygon Ledger</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-[#7CC8A0]/10 text-[#7CC8A0]">LIVE</span>
          </div>

          <div className="p-4 rounded-sm bg-[#101311] border border-[#1D221F] flex flex-col items-center justify-between h-36">
            <Share2 className="w-5 h-5 text-[#D4AF37] mt-1" />
            <span className="font-bold text-[#F5F3ED]">Dynamic QR</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-[#D4AF37]/10 text-[#D4AF37]">LIVE</span>
          </div>

          <div className="p-4 rounded-sm bg-[#101311] border border-[#1D221F] flex flex-col items-center justify-between h-36">
            <Search className="w-5 h-5 text-[#7CC8A0] mt-1" />
            <span className="font-bold text-[#F5F3ED]">Consumer View</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-xs bg-[#7CC8A0]/10 text-[#7CC8A0]">READY</span>
          </div>
        </div>
      </section>

      {/* SECTION 8: SYSTEM HEALTH */}
      <section id="status" className="py-20 px-6 lg:px-12 bg-[#101311] border-y border-[#1D221F]">
        <div className="max-w-7xl mx-auto">
          <SystemHealthPanel />
        </div>
      </section>

      {/* SECTION 9: STAKEHOLDERS — ECOSYSTEM ROLES */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest">Ecosystem Roles</span>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#F5F3ED]">
            Connecting stakeholders across the value chain.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center font-mono text-xs">
          <div className="p-6 rounded-sm bg-[#101311] border border-[#1D221F] space-y-3">
            <Users className="w-6 h-6 text-[#7CC8A0] mx-auto" />
            <h3 className="font-serif text-lg text-[#F5F3ED] font-normal">PRODUCER</h3>
            <p className="text-[#9A9A93] font-sans">Captures environmental audio at harvest site</p>
          </div>

          <div className="p-6 rounded-sm bg-[#101311] border border-[#1D221F] space-y-3">
            <Radio className="w-6 h-6 text-[#62C7C0] mx-auto" />
            <h3 className="font-serif text-lg text-[#F5F3ED] font-normal">ECHOCHAIN</h3>
            <p className="text-[#9A9A93] font-sans">Extracts features & generates cryptographic proof</p>
          </div>

          <div className="p-6 rounded-sm bg-[#101311] border border-[#1D221F] space-y-3">
            <Building2 className="w-6 h-6 text-[#D4AF37] mx-auto" />
            <h3 className="font-serif text-lg text-[#F5F3ED] font-normal">CERTIFIER</h3>
            <p className="text-[#9A9A93] font-sans">Attests regional provenance standards</p>
          </div>

          <div className="p-6 rounded-sm bg-[#101311] border border-[#1D221F] space-y-3">
            <Search className="w-6 h-6 text-[#7CC8A0] mx-auto" />
            <h3 className="font-serif text-lg text-[#F5F3ED] font-normal">CONSUMER</h3>
            <p className="text-[#9A9A93] font-sans">Scans QR to verify authentic product origin</p>
          </div>
        </div>
      </section>

      {/* SECTION 10: FINAL CTA */}
      <section className="py-24 px-6 lg:px-12 bg-[#101311] border-t border-[#1D221F] text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-4xl sm:text-6xl font-serif text-[#F5F3ED] tracking-tight">
            Trust what you can verify.
          </h2>
          <p className="text-[#9A9A93] text-sm max-w-2xl mx-auto font-sans">
            Privacy-preserving provenance infrastructure for the physical world.
          </p>
          <div className="pt-4 flex justify-center">
            <Link to="/register">
              <GoldButton variant="primary" showArrow className="!py-4 !px-8 text-xs">
                Explore EchoChain
              </GoldButton>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

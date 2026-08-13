import React, { useState } from 'react';
import { Waves, BarChart2, Cpu, Lock, Sparkles } from 'lucide-react';

export const SpectrogramDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'spectrogram' | 'features' | 'commitment'>('spectrogram');

  return (
    <div className="dark-card rounded-2xl p-6 sm:p-8 border border-emerald-500/20 text-gray-200">
      {/* Header Pipeline Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Pipeline Visualization
          </div>
          <h3 className="text-xl font-bold text-white">Acoustic Signal Processing Engine</h3>
        </div>

        {/* Phase 1 Truthfulness Badge */}
        <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          UI Visualization • Phase 5 Model Pending
        </div>
      </div>

      {/* Process Pipeline Flow Nodes */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 my-6 text-center text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center justify-center gap-1.5">
          <Waves className="w-3.5 h-3.5" /> Raw Audio
        </div>
        <div className="p-2.5 rounded-lg bg-teal-950/40 border border-teal-500/30 text-teal-300 flex items-center justify-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5" /> Spectrogram
        </div>
        <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 flex items-center justify-center gap-1.5">
          <Cpu className="w-3.5 h-3.5" /> Features
        </div>
        <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Embedding
        </div>
        <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-300 flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5" /> SHA-256
        </div>
      </div>

      {/* Interactive Spectrogram / Feature Grid View */}
      <div className="bg-slate-950 rounded-xl p-4 border border-white/10 relative overflow-hidden">
        {/* View Selection Toggle */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-800 text-xs">
          <span className="text-gray-400 font-mono">Frequency Spectra: 20Hz – 20kHz</span>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('spectrogram')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'spectrogram' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              Spectrogram
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'features' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              MFCC Matrix
            </button>
            <button
              onClick={() => setActiveTab('commitment')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'commitment' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-gray-400 hover:text-white'
              }`}
            >
              Cryptographic Hash
            </button>
          </div>
        </div>

        {/* Dynamic Canvas Visualizer */}
        {activeTab === 'spectrogram' && (
          <div className="h-44 w-full flex items-end gap-1 px-2 pt-4">
            {[...Array(64)].map((_, i) => {
              const heightPct = Math.min(100, Math.max(15, (Math.sin(i * 0.3) * 40 + Math.cos(i * 0.7) * 35 + 50)));
              const isHighFreq = i % 7 === 0;
              return (
                <div key={i} className="flex-1 flex flex-col justify-end h-full gap-0.5">
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      isHighFreq ? 'bg-cyan-400' : 'bg-gradient-to-t from-emerald-600 via-teal-500 to-emerald-300'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'features' && (
          <div className="h-44 w-full grid grid-cols-12 gap-1.5 p-2 font-mono text-[10px]">
            {[...Array(36)].map((_, i) => {
              const val = ((i * 17) % 99) / 100;
              return (
                <div
                  key={i}
                  className="rounded p-1 text-center font-bold flex items-center justify-center"
                  style={{
                    backgroundColor: `rgba(16, 185, 129, ${0.15 + val * 0.5})`,
                    color: val > 0.5 ? '#A7F3D0' : '#6EE7B7'
                  }}
                >
                  {val.toFixed(2)}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'commitment' && (
          <div className="h-44 w-full flex flex-col justify-center items-center text-center p-4 font-mono">
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 max-w-lg w-full">
              <span className="text-xs text-emerald-400 font-semibold block mb-1">SHA-256 Acoustic Commitment Payload</span>
              <p className="text-sm font-bold text-white break-all tracking-wider">
                e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Combines spectral coefficients + region ID + timestamp into a tamper-evident hash.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-400 flex items-center justify-between">
        <span>Sample Rate: 44.1kHz • Mono Channel</span>
        <span>Feature Vector: MFCC (13) + Chroma (12) + Spectral Contrast (7)</span>
      </div>
    </div>
  );
};

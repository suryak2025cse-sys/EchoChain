import React from 'react';
import { Waves, Sparkles } from 'lucide-react';

export const AcousticCircle: React.FC = () => {
  return (
    <div className="relative w-full max-w-[420px] aspect-square mx-auto flex items-center justify-center p-4">
      {/* Subtle Ambient Outer Ring Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent blur-2xl pointer-events-none" />

      {/* Concentric Rotating Frequency Rings */}
      <div className="absolute inset-4 rounded-full border border-emerald-900/10 dark:border-emerald-500/10 animate-spin-slow" />
      <div className="absolute inset-10 rounded-full border border-dashed border-teal-800/20 dark:border-teal-400/20" />
      <div className="absolute inset-16 rounded-full border border-emerald-600/15 dark:border-emerald-400/15 animate-pulse-subtle" />

      {/* Radial Frequency Bar Simulation (Ecosystem soundscape representation) */}
      <svg className="absolute inset-0 w-full h-full text-emerald-600/30 dark:text-emerald-400/30" viewBox="0 0 100 100">
        {[...Array(24)].map((_, i) => {
          const angle = (i * 360) / 24;
          const rad = (angle * Math.PI) / 180;
          const x1 = 50 + 34 * Math.cos(rad);
          const y1 = 50 + 34 * Math.sin(rad);
          const height = 4 + ((i * 7) % 11);
          const x2 = 50 + (34 + height) * Math.cos(rad);
          const y2 = 50 + (34 + height) * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Core Center Card */}
      <div className="relative z-10 w-48 h-48 rounded-full bg-white dark:bg-[#0D1815] shadow-xl border border-emerald-900/10 dark:border-emerald-500/20 flex flex-col items-center justify-center p-6 text-center">
        {/* Animated Wave Icon */}
        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center mb-3">
          <Waves className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
        </div>

        {/* Small Audio Waveform SVG */}
        <div className="flex items-center gap-1 h-6 my-1">
          {[40, 75, 30, 90, 60, 100, 45, 80, 50, 70, 35].map((h, idx) => (
            <div
              key={idx}
              className="w-1 bg-gradient-to-t from-emerald-600 to-teal-500 rounded-full transition-all duration-300"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        {/* Signature Badge Text */}
        <div className="mt-2 flex items-center gap-1 text-[10px] font-mono font-semibold tracking-wider text-emerald-800 dark:text-emerald-300 uppercase">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          Acoustic Signature
        </div>
        <p className="text-[9px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
          128-D Feature Embedding
        </p>
      </div>

      {/* Satellite Node Badges */}
      <div className="absolute top-6 left-6 px-2.5 py-1 rounded-full bg-white/90 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono text-emerald-800 dark:text-emerald-300 shadow-sm backdrop-blur-sm">
        Fauna: 44.1kHz
      </div>

      <div className="absolute bottom-8 right-6 px-2.5 py-1 rounded-full bg-white/90 dark:bg-emerald-950/80 border border-teal-200 dark:border-teal-800 text-[10px] font-mono text-teal-800 dark:text-teal-300 shadow-sm backdrop-blur-sm">
        Canopy Reverb
      </div>
    </div>
  );
};

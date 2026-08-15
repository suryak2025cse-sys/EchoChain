import React from 'react';
import { Waves, Sparkles } from 'lucide-react';

export const AcousticCircle: React.FC = () => {
  return (
    <div className="relative w-full max-w-[420px] aspect-square mx-auto flex items-center justify-center p-4">
      {/* Subtle Ambient Outer Ring Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D4AF37]/15 via-[#62C7C0]/5 to-transparent blur-2xl pointer-events-none" />

      {/* Concentric Rotating Frequency Rings */}
      <div className="absolute inset-4 rounded-full border border-[#D4AF37]/20 animate-spin-slow" />
      <div className="absolute inset-10 rounded-full border border-dashed border-[#62C7C0]/30" />
      <div className="absolute inset-16 rounded-full border border-[#D4AF37]/30 animate-pulse-gold" />

      {/* Radial Frequency Bar Simulation */}
      <svg className="absolute inset-0 w-full h-full text-[#D4AF37]/40" viewBox="0 0 100 100">
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
      <div className="relative z-10 w-48 h-48 rounded-full bg-[#101311] shadow-2xl border border-[#D4AF37]/40 flex flex-col items-center justify-center p-6 text-center">
        {/* Animated Wave Icon */}
        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center mb-3">
          <Waves className="w-5 h-5 text-[#D4AF37] animate-pulse" />
        </div>

        {/* Small Audio Waveform SVG */}
        <div className="flex items-center gap-1 h-6 my-1">
          {[40, 75, 30, 90, 60, 100, 45, 80, 50, 70, 35].map((h, idx) => (
            <div
              key={idx}
              className="w-1 bg-gold-metallic rounded-full transition-all duration-300"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        {/* Signature Badge Text */}
        <div className="mt-2 flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider text-[#D4AF37] uppercase">
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          Acoustic Signature
        </div>
        <p className="text-[9px] text-[#9A9A93] font-mono mt-0.5">
          128-D Feature Embedding
        </p>
      </div>

      {/* Satellite Node Badges */}
      <div className="absolute top-6 left-6 px-3 py-1 rounded-xs bg-[#101311] border border-[#1D221F] text-[10px] font-mono text-[#D4AF37] shadow-sm">
        Fauna: 44.1kHz
      </div>

      <div className="absolute bottom-8 right-6 px-3 py-1 rounded-xs bg-[#101311] border border-[#1D221F] text-[10px] font-mono text-[#62C7C0] shadow-sm">
        Canopy Reverb
      </div>
    </div>
  );
};

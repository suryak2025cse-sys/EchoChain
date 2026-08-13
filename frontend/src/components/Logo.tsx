import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon' | 'navbar';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'full', className = '' }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon Emblem: Golden 'E' with Acoustic Waves */}
      <div className="relative w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-b from-[#1C180C] to-[#0D1311] border border-[#D97706]/30 shadow-md shadow-amber-900/20 group-hover:border-[#F59E0B]/60 transition-all">
        <svg
          viewBox="0 0 100 100"
          className="w-7 h-7 filter drop-shadow-[0_2px_4px_rgba(217,119,6,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Elegant Serif 'E' Structure */}
          {/* Top serif & bar */}
          <path
            d="M28 20 H74 V32 H62 V28 H44 V42 H60 V46 H44 V72 H76 V68 H64 V80 H28 V68 H40 V32 H28 V20 Z"
            fill="url(#goldGradient)"
          />

          {/* Upper Wave Cut Ribbon */}
          <path
            d="M 20 44 C 35 34, 55 54, 80 42 C 65 52, 45 32, 20 44 Z"
            fill="url(#waveGradient)"
            opacity="0.95"
          />

          {/* Lower Wave Cut Ribbon */}
          <path
            d="M 20 54 C 35 44, 55 64, 80 52 C 65 62, 45 42, 20 54 Z"
            fill="url(#waveGradient)"
            opacity="0.95"
          />
        </svg>
      </div>

      {/* Typography: ECHOCHAIN & SINCE 2026 */}
      {variant !== 'icon' && (
        <div className="flex flex-col leading-none">
          <span className="font-serif font-extrabold text-lg tracking-[0.08em] text-gray-900 dark:text-white uppercase font-sans">
            ECHO<span className="text-[#D97706] dark:text-[#F59E0B]">CHAIN</span>
          </span>
          <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#B45309] dark:text-[#FBBF24] uppercase mt-0.5">
            SINCE 2026
          </span>
        </div>
      )}
    </div>
  );
};

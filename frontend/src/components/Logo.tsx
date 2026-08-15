import React from 'react';

interface LogoProps {
  variant?: 'full' | 'icon' | 'navbar';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'full', className = '' }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon Emblem: Golden 'E' with Acoustic Waves */}
      <div className="relative w-9 h-9 shrink-0 flex items-center justify-center rounded-xs bg-[#101311] border border-[#D4AF37]/40 shadow-md">
        <svg
          viewBox="0 0 100 100"
          className="w-6 h-6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldGradientLogo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E6C665" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#B89028" />
            </linearGradient>
          </defs>

          <path
            d="M28 20 H74 V32 H62 V28 H44 V42 H60 V46 H44 V72 H76 V68 H64 V80 H28 V68 H40 V32 H28 V20 Z"
            fill="url(#goldGradientLogo)"
          />

          <path
            d="M 20 44 C 35 34, 55 54, 80 42 C 65 52, 45 32, 20 44 Z"
            fill="url(#goldGradientLogo)"
            opacity="0.9"
          />
        </svg>
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col leading-none">
          <span className="font-mono font-bold text-base tracking-[0.15em] text-[#F5F3ED] uppercase">
            ECHO<span className="text-[#D4AF37]">CHAIN</span>
          </span>
          <span className="text-[9px] font-mono tracking-[0.25em] text-[#9A9A93] uppercase mt-1">
            ACOUSTIC PROVENANCE
          </span>
        </div>
      )}
    </div>
  );
};

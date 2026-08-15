import React from 'react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#1D221F] bg-[#080A09] py-12 px-6 md:px-12 text-[#9A9A93] font-mono text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Logo variant="icon" />
          <div>
            <div className="text-[#F5F3ED] font-bold tracking-widest uppercase">ECHOCHAIN PROTOCOL</div>
            <div className="text-[11px] text-[#9A9A93]">Acoustic Intelligence & Provenance Infrastructure</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 uppercase tracking-widest text-[11px]">
          <a href="/#how-it-works" className="hover:text-[#D4AF37] transition-colors">Solutions</a>
          <a href="/#architecture" className="hover:text-[#D4AF37] transition-colors">Architecture</a>
          <a href="/verify/ECH-COFFEE-8821" className="hover:text-[#D4AF37] transition-colors">Verification</a>
          <span className="text-[#1D221F]">|</span>
          <span className="text-[#7CC8A0]">Polygon Testnet Live</span>
        </div>

        <div className="text-[11px] text-[#9A9A93]">
          © {new Date().getFullYear()} EchoChain Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

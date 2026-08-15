import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface VerificationBadgeProps {
  status: string;
  productId: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ productId }) => {

  return (
    <div className="p-8 rounded-sm bg-gradient-to-b from-[#101311] to-[#080A09] border border-[#D4AF37]/50 text-center space-y-4 shadow-2xl relative overflow-hidden">
      
      {/* Background Pulse Signal */}
      <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center">
        <div className="w-64 h-64 rounded-full border border-[#D4AF37] animate-ping" />
      </div>

      <div className="relative z-10 flex justify-center">
        <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.3)]">
          <CheckCircle2 className="w-10 h-10" />
        </div>
      </div>

      <div className="relative z-10 space-y-2">
        <div className="text-xs font-mono text-[#D4AF37] uppercase tracking-widest font-bold">
          ECHOCHAIN CERTIFICATE OF AUTHENTICITY
        </div>
        <h2 className="text-4xl sm:text-5xl font-serif text-[#F5F3ED] tracking-tight">
          VERIFIED <span className="text-[#D4AF37]">✓</span>
        </h2>
        <p className="text-xs font-mono text-[#9A9A93]">
          Product Batch Identifier: <span className="text-[#F5F3ED] font-bold">{productId}</span>
        </p>
      </div>

      <div className="relative z-10 pt-4 border-t border-[#1D221F] flex items-center justify-center gap-2 text-xs font-mono text-[#7CC8A0]">
        <ShieldCheck className="w-4 h-4 text-[#7CC8A0]" />
        <span>7/7 Cryptographic & Acoustic Proof Layers Confirmed Valid</span>
      </div>

    </div>
  );
};

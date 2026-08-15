import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, Lock, Database, Binary, Radio, Cpu } from 'lucide-react';

export interface TimelineStep {
  id: string;
  title: string;
  subtitle: string;
  timestamp?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'FAILED';
  details?: Record<string, any>;
}

interface ProvenanceTimelineProps {
  steps: TimelineStep[];
}

export const ProvenanceTimeline: React.FC<ProvenanceTimelineProps> = ({ steps }) => {
  const getIcon = (id: string, status: string) => {
    if (status === 'COMPLETED') return <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />;
    switch (id) {
      case 'capture': return <Radio className="w-4 h-4 text-[#7CC8A0]" />;
      case 'acoustic': return <Cpu className="w-4 h-4 text-[#62C7C0]" />;
      case 'liveness': return <ShieldCheck className="w-4 h-4 text-[#7CC8A0]" />;
      case 'seal': return <Lock className="w-4 h-4 text-[#D4AF37]" />;
      case 'ipfs': return <Database className="w-4 h-4 text-[#62C7C0]" />;
      case 'polygon': return <Binary className="w-4 h-4 text-[#D4AF37]" />;
      default: return <Clock className="w-4 h-4 text-[#9A9A93]" />;
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div className="relative pl-6 border-l border-[#1D221F] space-y-8">
        {steps.map((step, idx) => {
          const isDone = step.status === 'COMPLETED';
          return (
            <div key={step.id || idx} className="relative group">
              {/* Dot Node */}
              <div className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                isDone
                  ? 'bg-[#101311] border-[#D4AF37] text-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                  : 'bg-[#080A09] border-[#1D221F] text-[#9A9A93]'
              }`}>
                {getIcon(step.id, step.status)}
              </div>

              <div className="p-5 rounded-sm bg-[#101311] border border-[#1D221F] group-hover:border-[#D4AF37]/30 transition-all space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`font-bold uppercase tracking-wider text-xs ${isDone ? 'text-[#D4AF37]' : 'text-[#F5F3ED]'}`}>
                    0{idx + 1}. {step.title}
                  </span>
                  {step.timestamp && (
                    <span className="text-[11px] text-[#9A9A93]">{step.timestamp}</span>
                  )}
                </div>

                <p className="text-[#9A9A93] leading-relaxed">{step.subtitle}</p>

                {step.details && Object.keys(step.details).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#1D221F] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {Object.entries(step.details).map(([k, v]) => (
                      <div key={k} className="flex justify-between bg-[#080A09] p-2 rounded-xs border border-[#1D221F]">
                        <span className="text-[#9A9A93] uppercase">{k.replace('_', ' ')}:</span>
                        <span className="text-[#F5F3ED] font-semibold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

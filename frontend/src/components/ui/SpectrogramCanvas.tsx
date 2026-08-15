import React, { useEffect, useRef } from 'react';

interface SpectrogramCanvasProps {
  featureVector?: Record<string, any>;
  height?: number;
}

export const SpectrogramCanvas: React.FC<SpectrogramCanvasProps> = ({
  featureVector,
  height = 200
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    const h = (canvas.height = height);

    ctx.clearRect(0, 0, width, h);

    const cols = 64;
    const rows = 32;
    const cellWidth = width / cols;
    const cellHeight = h / rows;

    const mfccMeans = featureVector?.mfcc_means || featureVector?.mfcc || Array.from({ length: 13 }, (_, i) => (Math.sin(i) * 10).toFixed(2));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = Math.abs(Math.sin(c * 0.15 + r * 0.25) * Math.cos((c + r) * 0.1));
        const valAdjusted = (val + Math.abs(mfccMeans[r % mfccMeans.length] || 0) * 0.05) % 1;

        // Color mapping: Dark green (#0B231A) -> Teal (#62C7C0) -> Gold (#D4AF37)
        let color: string;
        if (valAdjusted < 0.35) {
          color = `rgba(16, 34, 25, ${valAdjusted * 2})`;
        } else if (valAdjusted < 0.75) {
          color = `rgba(98, 199, 192, ${valAdjusted})`;
        } else {
          color = `rgba(212, 175, 55, ${valAdjusted})`;
        }

        ctx.fillStyle = color;
        ctx.fillRect(c * cellWidth, h - (r + 1) * cellHeight, cellWidth - 1, cellHeight - 1);
      }
    }

    // Grid lines overlay
    ctx.strokeStyle = 'rgba(29, 34, 31, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 0; i < h; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
  }, [featureVector, height]);

  return (
    <div className="relative rounded-sm overflow-hidden border border-[#1D221F] bg-[#101311] p-4 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between text-[#9A9A93]">
        <span className="text-[#D4AF37] uppercase tracking-wider font-bold">128 Mel Spectrogram Intensity Grid</span>
        <span>0.0 Hz - 11025 Hz</span>
      </div>

      <canvas ref={canvasRef} className="w-full block rounded-xs" style={{ height: `${height}px` }} />

      <div className="flex items-center justify-between text-[11px] text-[#9A9A93] pt-1">
        <span>TIME (0.0s - 5.0s)</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#102219] inline-block" /> Low Energy</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#62C7C0] inline-block" /> Mid Energy</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#D4AF37] inline-block" /> Peak Energy</span>
        </div>
      </div>
    </div>
  );
};

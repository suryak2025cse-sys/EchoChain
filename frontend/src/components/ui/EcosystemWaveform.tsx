import React, { useEffect, useRef } from 'react';

interface EcosystemWaveformProps {
  height?: number;
  color?: string;
  speed?: number;
}

export const EcosystemWaveform: React.FC<EcosystemWaveformProps> = ({
  height = 240,
  color = '#D4AF37',
  speed = 0.015
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let h = (canvas.height = height);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      h = canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, h);

      // Layer 1: Ambient Back Wave
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.12;
      for (let x = 0; x < width; x += 5) {
        const y = Math.sin(x * 0.008 + offset) * 35 + h / 2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Layer 2: Main Harmonic Wave
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.35;
      for (let x = 0; x < width; x += 3) {
        const y = Math.sin(x * 0.012 + offset * 1.5) * 22 + Math.cos(x * 0.005 - offset) * 15 + h / 2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Layer 3: High-Frequency Resonance
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#62C7C0';
      ctx.globalAlpha = 0.2;
      for (let x = 0; x < width; x += 4) {
        const y = Math.sin(x * 0.02 - offset * 2) * 12 + h / 2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      offset += speed;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [height, color, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full pointer-events-none block"
      style={{ height: `${height}px` }}
    />
  );
};

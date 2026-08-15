import React, { useEffect, useRef } from 'react';

interface TopographicCanvasProps {
  height?: number;
  lineColor?: string;
  opacity?: number;
}

export const TopographicCanvas: React.FC<TopographicCanvasProps> = ({
  height = 300,
  lineColor = '#D4AF37',
  opacity = 0.15
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
      ctx.strokeStyle = lineColor;
      ctx.globalAlpha = opacity;
      ctx.lineWidth = 1;

      // Render concentric topographic contour loops
      const numRings = 12;
      const centerX = width * 0.7;
      const centerY = h * 0.5;

      for (let i = 1; i <= numRings; i++) {
        const radius = i * 22;
        ctx.beginPath();

        for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
          // Deform radius with sinusoidal noise
          const distortion = Math.sin(angle * 4 + offset + i) * (8 + i * 1.5) + Math.cos(angle * 2 - offset) * 5;
          const r = radius + distortion;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r * 0.6; // Slightly flattened ellipse

          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      offset += 0.003;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [height, lineColor, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full pointer-events-none block"
      style={{ height: `${height}px` }}
    />
  );
};

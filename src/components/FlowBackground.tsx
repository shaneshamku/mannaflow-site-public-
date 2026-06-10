import { useEffect, useRef } from 'react';

/*
  FlowBackground — one full-page vertical glowing ribbon.

  A fixed, full-viewport canvas sitting behind all content (z-index 0; content
  rides at z-index 1 via global.css). It draws a cluster of vertical wave lines
  (top -> bottom) that together read as a single glowing teal ribbon. The whole
  ribbon snakes slowly left -> right -> left across the page; each line also has
  its own gentle wiggle so the flow feels organic. Kept faint so body text and
  cards stay readable. Reduced-motion renders a single static frame.
*/

// 5 stacked lines form the ribbon. Teal glow (olive doesn't glow) per the
// Leafworks palette — olive is reserved for UI accents.
const WAVES = [
  { offset: 0,             amplitude: 38, frequency: 0.0042, color: 'rgba(82,132,138,0.55)',  opacity: 0.30 },
  { offset: Math.PI / 2,   amplitude: 52, frequency: 0.0034, color: 'rgba(82,132,138,0.42)',  opacity: 0.24 },
  { offset: Math.PI,       amplitude: 30, frequency: 0.0050, color: 'rgba(82,132,138,0.34)', opacity: 0.20 },
  { offset: Math.PI * 1.5, amplitude: 46, frequency: 0.0028, color: 'rgba(82,132,138,0.24)', opacity: 0.15 },
  { offset: Math.PI * 2,   amplitude: 26, frequency: 0.0056, color: 'rgba(82,132,138,0.18)',  opacity: 0.11 },
];

export default function FlowBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      if (!reducedMotion.current) {
        timeRef.current += 0.01;
      }

      ctx.clearRect(0, 0, w, h);

      const t = timeRef.current;
      // Whole-ribbon snake: slow left <-> right drift across the page width.
      const centerX = w * 0.5 + Math.sin(t * 0.08) * (w * 0.28);

      WAVES.forEach((wave) => {
        ctx.beginPath();

        for (let y = 0; y <= h; y += 2) {
          const x =
            centerX +
            Math.sin(y * wave.frequency + t + wave.offset) * wave.amplitude +
            Math.sin(y * wave.frequency * 0.5 + t * 0.7 + wave.offset) * (wave.amplitude * 0.4);

          if (y === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = wave.color;
        ctx.lineWidth = reducedMotion.current ? 1.5 : 2;
        ctx.shadowColor = 'rgba(82,132,138,0.6)';
        ctx.shadowBlur = reducedMotion.current ? 4 : 14;
        ctx.globalAlpha = wave.opacity;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      if (!reducedMotion.current) {
        animFrameRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
}

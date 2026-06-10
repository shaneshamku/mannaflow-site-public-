import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import VideoDemoOrb from './VideoDemoOrb';

const THEME = {
  backgroundTop: '#EEECE1',
  backgroundBottom: '#F4EBDD',
  wavePalette: [
    { offset: 0,             amplitude: 70, frequency: 0.003,  color: 'rgba(12,145,237,0.5)',  opacity: 0.45 },
    { offset: Math.PI / 2,   amplitude: 90, frequency: 0.0026, color: 'rgba(12,145,237,0.38)', opacity: 0.35 },
    { offset: Math.PI,       amplitude: 60, frequency: 0.0034, color: 'rgba(12,145,237,0.27)', opacity: 0.27 },
    { offset: Math.PI * 1.5, amplitude: 80, frequency: 0.0022, color: 'rgba(12,145,237,0.18)', opacity: 0.18 },
    { offset: Math.PI * 2,   amplitude: 55, frequency: 0.004,  color: 'rgba(12,145,237,0.12)', opacity: 0.12 },
  ],
};

export default function GlowyWavesHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const timeRef = useRef(0);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };
    const onMouseLeave = () => {
      targetMouseRef.current = { x: 0.5, y: 0.5 };
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      if (!reducedMotion.current) {
        timeRef.current += 0.012;
        // Ease mouse toward target
        mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;
      }

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, THEME.backgroundTop);
      grad.addColorStop(1, THEME.backgroundBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const t = timeRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      THEME.wavePalette.forEach((wave) => {
        ctx.beginPath();

        const baseY = h * (0.45 + (my - 0.5) * 0.15);
        const mouseShift = (mx - 0.5) * 80;

        for (let x = 0; x <= w; x += 2) {
          const progress = x / w;
          const y =
            baseY +
            Math.sin(progress * w * wave.frequency + t + wave.offset) * wave.amplitude +
            Math.sin(progress * w * wave.frequency * 0.5 + t * 0.7 + wave.offset) * (wave.amplitude * 0.4) +
            mouseShift * Math.sin(progress * Math.PI);

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = wave.color;
        ctx.lineWidth = reducedMotion.current ? 1.5 : 2;
        ctx.shadowColor = 'rgba(12,145,237,0.6)';
        ctx.shadowBlur = reducedMotion.current ? 4 : 12;
        ctx.globalAlpha = wave.opacity;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      ro.disconnect();
    };
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  return (
    <section
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
        aria-hidden="true"
      />

      {/* Content — two-column */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        {/* Left column — copy */}
        <div className="flex flex-col items-start text-left">
          {/* Eyebrow */}
          <motion.span
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.05}
            className="mb-5"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#54a563',
            }}
          >
            Never Miss Another Lead
          </motion.span>

          {/* H1 */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.15}
            className="font-extrabold tracking-tight mb-6"
            style={{
              fontSize: 'clamp(36px, 5vw, 64px)',
              lineHeight: 1.06,
              letterSpacing: '-0.02em',
              color: '#1C1C1C',
            }}
          >
            Turn Missed Inquiries Into{' '}
            <span style={{ color: '#0c91ed' }}>Booked Appointments</span>
          </motion.h1>

          {/* Subhead */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.25}
            style={{
              fontSize: 'clamp(17px, 1.8vw, 22px)',
              lineHeight: 1.55,
              color: '#4A4A4A',
              maxWidth: '480px',
              marginBottom: '2.5rem',
            }}
          >
            Respond faster, qualify leads, and book more appointments — without adding front-office work.
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.35}
          >
            <button
              onClick={() => window.open('https://cal.com', '_blank')}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-white transition-all duration-150 hover:brightness-110 active:scale-95"
              style={{ background: '#54a563', fontSize: '16px' }}
            >
              Book a Call
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>

        {/* Right column — video demo orb */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.4}
          className="flex justify-center md:justify-end"
        >
          <VideoDemoOrb />
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import VideoDemoOrb from './VideoDemoOrb';

export default function GlowyWavesHero() {
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
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", background: 'transparent' }}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Content — two-column (flow ribbon is rendered page-wide by FlowBackground) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-24 pb-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

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
              color: '#1b6119',
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
              color: '#0B0D09',
            }}
          >
            Turn Missed Inquiries Into{' '}
            <span style={{ color: '#52848A' }}>Booked Appointments</span>
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
              color: '#5B5E57',
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
              style={{ background: '#1b6119', fontSize: '16px' }}
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

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';

interface VideoDemoOrbProps {
  /** Real demo video source. When omitted, the modal shows a placeholder. */
  videoSrc?: string;
}

export default function VideoDemoOrb({ videoSrc }: VideoDemoOrbProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on Escape, lock body scroll, restore focus on close.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Label */}
      <span
        style={{
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#5B5E57',
        }}
      >
        Talk to an Agent
      </span>

      {/* Orb + play button */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-label="Play MannaFlow agent demo"
        className="vdo-orb-trigger relative grid place-items-center"
        style={{
          width: 'clamp(220px, 22vw, 300px)',
          height: 'clamp(220px, 22vw, 300px)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {/* Animated gradient orb */}
        <span className="vdo-orb" aria-hidden="true" />
        {/* Soft outer glow */}
        <span className="vdo-orb-glow" aria-hidden="true" />

        {/* Play button */}
        <motion.span
          className="relative z-10 grid place-items-center rounded-full"
          style={{
            width: 72,
            height: 72,
            background: '#FFFFFF',
            boxShadow: '0 8px 28px rgba(27, 97, 25,0.35)',
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
        >
          <Play size={26} fill="#1b6119" stroke="#1b6119" style={{ marginLeft: 3 }} />
        </motion.span>
      </button>

      {/* Caption */}
      <div className="flex flex-col items-center gap-0.5">
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#0B0D09' }}>MannaFlow</span>
        <span style={{ fontSize: '13px', color: '#5B5E57' }}>See it in action</span>
      </div>

      {/* Modal / lightbox */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(11, 13, 9,0.6)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="MannaFlow agent demo"
          >
            <motion.div
              className="relative w-full max-w-3xl"
              style={{ aspectRatio: '16 / 9' }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close demo"
                className="absolute -top-12 right-0 grid place-items-center rounded-full transition-transform hover:scale-110"
                style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>

              {videoSrc ? (
                <video
                  src={videoSrc}
                  controls
                  autoPlay
                  className="w-full h-full rounded-xl"
                  style={{ background: '#000', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="w-full h-full rounded-xl grid place-items-center text-center px-6"
                  style={{
                    background: 'linear-gradient(135deg, #1b6119 0%, #1b6119 100%)',
                    color: '#FFFFFF',
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Play size={40} fill="#FFFFFF" stroke="#FFFFFF" />
                    <span style={{ fontSize: '20px', fontWeight: 700 }}>Demo video coming soon</span>
                    <span style={{ fontSize: '14px', opacity: 0.85 }}>
                      A live walkthrough of the MannaFlow agent will play here.
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .vdo-orb {
          position: absolute;
          inset: 0;
          border-radius: 42% 58% 56% 44% / 48% 44% 56% 52%;
          background: conic-gradient(
            from 0deg,
            #1b6119,
            #1b6119,
            #719294,
            #52848A,
            #1b6119
          );
          filter: blur(2px);
          animation: vdo-spin 14s linear infinite, vdo-morph 9s ease-in-out infinite;
        }
        .vdo-orb-glow {
          position: absolute;
          inset: -8%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(27, 97, 25,0.35) 0%, rgba(27, 97, 25,0) 65%);
          filter: blur(12px);
          animation: vdo-pulse 5s ease-in-out infinite;
        }
        @keyframes vdo-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes vdo-morph {
          0%, 100% { border-radius: 42% 58% 56% 44% / 48% 44% 56% 52%; }
          50%      { border-radius: 56% 44% 42% 58% / 52% 56% 44% 48%; }
        }
        @keyframes vdo-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.06); }
        }
        @media (prefers-reduced-motion: reduce) {
          .vdo-orb, .vdo-orb-glow {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}

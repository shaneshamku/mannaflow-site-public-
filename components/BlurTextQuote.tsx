"use client"

import { useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"

// Computed at module level so values are consistent across server/client renders
const LINE1 = "This year".split(" ").map((word, i) => ({
  text: word,
  duration: 2.2 + Math.cos(i * 0.3) * 0.3,
  delay: i * 0.14,
  blur: 12 + ((i * 3) % 7),
  scale: 0.92 + Math.sin(i * 0.2) * 0.04,
}))

const LINE2 = "choose growth over comfort".split(" ").map((word, i) => ({
  text: word,
  duration: 2.0 + Math.cos(i * 0.3) * 0.3,
  delay: LINE1.length * 0.14 + i * 0.18,
  blur: 12 + ((i * 5) % 7),
  scale: 0.92 + Math.sin(i * 0.2) * 0.04,
}))

const ALL_WORDS = [...LINE1, ...LINE2]

type Word = (typeof LINE1)[0]

export default function BlurTextQuote() {
  const [isAnimating, setIsAnimating] = useState(false)
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const maxTime = Math.max(...ALL_WORDS.map((w) => w.delay + w.duration))

    const start = () => {
      setTimeout(() => setIsAnimating(true), 200)
      animRef.current = setTimeout(() => {
        setIsAnimating(false)
        resetRef.current = setTimeout(start, 3500)
      }, (maxTime + 1.2) * 1000)
    }

    start()

    return () => {
      if (animRef.current) clearTimeout(animRef.current)
      if (resetRef.current) clearTimeout(resetRef.current)
    }
  }, [])

  const wordStyle = (w: Word): CSSProperties => ({
    display: "inline-block",
    marginRight: "0.35em",
    opacity: isAnimating ? 1 : 0,
    filter: isAnimating ? "blur(0px) brightness(1)" : `blur(${w.blur}px) brightness(0.5)`,
    transform: isAnimating
      ? "translateY(0) scale(1) rotateX(0deg)"
      : `translateY(22px) scale(${w.scale}) rotateX(-15deg)`,
    transitionProperty: "opacity, filter, transform",
    transitionDuration: `${w.duration}s`,
    transitionDelay: `${w.delay}s`,
    transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    willChange: "filter, transform, opacity",
    textShadow: isAnimating
      ? "0 2px 10px rgba(242, 232, 236, 0.12)"
      : "0 0 40px rgba(255,255,255,0.35)",
  })

  const textStyle: CSSProperties = {
    fontFamily: "'MontaguSlab', Georgia, serif",
    fontSize: "clamp(1.6rem, 6.5vw, 5.5rem)",
    fontWeight: 200,
    fontVariationSettings: "'opsz' 120, 'wght' 200",
    color: "#F5F2EC",
    lineHeight: 1.15,
    letterSpacing: "-0.025em",
  }

  return (
    <section
      className="relative flex items-center justify-center"
      style={{
        minHeight: "60vh",
        backgroundImage: "url('/images/bg-3.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(53, 82, 74, 0.72)" }}
      />

      <div
        className="relative z-10 text-center px-8"
        style={{ perspective: "1000px" }}
      >
        <p style={textStyle}>
          <span className="block" style={{ marginBottom: "0.05em" }}>
            {LINE1.map((w, i) => (
              <span key={i} style={wordStyle(w)}>
                {w.text}
              </span>
            ))}
          </span>
          <span className="block">
            {LINE2.map((w, i) => (
              <span key={i} style={wordStyle(w)}>
                {w.text}
              </span>
            ))}
          </span>
        </p>
      </div>
    </section>
  )
}

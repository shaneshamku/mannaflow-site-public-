"use client"

import { useEffect, useRef, useState } from "react"

export default function BlurTextQuote() {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) {
      setVisible(true)
      return
    }

    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
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

      <div className="relative z-10 text-center px-8">
        <p
          style={{
            fontFamily: "'MontaguSlab', Georgia, serif",
            fontSize: "clamp(1.6rem, 6.5vw, 5.5rem)",
            fontWeight: 200,
            fontVariationSettings: "'opsz' 120, 'wght' 200",
            color: "#F5F2EC",
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            opacity: visible ? 1 : 0,
            transition: "opacity 1.2s ease",
          }}
        >
          <span className="block" style={{ marginBottom: "0.05em" }}>
            This year
          </span>
          <span className="block">choose growth over comfort.</span>
        </p>
      </div>
    </section>
  )
}

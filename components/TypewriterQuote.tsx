"use client"

import { useEffect, useRef, useState } from "react"

const QUOTE = "Take risks now. Do something bold. You won't regret it."

export default function TypewriterQuote() {
  const sectionRef = useRef<HTMLElement>(null)
  const [started, setStarted] = useState(false)
  const [displayed, setDisplayed] = useState("")
  const [showCursor, setShowCursor] = useState(true)

  // Trigger typing when the section enters the viewport
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Type one character at a time — only after scroll trigger
  useEffect(() => {
    if (!started) return
    if (displayed.length >= QUOTE.length) return
    const t = setTimeout(() => {
      setDisplayed(QUOTE.slice(0, displayed.length + 1))
    }, 55)
    return () => clearTimeout(t)
  }, [started, displayed])

  // Cursor blink — runs always so it's ready before typing starts
  useEffect(() => {
    const interval = setInterval(() => setShowCursor((p) => !p), 500)
    return () => clearInterval(interval)
  }, [])

  const done = displayed.length >= QUOTE.length

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
        style={{ backgroundColor: "rgba(53, 82, 74, 0.78)" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20 text-center">
        <p
          style={{
            fontFamily: "'MontaguSlab', Georgia, serif",
            fontSize: "clamp(1.4rem, 3.5vw, 2.75rem)",
            fontWeight: 300,
            fontVariationSettings: "'opsz' 72, 'wght' 300",
            color: "#F5F2EC",
            lineHeight: 1.4,
            letterSpacing: "-0.01em",
            minHeight: "2.8em",
          }}
        >
          {displayed}
          <span
            style={{
              color: "#32DE8A",
              opacity: showCursor ? 1 : 0,
              transition: "opacity 0.08s",
            }}
          >
            |
          </span>
        </p>

        {/* Attribution — fades in once typing is complete */}
        <div
          style={{
            marginTop: "2.5rem",
            opacity: done ? 1 : 0,
            transition: "opacity 1.4s ease",
          }}
        >
          <p
            style={{
              fontFamily: "'MontaguSlab', Georgia, serif",
              fontSize: "clamp(0.85rem, 1.8vw, 1rem)",
              fontWeight: 700,
              fontVariationSettings: "'opsz' 36, 'wght' 700",
              color: "#32DE8A",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Elon Musk
          </p>
          <p
            style={{
              fontFamily: "'MontaguSlab', Georgia, serif",
              fontSize: "clamp(0.65rem, 2vw, 0.75rem)",
              fontWeight: 400,
              fontVariationSettings: "'opsz' 24, 'wght' 400",
              color: "#A2E8DD",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginTop: "0.5rem",
            }}
          >
            Entrepreneur&nbsp;&nbsp;&mdash;&nbsp;&nbsp;SpaceX founder&nbsp;&nbsp;&mdash;&nbsp;&nbsp;CEO of Tesla Motors&nbsp;&nbsp;&mdash;&nbsp;&nbsp;Billionaire
          </p>
        </div>
      </div>
    </section>
  )
}

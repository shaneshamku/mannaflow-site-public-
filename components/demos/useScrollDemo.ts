"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Scripted demo driver: starts when the element scrolls into view,
 * advances one step per entry in `delays` (ms), pauses, then loops.
 *
 * `step` = number of steps currently revealed (0..delays.length).
 * `cycle` = completed loop count (lets demos vary content per pass).
 *
 * Designed to be swappable for a "live" driver later (Retell web call /
 * real chat endpoint) — demos render purely from `step`, so a live driver
 * only needs to feed the same state shape.
 *
 * prefers-reduced-motion: jumps straight to the final frame, no loop.
 */
export function useScrollDemo(delays: number[], loopPauseMs = 6000) {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [step, setStep] = useState(0)
  const [cycle, setCycle] = useState(0)
  const total = delays.length

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true)
      setStep(total)
      return
    }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [total])

  useEffect(() => {
    if (!started || reduced) return
    if (step < total) {
      const t = setTimeout(() => setStep((s) => s + 1), delays[step])
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setStep(0)
      setCycle((c) => c + 1)
    }, loopPauseMs)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, reduced, step, total, loopPauseMs])

  return { ref, step, cycle, done: step >= total }
}

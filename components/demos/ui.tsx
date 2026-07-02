"use client"

import { CSSProperties, ReactNode } from "react"

/* Shared visual language for the product demos: realistic dark device
 * panels sitting on the site's cream background. System fonts inside the
 * panels (they mimic real phone / chat UI), MontaguSlab stays outside. */

export const UI_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif"

export const panel = {
  bg: "#14181B",
  surface: "#1E2429",
  surfaceRaised: "#262D33",
  border: "#2C343B",
  text: "#E8ECEF",
  textDim: "#8A959E",
  green: "#32DE8A",
  greenDark: "rgba(50, 222, 138, 0.14)",
  red: "#FF5D5D",
  blue: "#0A84FF",
  smsGreen: "#34C759",
}

export function DemoPanel({
  children,
  height,
  ariaLabel,
  padding = "1rem",
  background = panel.bg,
}: {
  children: ReactNode
  /* Fixed height so the panel never grows/shrinks as messages animate in */
  height: number
  ariaLabel?: string
  padding?: string
  background?: string
}) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{
        backgroundColor: background,
        border: `1px solid ${panel.border}`,
        borderRadius: "14px",
        padding,
        height,
        fontFamily: UI_FONT,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 12px 32px rgba(20, 24, 27, 0.18)",
      }}
    >
      {children}
    </div>
  )
}

export function Reveal({
  on,
  children,
  style,
}: {
  on: boolean
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <div
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function TypingDots({ color = panel.textDim }: { color?: string }) {
  return (
    <span style={{ display: "inline-flex", gap: "4px", padding: "2px 0" }}>
      <span className="mf-typing-dot" style={{ backgroundColor: color }} />
      <span className="mf-typing-dot" style={{ backgroundColor: color }} />
      <span className="mf-typing-dot" style={{ backgroundColor: color }} />
    </span>
  )
}

export function Waveform({ height = 14 }: { height?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-flex", gap: "2.5px", alignItems: "center", height }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="mf-wave-bar"
          style={{ height, backgroundColor: panel.green }}
        />
      ))}
    </span>
  )
}

export function LiveBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        color: panel.green,
        fontSize: "0.65rem",
        fontWeight: 700,
        letterSpacing: "0.14em",
      }}
    >
      <span
        className="mf-pulse"
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          backgroundColor: panel.green,
          display: "inline-block",
        }}
      />
      LIVE
    </span>
  )
}

export function ConfirmBar({ on, label, detail }: { on: boolean; label: string; detail: string }) {
  return (
    <Reveal on={on} style={{ marginTop: "auto", paddingTop: "0.75rem" }}>
      <div
        style={{
          backgroundColor: panel.greenDark,
          border: `1px solid rgba(50, 222, 138, 0.35)`,
          borderRadius: "10px",
          padding: "0.65rem 0.85rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            color: panel.green,
            fontSize: "0.8rem",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="#32DE8A" strokeWidth="1.5" />
            <path
              d="M5 8.2l2 2 4-4.4"
              stroke="#32DE8A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {label}
        </span>
        <span style={{ color: panel.text, fontSize: "0.75rem", fontWeight: 600 }}>{detail}</span>
      </div>
    </Reveal>
  )
}

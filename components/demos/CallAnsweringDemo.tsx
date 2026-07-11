"use client"

import { useScrollDemo } from "./useScrollDemo"
import { ConfirmBar, DemoPanel, LiveBadge, Reveal, Waveform, panel } from "./ui"

const LINES = [
  { from: "Caller", text: "My furnace just died and it's freezing tonight." },
  {
    from: "MannaFlow",
    text: "Sorry to hear that, let's get you help. Is anyone in the home without heat right now?",
  },
  { from: "Caller", text: "Yeah, us and the kids." },
  {
    from: "MannaFlow",
    text: "That's priority. I have 7:30 or 10:00 tomorrow morning, which works?",
  },
  { from: "Caller", text: "7:30, please." },
  {
    from: "MannaFlow",
    text: "Done, you're booked for 7:30 AM. Confirmation text on its way.",
  },
]

//        banner  live  ...6 transcript lines...                 confirm
const DELAYS = [486, 891, 1134, 1539, 1296, 1620, 1215, 1539, 972]

export default function CallAnsweringDemo() {
  const { ref, step } = useScrollDemo(DELAYS)

  return (
    <div ref={ref}>
      <DemoPanel height={620} ariaLabel="Demo: an after-hours call is answered and booked as an appointment">
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "0.7rem",
            borderBottom: `1px solid ${panel.border}`,
          }}
        >
          <span style={{ color: panel.textDim, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Incoming line
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
            {step >= 2 && <LiveBadge />}
            {step >= 2 && <Waveform />}
          </span>
        </div>

        {/* Incoming call banner */}
        <Reveal on={step >= 1} style={{ paddingTop: "0.7rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.55rem",
              backgroundColor: panel.surface,
              border: `1px solid ${panel.border}`,
              borderRadius: "9px",
              padding: "0.5rem 0.75rem",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M2 3.5C2 9.3 6.7 14 12.5 14l1.5-2.5-3-2-1.5 1.5A9.5 9.5 0 015 6.5L6.5 5l-2-3L2 3.5z"
                fill={panel.green}
              />
            </svg>
            <span style={{ color: panel.text, fontSize: "0.78rem", fontWeight: 600 }}>
              Incoming call · 9:42 PM
            </span>
            <span style={{ color: panel.textDim, fontSize: "0.72rem", marginLeft: "auto" }}>
              After hours
            </span>
          </div>
        </Reveal>

        {/* Answering note */}
        <Reveal on={step >= 2} style={{ paddingTop: "0.55rem" }}>
          <span style={{ color: panel.textDim, fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            MannaFlow answered · Live transcript
          </span>
        </Reveal>

        {/* Transcript */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", paddingTop: "0.55rem" }}>
          {LINES.map((line, i) => (
            <Reveal key={i} on={step >= 3 + i}>
              <div
                style={{
                  backgroundColor: line.from === "MannaFlow" ? panel.surfaceRaised : panel.surface,
                  border: `1px solid ${panel.border}`,
                  borderRadius: "9px",
                  padding: "0.5rem 0.7rem",
                  fontSize: "0.78rem",
                  lineHeight: 1.45,
                  color: panel.text,
                }}
              >
                <span
                  style={{
                    color: line.from === "MannaFlow" ? panel.green : panel.textDim,
                    fontWeight: 600,
                  }}
                >
                  {line.from}:
                </span>{" "}
                {line.text}
              </div>
            </Reveal>
          ))}
        </div>

        <ConfirmBar on={step >= 9} label="Appointment confirmed" detail="Tomorrow · 7:30 AM" />
      </DemoPanel>
    </div>
  )
}

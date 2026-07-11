"use client"

import { useScrollDemo } from "./useScrollDemo"
import { ConfirmBar, DemoPanel, Reveal, panel } from "./ui"

const SEASONS = [
  {
    month: "March",
    tag: "Spring AC season",
    icon: "☀",
    customer: "Mike D. · AC install · 2 years ago",
    msg: "Hi Mike, it's ABC Heating & Air. Spring tune-up season is here. Want your usual slot before the rush?",
    reply: "Good timing, yes, book me in.",
    detail: "Tuesday · 10:00 AM",
  },
  {
    month: "October",
    tag: "Furnace season",
    icon: "❄",
    customer: "Sarah K. · Furnace repair · Last fall",
    msg: "Hi Sarah, it's ABC Heating & Air. Cold nights are coming. Should we get your furnace checked before the first freeze?",
    reply: "Yes please, sometime next week?",
    detail: "Monday · 1:00 PM",
  },
]

//              month customer  msg  reply confirm counter
const DELAYS = [567, 1134, 1620, 1620, 1134, 972]

export default function WinBackDemo() {
  const { ref, step, cycle } = useScrollDemo(DELAYS)
  const s = SEASONS[cycle % SEASONS.length]

  return (
    <div ref={ref}>
      <DemoPanel height={620} ariaLabel="Demo: a past customer gets a seasonal check-in text and books another job">
        {/* Calendar header */}
        <Reveal on={step >= 1}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: panel.surface,
              border: `1px solid ${panel.border}`,
              borderRadius: "9px",
              padding: "0.55rem 0.75rem",
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <span aria-hidden="true" style={{ fontSize: "0.9rem" }}>{s.icon}</span>
              <span
                style={{
                  color: panel.text,
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {s.month}
              </span>
            </span>
            <span style={{ color: panel.green, fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {s.tag}
            </span>
          </div>
        </Reveal>

        {/* Past customer card */}
        <Reveal on={step >= 2} style={{ paddingTop: "0.6rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              backgroundColor: panel.surfaceRaised,
              border: `1px solid ${panel.border}`,
              borderRadius: "9px",
              padding: "0.55rem 0.75rem",
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: panel.surface,
                color: panel.green,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.62rem",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {s.customer.slice(0, 1)}
              {s.customer.split(" ")[1]?.slice(0, 1)}
            </span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: panel.text, fontSize: "0.75rem", fontWeight: 600 }}>
                {s.customer}
              </span>
              <span style={{ color: panel.textDim, fontSize: "0.64rem" }}>
                Past customer · Hasn&apos;t called yet this season
              </span>
            </div>
          </div>
        </Reveal>

        {/* Outbound + reply */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.7rem" }}>
          <Reveal on={step >= 3}>
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  maxWidth: "88%",
                  backgroundColor: panel.surfaceRaised,
                  color: panel.text,
                  borderRadius: "13px 13px 13px 4px",
                  padding: "0.5rem 0.7rem",
                  fontSize: "0.76rem",
                  lineHeight: 1.45,
                }}
              >
                {s.msg}
              </div>
            </div>
          </Reveal>
          <Reveal on={step >= 4}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  maxWidth: "82%",
                  backgroundColor: panel.smsGreen,
                  color: "#FFFFFF",
                  borderRadius: "13px 13px 4px 13px",
                  padding: "0.5rem 0.7rem",
                  fontSize: "0.76rem",
                  lineHeight: 1.45,
                }}
              >
                {s.reply}
              </div>
            </div>
          </Reveal>
        </div>

        <ConfirmBar on={step >= 5} label="Job booked" detail={s.detail} />

        {/* Counter */}
        <Reveal on={step >= 6} style={{ paddingTop: "0.6rem" }}>
          <div style={{ textAlign: "center" }}>
            <span style={{ color: panel.green, fontSize: "0.82rem", fontWeight: 700 }}>
              +3 jobs this week
            </span>{" "}
            <span style={{ color: panel.textDim, fontSize: "0.72rem" }}>
              from customers you already won
            </span>
          </div>
        </Reveal>
      </DemoPanel>
    </div>
  )
}

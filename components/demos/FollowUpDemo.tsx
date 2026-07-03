"use client"

import { ReactNode } from "react"
import { useScrollDemo } from "./useScrollDemo"
import { ConfirmBar, DemoPanel, Reveal, panel } from "./ui"

//              header day1  day3  day7  reply booked confirm day14
const DELAYS = [700, 1700, 1900, 1900, 1800, 1700, 1200, 1300]

function DayRow({
  day,
  on,
  dim,
  children,
}: {
  day: string
  on: boolean
  dim?: boolean
  children: ReactNode
}) {
  return (
    <Reveal on={on}>
      <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
        <span
          style={{
            flexShrink: 0,
            width: 46,
            textAlign: "center",
            backgroundColor: dim ? panel.surface : panel.surfaceRaised,
            border: `1px solid ${panel.border}`,
            borderRadius: "6px",
            padding: "0.28rem 0",
            fontSize: "0.58rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: dim ? panel.textDim : panel.green,
          }}
        >
          {day}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
    </Reveal>
  )
}

function OutMsg({ text, status }: { text: string; status: string }) {
  return (
    <div>
      <div
        style={{
          backgroundColor: panel.surfaceRaised,
          borderRadius: "9px",
          padding: "0.45rem 0.65rem",
          fontSize: "0.74rem",
          lineHeight: 1.45,
          color: panel.text,
        }}
      >
        {text}
      </div>
      <span style={{ color: panel.textDim, fontSize: "0.62rem", paddingLeft: "0.2rem" }}>
        {status}
      </span>
    </div>
  )
}

export default function FollowUpDemo() {
  const { ref, step } = useScrollDemo(DELAYS)

  return (
    <div ref={ref}>
      <DemoPanel height={620} ariaLabel="Demo: timed follow-up texts on day 1, 3 and 7 turn a quiet lead into a booked job">
        {/* Lead header */}
        <Reveal on={step >= 1}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
              backgroundColor: panel.surface,
              border: `1px solid ${panel.border}`,
              borderRadius: "9px",
              padding: "0.55rem 0.75rem",
            }}
          >
            <span style={{ color: panel.text, fontSize: "0.76rem", fontWeight: 600 }}>
              Mike D. · AC replacement quote sent
            </span>
            <span
              style={{
                flexShrink: 0,
                color: panel.red,
                fontSize: "0.64rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Didn&apos;t book
            </span>
          </div>
        </Reveal>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", paddingTop: "0.7rem" }}>
          <DayRow day="DAY 1" on={step >= 2}>
            <OutMsg
              text="Hi Mike, following up on your AC quote. Happy to answer any questions."
              status="Delivered · No reply"
            />
          </DayRow>

          <DayRow day="DAY 3" on={step >= 3}>
            <OutMsg
              text="Still happy to get you on the schedule this week if the timing works."
              status="Delivered · No reply"
            />
          </DayRow>

          <DayRow day="DAY 7" on={step >= 4}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              <OutMsg
                text="Quick check-in: want me to hold a spot before the weekend heat wave?"
                status="Delivered"
              />
              <Reveal on={step >= 5}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div
                    style={{
                      maxWidth: "88%",
                      backgroundColor: panel.smsGreen,
                      color: "#FFFFFF",
                      borderRadius: "13px 13px 4px 13px",
                      padding: "0.45rem 0.65rem",
                      fontSize: "0.74rem",
                      lineHeight: 1.45,
                    }}
                  >
                    Actually yes, can you do Friday?
                  </div>
                </div>
              </Reveal>
              <Reveal on={step >= 6}>
                <OutMsg text="Friday 9:00 AM is open, you're in." status="Delivered" />
              </Reveal>
            </div>
          </DayRow>

          <DayRow day="DAY 14" on={step >= 8} dim>
            <span style={{ color: panel.textDim, fontSize: "0.72rem", lineHeight: 1.5 }}>
              Not needed, booked on Day 7. Follow-up stops the moment they book or say no.
            </span>
          </DayRow>
        </div>

        <ConfirmBar on={step >= 7} label="Job booked" detail="Friday · 9:00 AM" />
      </DemoPanel>
    </div>
  )
}

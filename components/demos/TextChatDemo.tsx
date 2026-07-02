"use client"

import { useState } from "react"
import { useScrollDemo } from "./useScrollDemo"
import { ConfirmBar, DemoPanel, Reveal, TypingDots, panel } from "./ui"

type Event =
  | { type: "msg"; from: "lead" | "bot"; text: string }
  | { type: "typing" }

const EVENTS: Event[] = [
  { type: "msg", from: "lead", text: "Hey — do you guys do AC repair in Waterloo?" },
  { type: "typing" },
  { type: "msg", from: "bot", text: "We do! Is your AC not cooling, or is this for a tune-up?" },
  { type: "msg", from: "lead", text: "Not cooling since yesterday." },
  { type: "typing" },
  { type: "msg", from: "bot", text: "Got it — I can have a tech out tomorrow. 1:00 or 4:30?" },
  { type: "msg", from: "lead", text: "4:30 works." },
  { type: "typing" },
  { type: "msg", from: "bot", text: "You're booked for tomorrow at 4:30 PM ✓ Confirmation coming now." },
]

//              lead  typ   bot   lead  typ   bot   lead  typ   bot  confirm
const DELAYS = [700, 1100, 1800, 2100, 1100, 1900, 2000, 1100, 1900, 1100]

function Messages({ step, web }: { step: number; web: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
      {EVENTS.map((ev, i) => {
        const revealed = step >= i + 1
        if (ev.type === "typing") {
          const isLatest = revealed && step === i + 1
          return (
            <Reveal key={i} on={isLatest} style={{ height: isLatest ? "auto" : 0, overflow: "hidden" }}>
              <div
                style={{
                  backgroundColor: web ? "#EDEFF1" : panel.surface,
                  borderRadius: "13px",
                  padding: "0.45rem 0.75rem",
                  width: "fit-content",
                }}
              >
                <TypingDots color={web ? "#9AA4AC" : undefined} />
              </div>
            </Reveal>
          )
        }
        const fromLead = ev.from === "lead"
        return (
          <Reveal key={i} on={revealed}>
            <div style={{ display: "flex", justifyContent: fromLead ? "flex-end" : "flex-start" }}>
              <div
                style={{
                  maxWidth: "82%",
                  borderRadius: fromLead ? "13px 13px 4px 13px" : "13px 13px 13px 4px",
                  padding: "0.5rem 0.75rem",
                  fontSize: "0.78rem",
                  lineHeight: 1.45,
                  backgroundColor: fromLead
                    ? web
                      ? "#35524A"
                      : panel.blue
                    : web
                      ? "#FFFFFF"
                      : panel.surfaceRaised,
                  border: web && !fromLead ? "1px solid #E2E5E8" : "none",
                  color: fromLead ? "#FFFFFF" : web ? "#2A3238" : panel.text,
                }}
              >
                {ev.text}
              </div>
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}

export default function TextChatDemo() {
  const { ref, step } = useScrollDemo(DELAYS)
  const [channel, setChannel] = useState<"sms" | "web">("sms")
  const isWeb = channel === "web"

  return (
    <div ref={ref}>
      <DemoPanel
        height={620}
        ariaLabel="Demo: the same AI assistant books a job over text message and over website chat"
      >
        {/* Channel toggle */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            backgroundColor: panel.surface,
            borderRadius: "9px",
            padding: "3px",
          }}
        >
          {(
            [
              ["sms", "Text message"],
              ["web", "Website chat"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setChannel(key)}
              style={{
                flex: 1,
                border: channel === key ? `1px solid ${panel.green}` : "1px solid transparent",
                borderRadius: "7px",
                padding: "0.4rem 0.5rem",
                fontSize: "0.72rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                backgroundColor: channel === key ? panel.surfaceRaised : "transparent",
                color: channel === key ? panel.text : panel.textDim,
                transition: "background-color 0.15s ease, color 0.15s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <p
          style={{
            margin: 0,
            padding: "0.4rem 0 0.7rem",
            textAlign: "center",
            color: panel.textDim,
            fontSize: "0.68rem",
          }}
        >
          Click <span style={{ color: panel.green, fontWeight: 600 }}>Text message</span> or{" "}
          <span style={{ color: panel.green, fontWeight: 600 }}>Website chat</span> — same
          assistant, both channels.
        </p>

        {isWeb ? (
          /* Website chatbot widget: its own header, message area, and input box */
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#F7F8F9",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)",
            }}
          >
            <div
              style={{
                backgroundColor: "#35524A",
                padding: "0.6rem 0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.55rem",
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  backgroundColor: "#32DE8A",
                  color: "#35524A",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                AH
              </span>
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                <span style={{ color: "#FFFFFF", fontSize: "0.76rem", fontWeight: 600 }}>
                  ABC Heating &amp; Air
                </span>
                <span style={{ color: "#A2E8DD", fontSize: "0.64rem" }}>
                  Online · replies in seconds
                </span>
              </div>
              <span aria-hidden="true" style={{ color: "#A2E8DD", fontSize: "0.85rem", letterSpacing: "0.3em" }}>
                — ✕
              </span>
            </div>

            <div style={{ flex: 1, minHeight: 0, padding: "0.75rem", overflow: "hidden" }}>
              <Messages step={step} web />
            </div>

            <div
              style={{
                borderTop: "1px solid #E2E5E8",
                backgroundColor: "#FFFFFF",
                padding: "0.55rem 0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span style={{ flex: 1, color: "#9AA4AC", fontSize: "0.74rem" }}>
                Type your message…
              </span>
              <span
                aria-hidden="true"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  backgroundColor: "#32DE8A",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8l12-6-4 12-2.5-4.5L2 8z" fill="#35524A" />
                </svg>
              </span>
            </div>
          </div>
        ) : (
          /* SMS thread */
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.55rem",
                paddingBottom: "0.6rem",
                borderBottom: `1px solid ${panel.border}`,
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  backgroundColor: panel.surfaceRaised,
                  color: panel.green,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                }}
              >
                AH
              </span>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ color: panel.text, fontSize: "0.78rem", fontWeight: 600 }}>
                  ABC Heating &amp; Air
                </span>
                <span style={{ color: panel.textDim, fontSize: "0.66rem" }}>Text message · SMS</span>
              </div>
            </div>
            <div style={{ paddingTop: "0.6rem" }}>
              <Messages step={step} web={false} />
            </div>
          </div>
        )}

        <ConfirmBar on={step >= 10} label="Job booked" detail="Tomorrow · 4:30 PM" />
      </DemoPanel>
    </div>
  )
}

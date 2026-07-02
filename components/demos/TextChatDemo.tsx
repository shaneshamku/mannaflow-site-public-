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

//              lead typ  bot   lead  typ  bot   lead  typ  bot  confirm
const DELAYS = [500, 800, 1300, 1600, 800, 1400, 1500, 800, 1400, 800]

export default function TextChatDemo() {
  const { ref, step } = useScrollDemo(DELAYS)
  const [channel, setChannel] = useState<"sms" | "web">("sms")

  const isSms = channel === "sms"

  return (
    <div ref={ref}>
      <DemoPanel minHeight={430} ariaLabel="Demo: the same AI assistant books a job over text message and over website chat">
        {/* Channel toggle */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            backgroundColor: panel.surface,
            borderRadius: "9px",
            padding: "3px",
            marginBottom: "0.7rem",
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
                border: "none",
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

        {/* Thread header */}
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
            <span style={{ color: panel.textDim, fontSize: "0.66rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: panel.green,
                  display: "inline-block",
                }}
              />
              {isSms ? "Text conversation" : "Replies in seconds"}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", paddingTop: "0.6rem" }}>
          {EVENTS.map((ev, i) => {
            const revealed = step >= i + 1
            if (ev.type === "typing") {
              // Typing bubble only while it's the newest revealed event
              const isLatest = revealed && step === i + 1
              return (
                <Reveal key={i} on={isLatest} style={{ height: isLatest ? "auto" : 0, overflow: "hidden" }}>
                  <div
                    style={{
                      alignSelf: "flex-start",
                      backgroundColor: panel.surface,
                      borderRadius: "13px",
                      padding: "0.45rem 0.75rem",
                      width: "fit-content",
                    }}
                  >
                    <TypingDots />
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
                        ? isSms
                          ? panel.smsGreen
                          : panel.blue
                        : panel.surfaceRaised,
                      color: fromLead ? "#FFFFFF" : panel.text,
                    }}
                  >
                    {ev.text}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        <ConfirmBar on={step >= 10} label="Job booked" detail="Tomorrow · 4:30 PM" />
      </DemoPanel>
    </div>
  )
}

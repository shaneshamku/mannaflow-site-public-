"use client"

import { ReactNode, useState } from "react"
import { useScrollDemo } from "./useScrollDemo"
import { DemoPanel, Reveal, panel } from "./ui"

/* Side-by-side race: the same customer tries to book a job through a
 * typical call center vs. through MannaFlow. One shared step clock drives
 * both panels — the right side finishes while the left is still on hold. */

const DELAYS = [700, 1800, 2000, 2000, 2000, 1800]

const LEFT_TIMER = ["0:00", "0:12", "1:05", "3:26", "6:32", "6:47", "6:47"]
const RIGHT_TIMER = ["0:00", "0:04", "0:09", "0:21", "0:38", "0:38", "0:38"]

const PANEL_HEIGHT = 480

function PanelHeader({
  label,
  timer,
  timerColor,
  children,
}: {
  label: string
  timer: string
  timerColor: string
  children?: ReactNode
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.5rem",
        paddingBottom: "0.6rem",
        borderBottom: `1px solid ${panel.border}`,
      }}
    >
      <span
        style={{
          color: panel.textDim,
          fontSize: "0.66rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
        {children}
        <span
          style={{
            color: timerColor,
            fontSize: "0.78rem",
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {timer}
        </span>
      </span>
    </div>
  )
}

function SystemLine({ on, text, sub }: { on: boolean; text: string; sub?: string }) {
  return (
    <Reveal on={on}>
      <div
        style={{
          backgroundColor: panel.surface,
          border: `1px solid ${panel.border}`,
          borderRadius: "9px",
          padding: "0.5rem 0.7rem",
        }}
      >
        <span style={{ color: panel.text, fontSize: "0.75rem", lineHeight: 1.45, fontStyle: "italic" }}>
          &ldquo;{text}&rdquo;
        </span>
        {sub && (
          <div style={{ color: panel.textDim, fontSize: "0.64rem", paddingTop: "0.2rem" }}>{sub}</div>
        )}
      </div>
    </Reveal>
  )
}

function Bubble({ on, from, children }: { on: boolean; from: "lead" | "bot"; children: ReactNode }) {
  const lead = from === "lead"
  return (
    <Reveal on={on}>
      <div style={{ display: "flex", justifyContent: lead ? "flex-end" : "flex-start" }}>
        <div
          style={{
            maxWidth: "85%",
            borderRadius: lead ? "13px 13px 4px 13px" : "13px 13px 13px 4px",
            padding: "0.5rem 0.7rem",
            fontSize: "0.75rem",
            lineHeight: 1.45,
            backgroundColor: lead ? panel.blue : panel.surfaceRaised,
            color: lead ? "#FFFFFF" : panel.text,
          }}
        >
          {children}
        </div>
      </div>
    </Reveal>
  )
}

function TranscriptLine({ on, from, text }: { on: boolean; from: string; text: string }) {
  const isBot = from === "MannaFlow"
  return (
    <Reveal on={on}>
      <div
        style={{
          backgroundColor: isBot ? panel.surfaceRaised : panel.surface,
          border: `1px solid ${panel.border}`,
          borderRadius: "9px",
          padding: "0.5rem 0.7rem",
          fontSize: "0.75rem",
          lineHeight: 1.45,
          color: panel.text,
        }}
      >
        <span style={{ color: isBot ? panel.green : panel.textDim, fontWeight: 600 }}>{from}:</span>{" "}
        {text}
      </div>
    </Reveal>
  )
}

export default function RaceDemo() {
  const { ref, step } = useScrollDemo(DELAYS)
  const [mode, setMode] = useState<"text" | "voice">("text")

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Typical call center */}
      <DemoPanel
        height={PANEL_HEIGHT}
        ariaLabel="Demo: calling a typical call center — hold music, press-1 menus, and the caller gives up after six minutes"
      >
        <PanelHeader
          label="Typical call center"
          timer={LEFT_TIMER[Math.min(step, 6)]}
          timerColor={step >= 6 ? panel.red : panel.textDim}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.6rem" }}>
          <SystemLine on={step >= 1} text="Thank you for calling. Your call is important to us." sub="Hold music playing…" />
          <SystemLine on={step >= 2} text="Press 1 for service. Press 2 for billing. Press 3 to hear these options again." />
          <SystemLine on={step >= 3} text="You are caller number 7 in the queue." sub="Still holding…" />
          <SystemLine on={step >= 4} text="Your call is important to us. Please continue to hold." sub="Still holding…" />
        </div>
        <Reveal on={step >= 6} style={{ marginTop: "auto", paddingTop: "0.75rem" }}>
          <div
            style={{
              backgroundColor: "rgba(255, 93, 93, 0.1)",
              border: "1px solid rgba(255, 93, 93, 0.35)",
              borderRadius: "10px",
              padding: "0.65rem 0.85rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: panel.red, fontSize: "0.8rem", fontWeight: 600 }}>
              ✕ Caller hung up
            </span>
            <span style={{ color: panel.textDim, fontSize: "0.75rem", fontWeight: 600 }}>
              Lead lost
            </span>
          </div>
        </Reveal>
      </DemoPanel>

      {/* MannaFlow */}
      <DemoPanel
        height={PANEL_HEIGHT}
        ariaLabel="Demo: the same customer reaches a MannaFlow business by text or voice and has an appointment booked in 38 seconds"
      >
        <PanelHeader
          label="With MannaFlow"
          timer={RIGHT_TIMER[Math.min(step, 6)]}
          timerColor={step >= 4 ? panel.green : panel.textDim}
        >
          <span
            style={{
              display: "inline-flex",
              gap: "3px",
              backgroundColor: panel.surface,
              borderRadius: "7px",
              padding: "2px",
            }}
          >
            {(
              [
                ["text", "Text"],
                ["voice", "Voice"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                style={{
                  border: mode === key ? `1px solid ${panel.green}` : "1px solid transparent",
                  borderRadius: "5px",
                  padding: "0.2rem 0.55rem",
                  fontSize: "0.64rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  backgroundColor: mode === key ? panel.surfaceRaised : "transparent",
                  color: mode === key ? panel.text : panel.textDim,
                  transition: "background-color 0.15s ease, color 0.15s ease",
                }}
              >
                {label}
              </button>
            ))}
          </span>
        </PanelHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.6rem" }}>
          {mode === "text" ? (
            <>
              <Bubble on={step >= 1} from="lead">
                My AC quit — can someone come out?
              </Bubble>
              <Bubble on={step >= 2} from="bot">
                Sorry about the heat — we can help. Is tomorrow 1:00 or 4:30 better?
              </Bubble>
              <Bubble on={step >= 3} from="lead">
                4:30.
              </Bubble>
            </>
          ) : (
            <>
              <Reveal on={step >= 1}>
                <span
                  style={{
                    color: panel.textDim,
                    fontSize: "0.66rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Answered on the first ring · Live transcript
                </span>
              </Reveal>
              <TranscriptLine on={step >= 1} from="Caller" text="My AC quit — can someone come out?" />
              <TranscriptLine
                on={step >= 2}
                from="MannaFlow"
                text="Sorry about the heat — we can help. Is tomorrow 1:00 or 4:30 better?"
              />
              <TranscriptLine on={step >= 3} from="Caller" text="4:30 works." />
            </>
          )}
        </div>
        <Reveal on={step >= 4} style={{ marginTop: "auto", paddingTop: "0.75rem" }}>
          <div
            style={{
              backgroundColor: panel.greenDark,
              border: "1px solid rgba(50, 222, 138, 0.35)",
              borderRadius: "10px",
              padding: "0.65rem 0.85rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: panel.green, fontSize: "0.8rem", fontWeight: 600 }}>
              ✓ Job booked in 38 seconds
            </span>
            <span style={{ color: panel.text, fontSize: "0.75rem", fontWeight: 600 }}>
              Tomorrow · 4:30 PM
            </span>
          </div>
        </Reveal>
      </DemoPanel>
    </div>
  )
}

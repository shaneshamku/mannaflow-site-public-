"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { RetellWebClient } from "retell-client-js-sdk"
import { panel, LiveBadge, Waveform, Reveal } from "./ui"

const ACCENT = "#5FB187"

type CallState = "idle" | "connecting" | "active" | "ended" | "error"

type TranscriptLine = { role: "agent" | "user"; content: string }

export default function VoiceDemoWidget() {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<CallState>("idle")
  const [muted, setMuted] = useState(false)
  const [lines, setLines] = useState<TranscriptLine[]>([])
  const clientRef = useRef<RetellWebClient | null>(null)
  const transcriptEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [lines])

  useEffect(() => {
    return () => {
      clientRef.current?.stopCall()
    }
  }, [])

  async function startCall() {
    setState("connecting")
    setLines([])
    try {
      const res = await fetch("/api/demo-call", { method: "POST" })
      if (!res.ok) throw new Error("Could not start call")
      const { accessToken } = await res.json()

      const client = new RetellWebClient()
      clientRef.current = client

      client.on("call_started", () => setState("active"))
      client.on("call_ended", () => setState("ended"))
      client.on("error", () => setState("error"))
      client.on("update", (update: { transcript?: TranscriptLine[] }) => {
        if (update.transcript) setLines(update.transcript)
      })

      await client.startCall({ accessToken })
    } catch {
      setState("error")
    }
  }

  function endCall() {
    clientRef.current?.stopCall()
    setState("ended")
  }

  function toggleMute() {
    if (!clientRef.current) return
    if (muted) clientRef.current.unmute()
    else clientRef.current.mute()
    setMuted((m) => !m)
  }

  function closeModal() {
    clientRef.current?.stopCall()
    setOpen(false)
    setState("idle")
    setMuted(false)
  }

  return (
    <>
      {/* Trigger card */}
      <button
        id="maddie-demo"
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Talk to Maddie, our receptionist — opens a live voice demo"
        className="mf-maddie-trigger"
        style={{
          border: "1px solid #DDD5C6",
          backgroundColor: "#FFFFFF",
          cursor: "pointer",
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(3, 29, 42, 0.06)",
        }}
      >
        <span
          aria-hidden
          className="mf-maddie-orb"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${ACCENT}, #2E7D57)`,
          }}
        >
          <span className="mf-voice-orb-pulse" style={{ borderColor: ACCENT }} />
          <svg className="mf-maddie-orb-icon" viewBox="0 0 16 16" fill="none">
            <path d="M5 3.5v9l8-4.5-8-4.5z" fill="#F5F2EC" />
          </svg>
        </span>
        <span>
          <span className="mf-maddie-eyebrow" style={{ color: ACCENT }}>
            Live demo
          </span>
          <span className="mf-maddie-title">
            Talk to Maddie, our receptionist
          </span>
        </span>
      </button>

      {/* Full-screen mobile sheet */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Talk to Maddie demo"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(3, 29, 42, 0.55)",
            display: "flex",
            alignItems: "flex-end",
          }}
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              backgroundColor: panel.bg,
              borderRadius: "20px 20px 0 0",
              paddingBottom: "env(safe-area-inset-bottom)",
              boxShadow: "0 -12px 40px rgba(0,0,0,0.35)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem 1.1rem 0.8rem",
                borderBottom: `1px solid ${panel.border}`,
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ color: panel.text, fontSize: "0.9rem", fontWeight: 700 }}>
                  Maddie · Live demo
                </span>
                {state === "active" && <LiveBadge />}
                {state === "active" && <Waveform />}
              </span>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close demo"
                style={{
                  color: panel.textDim,
                  background: "none",
                  border: "none",
                  fontSize: "1.3rem",
                  lineHeight: 1,
                  padding: "0.3rem",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem 1.1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                minHeight: "220px",
              }}
            >
              {state === "idle" && (
                <p style={{ color: panel.textDim, fontSize: "0.85rem", margin: "auto", textAlign: "center" }}>
                  Tap below to call Maddie — a live AI receptionist you can
                  actually talk to. Uses your microphone.
                </p>
              )}
              {state === "connecting" && (
                <p style={{ color: panel.textDim, fontSize: "0.85rem", margin: "auto", textAlign: "center" }}>
                  Connecting…
                </p>
              )}
              {state === "error" && (
                <p style={{ color: "#FF8A8A", fontSize: "0.85rem", margin: "auto", textAlign: "center" }}>
                  Couldn&apos;t connect. Please try again in a moment.
                </p>
              )}
              {(state === "active" || state === "ended") &&
                lines.map((line, i) => (
                  <Reveal key={i} on style={{ alignSelf: line.role === "user" ? "flex-end" : "flex-start" }}>
                    <div
                      style={{
                        maxWidth: "85%",
                        backgroundColor: line.role === "agent" ? panel.surfaceRaised : panel.surface,
                        border: `1px solid ${panel.border}`,
                        borderRadius: "9px",
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.82rem",
                        lineHeight: 1.45,
                        color: panel.text,
                      }}
                    >
                      <span style={{ color: line.role === "agent" ? panel.green : panel.textDim, fontWeight: 600 }}>
                        {line.role === "agent" ? "Maddie" : "You"}:
                      </span>{" "}
                      {line.content}
                    </div>
                  </Reveal>
                ))}
              {state === "ended" && (
                <p style={{ color: panel.textDim, fontSize: "0.8rem", textAlign: "center", paddingTop: "0.5rem" }}>
                  Call ended — thanks for trying Maddie.
                </p>
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Footer controls */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.9rem",
                padding: "1rem 1.1rem 1.3rem",
              }}
            >
              {state === "idle" || state === "error" ? (
                <button type="button" onClick={startCall} style={callBtnStyle(ACCENT)}>
                  <PhoneIcon /> Start call
                </button>
              ) : state === "connecting" ? (
                <button type="button" disabled style={callBtnStyle(panel.textDim)}>
                  Connecting…
                </button>
              ) : state === "active" ? (
                <>
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-pressed={muted}
                    style={roundBtnStyle(muted ? "#5B6660" : panel.surfaceRaised)}
                    aria-label={muted ? "Unmute microphone" : "Mute microphone"}
                  >
                    <MicIcon muted={muted} />
                  </button>
                  <button
                    type="button"
                    onClick={endCall}
                    aria-label="End call"
                    style={roundBtnStyle(panel.red)}
                  >
                    <EndCallIcon />
                  </button>
                </>
              ) : (
                <button type="button" onClick={startCall} style={callBtnStyle(ACCENT)}>
                  <PhoneIcon /> Try again
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function callBtnStyle(bg: string): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: bg,
    color: "#0E1113",
    border: "none",
    borderRadius: "999px",
    padding: "0.75rem 1.4rem",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
  }
}

function roundBtnStyle(bg: string): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    backgroundColor: bg,
    border: "none",
    cursor: "pointer",
    color: "#F5F2EC",
  }
}

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path
      d="M2 3.5C2 9.3 6.7 14 12.5 14l1.5-2.5-3-2-1.5 1.5A9.5 9.5 0 015 6.5L6.5 5l-2-3L2 3.5z"
      fill="#0E1113"
    />
  </svg>
)

const EndCallIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M3 14.5c5-4 13-4 18 0l-1 3.2c-.2.7-1 1.1-1.7.8l-2.9-1.2a1.3 1.3 0 01-.8-1.3l.2-1.6a10 10 0 00-7.6 0l.2 1.6a1.3 1.3 0 01-.8 1.3l-2.9 1.2c-.7.3-1.5-.1-1.7-.8L3 14.5z"
      fill="#F5F2EC"
    />
  </svg>
)

const MicIcon = ({ muted }: { muted: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="9" y="3" width="6" height="11" rx="3" stroke="#F5F2EC" strokeWidth="1.6" />
    <path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21" stroke="#F5F2EC" strokeWidth="1.6" strokeLinecap="round" />
    {muted && <path d="M4 4l16 16" stroke="#F5F2EC" strokeWidth="1.6" strokeLinecap="round" />}
  </svg>
)

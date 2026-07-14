"use client";

import { useRef, useState, type ReactNode, type PointerEvent } from "react";

const ACCENT = "#5FB187";

const PhoneIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M6.5 3.5c.5 0 .95.32 1.1.8l.9 2.8a1.2 1.2 0 0 1-.3 1.2L7 9.5c.9 2 2.5 3.6 4.5 4.5l1.2-1.2a1.2 1.2 0 0 1 1.2-.3l2.8.9c.48.15.8.6.8 1.1V17a2.5 2.5 0 0 1-2.7 2.5C9.2 19 5 14.8 4 8.2A2.5 2.5 0 0 1 6.5 3.5Z"
      stroke={ACCENT}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

const ChatIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M4 5.5h16v11H9l-5 3.5v-3.5H4z"
      stroke={ACCENT}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 11h.01M12 11h.01M15.5 11h.01"
      stroke={ACCENT}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const RefreshIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M4.5 9a7.5 7.5 0 0 1 12.7-3.2L20 8.5M19.5 15a7.5 7.5 0 0 1-12.7 3.2L4 15.5"
      stroke={ACCENT}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 4.5v4h-4M4 19.5v-4h4"
      stroke={ACCENT}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChartIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 20h16" stroke={ACCENT} strokeWidth="1.4" strokeLinecap="round" />
    <rect x="5.5" y="12" width="3" height="5" rx="0.6" stroke={ACCENT} strokeWidth="1.4" />
    <rect x="10.5" y="8" width="3" height="9" rx="0.6" stroke={ACCENT} strokeWidth="1.4" />
    <rect x="15.5" y="4.5" width="3" height="12.5" rx="0.6" stroke={ACCENT} strokeWidth="1.4" />
  </svg>
);

const WinBackIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M4.5 12a7.5 7.5 0 1 1 2.2 5.3"
      stroke={ACCENT}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 8v4h4"
      stroke={ACCENT}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15.2c-1.7-1.1-3-2.2-3-3.6a1.6 1.6 0 0 1 3-.7 1.6 1.6 0 0 1 3 .7c0 1.4-1.3 2.5-3 3.6Z"
      stroke={ACCENT}
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
  </svg>
);

type Card = {
  icon: ReactNode;
  title: string;
  body: string;
  demoId?: string;
};

const cards: Card[] = [
  {
    icon: <PhoneIcon />,
    title: "Call Coverage",
    body: "Ensures every caller gets an answer, even when your team is busy, after hours, or away from the phone.",
    demoId: "voice-agent",
  },
  {
    icon: <ChatIcon />,
    title: "Text & Website Booking",
    body: "Qualifies new leads, answers common questions, and helps move interested customers toward booking an appointment.",
    demoId: "chatbot",
  },
  {
    icon: <RefreshIcon />,
    title: "Follow-Up Campaigns",
    body: "Keeps warm leads from going cold with timely follow-ups at every stage of the booking journey.",
    demoId: "nurture-campaign",
  },
  {
    icon: <WinBackIcon />,
    title: "Win-Back Campaigns",
    body: "Re-engages past customers with timely reminders, seasonal outreach, and service offers that bring them back.",
    demoId: "nurture-winback",
  },
  {
    icon: <ChartIcon />,
    title: "Lead Dashboard",
    body: "Keeps every lead, conversation, and next step organized in one place.",
  },
];

const n = cards.length;

function posClass(off: number) {
  if (off === 0) return "is-active";
  if (off === 1) return "is-next";
  if (off === -1) return "is-prev";
  return "is-far";
}

export default function HowWeHelp() {
  const [active, setActive] = useState(0);
  const startX = useRef<number | null>(null);

  const go = (dir: number) => setActive((a) => (a + dir + n) % n);

  function relative(i: number) {
    let off = i - active;
    if (off > n / 2) off -= n;
    else if (off < -n / 2) off += n;
    return off;
  }

  function onPointerDown(e: PointerEvent) {
    startX.current = e.clientX;
  }
  function onPointerUp(e: PointerEvent) {
    if (startX.current == null) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
    startX.current = null;
  }

  return (
    <section id="how-it-works" className="mf-hwh py-14 md:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <p className="mf-hwh-eyebrow">How We Help</p>
        <h2 className="mf-hwh-headline">
          The repetitive lead work we handle for you
        </h2>
        <p className="mf-hwh-sub">
          MannaFlow keeps calls, messages, follow-ups, and the customer journey
          moving while your team stays on the job.
        </p>
      </div>

      <div className="mf-hwh-carousel">
        <button
          type="button"
          className="mf-hwh-arrow mf-hwh-arrow--prev"
          onClick={() => go(-1)}
          aria-label="Previous capability"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          className="mf-hwh-stage"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {cards.map((c, i) => {
            const off = relative(i);
            return (
              <article
                key={c.title}
                className={`mf-hwh-card ${posClass(off)}`}
                aria-hidden={off !== 0}
              >
                <span className="mf-hwh-icon">{c.icon}</span>
                <h3 className="mf-hwh-card-title">{c.title}</h3>
                <span aria-hidden className="mf-hwh-card-dash" />
                <p className="mf-hwh-card-body">{c.body}</p>
                <a
                  href={c.demoId ? `/demo#${c.demoId}` : "/demo"}
                  className="mf-hwh-card-cta"
                  tabIndex={off === 0 ? 0 : -1}
                >
                  See Demo
                </a>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          className="mf-hwh-arrow mf-hwh-arrow--next"
          onClick={() => go(1)}
          aria-label="Next capability"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="mf-hwh-dots" role="tablist" aria-label="Capabilities">
        {cards.map((c, i) => (
          <button
            key={c.title}
            type="button"
            className={`mf-hwh-dot${i === active ? " is-active" : ""}`}
            onClick={() => setActive(i)}
            aria-label={`Show ${c.title}`}
            aria-selected={i === active}
            role="tab"
          />
        ))}
      </div>
    </section>
  );
}

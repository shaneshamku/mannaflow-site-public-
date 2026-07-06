import type { ReactNode } from "react";

const GREEN = "#528562";

const ClockIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="12" cy="12" r="9" stroke={GREEN} strokeWidth="1.4" />
    <path
      d="M12 7v5l3.5 2"
      stroke={GREEN}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"
      stroke={GREEN}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M17 4.5v3M15.5 6h3"
      stroke={GREEN}
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect
      x="3.5"
      y="5"
      width="17"
      height="15"
      rx="2"
      stroke={GREEN}
      strokeWidth="1.4"
    />
    <path
      d="M3.5 9.5h17M8 3.5v3M16 3.5v3"
      stroke={GREEN}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M7.5 13.5h1.5M13 13.5l1.2 1.2 2.3-2.4"
      stroke={GREEN}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect
      x="5"
      y="4.5"
      width="14"
      height="16"
      rx="2"
      stroke={GREEN}
      strokeWidth="1.4"
    />
    <path
      d="M9 4.5a3 3 0 0 1 6 0"
      stroke={GREEN}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M8.5 15.5l2.3-2.3 1.6 1.6 3.1-3.4"
      stroke={GREEN}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type Card = {
  icon: ReactNode;
  label: string;
  value: string;
  body: string;
};

const cards: Card[] = [
  {
    icon: <ClockIcon />,
    label: "Time",
    value: "10+ hrs/wk",
    body: "Lost to admin, quote chasing, inbox checks, and handoffs.",
  },
  {
    icon: <MoonIcon />,
    label: "Coverage",
    value: "Nights + weekends",
    body: "Leads still need a response when your team is busy or off.",
  },
  {
    icon: <CalendarIcon />,
    label: "Follow-up",
    value: "Day 1, 3, 7, 14",
    body: "Timed check-ins keep quotes warm until they book or pass.",
  },
  {
    icon: <ClipboardIcon />,
    label: "Leakage",
    value: "3–7 jobs/mo",
    body: "Good leads should not disappear because the day got busy.",
  },
];

export default function Stats() {
  return (
    <section id="stats" className="mf-gap pt-14 pb-28 md:pt-24 md:pb-36">
      <div className="max-w-6xl mx-auto px-6">
        <p className="mf-gap-eyebrow">The Gap</p>
        <h2 className="mf-gap-headline">
          Good leads are not always lost because of price.
        </h2>
        <p className="mf-gap-sub">
          They are lost when calls wait, quotes go cold,{" "}
          <br className="mf-gap-br" />
          and follow-up gets pushed aside.
        </p>

        <div className="mf-gap-grid">
          {cards.map((card) => (
            <div key={card.label} className="mf-gap-card">
              <div className="mf-gap-icon">{card.icon}</div>
              <p className="mf-gap-label">{card.label}</p>
              <p className="mf-gap-value">{card.value}</p>
              <span aria-hidden className="mf-gap-dash" />
              <p className="mf-gap-body">{card.body}</p>
            </div>
          ))}
        </div>

        <div className="mf-gap-note">
          <span aria-hidden className="mf-gap-note-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10.5" stroke={GREEN} strokeWidth="1.2" />
              <path
                d="M12 7.5v9M8.1 9.75l7.8 4.5M15.9 9.75l-7.8 4.5"
                stroke={GREEN}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <p>
            Modeled estimate. Your demo will calculate the gap using your actual
            lead flow.
          </p>
        </div>
      </div>
    </section>
  );
}

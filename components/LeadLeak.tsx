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

const ChannelsIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M3 5.5h11v8H7l-4 3v-3H3z"
      stroke={GREEN}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M17 9.5h4v6h-1v2.5l-3-2.5h-4"
      stroke={GREEN}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

type Card = {
  icon: ReactNode;
  label: string;
  value: string;
  title: string;
  body: string;
};

const cards: Card[] = [
  {
    icon: <ClockIcon />,
    label: "Time",
    value: "10+ hrs/wk",
    title: "During the Job",
    body: "Calls come in while techs are busy, driving, or finishing the last appointment.",
  },
  {
    icon: <MoonIcon />,
    label: "Coverage",
    value: "Nights + weekends",
    title: "After Hours",
    body: "Leads still need more than a message taken by someone else.",
  },
  {
    icon: <CalendarIcon />,
    label: "Follow-up",
    value: "21-day sequence",
    title: "After the Quote",
    body: "Timed check-ins keep open quotes warm until they book or say no.",
  },
  {
    icon: <ChannelsIcon />,
    label: "Leakage",
    value: "3–7 jobs/mo",
    title: "Across Channels",
    body: "Scattered calls, texts, forms, and chats create missed next steps.",
  },
];

export default function LeadLeak() {
  return (
    <section id="lead-leak" className="mf-gap pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <p className="mf-gap-eyebrow">Where Leads Leak</p>
        <h2 className="mf-gap-headline">
          Good leads are not always lost because of price
        </h2>
        <p className="mf-gap-sub">
          They are lost when calls wait, quotes go cold, and follow-up depends
          on whoever has time that day.
        </p>

        <div className="mf-gap-grid">
          {cards.map((card) => (
            <div key={card.label} className="mf-gap-card">
              <div className="mf-gap-icon">{card.icon}</div>
              <p className="mf-gap-label">{card.label}</p>
              <p className="mf-gap-value">{card.value}</p>
              <p className="mf-gap-title">{card.title}</p>
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

        <a
          href="#how-it-works"
          className="mf-leak-bridge"
          aria-label="See how MannaFlow helps"
        >
          <span>That&apos;s where MannaFlow comes in</span>
          <svg width="26" height="30" viewBox="0 0 30 34" fill="none" aria-hidden>
            <path
              d="M4 6l11 9 11-9"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 18l11 9 11-9"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.5"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}

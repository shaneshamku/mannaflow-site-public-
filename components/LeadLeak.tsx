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
  num: string;
  unit: string;
  subtitle: string;
  body: string;
};

const cards: Card[] = [
  {
    icon: <ClockIcon />,
    num: "10+",
    unit: "hrs/week",
    subtitle: "spent unable to answer new inquiries",
    body: "New inquiries come in while your team is busy serving customers, on the road, or handling the next job.",
  },
  {
    icon: <MoonIcon />,
    num: "16+",
    unit: "hrs/day",
    subtitle: "without live lead response",
    body: "Customers expect an answer, even when your office is closed",
  },
  {
    icon: <CalendarIcon />,
    num: "21",
    unit: "days",
    subtitle: "before most quotes go cold",
    body: "Without consistent follow-ups, interested customers move on.",
  },
  {
    icon: <ChannelsIcon />,
    num: "4+",
    unit: "channels",
    subtitle: "where leads can disappear",
    body: "Calls, text, forms, and chats across different channels make it easy for leads to slip through the cracks.",
  },
];

export default function LeadLeak() {
  return (
    <section id="lead-leak" className="mf-gap pt-28 pb-16 md:pt-36 md:pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <p className="mf-gap-eyebrow">Where Leads Leak</p>
        <h2 className="mf-gap-headline">
          Good leads are lost{" "}
          <br className="mf-br" />
          between inquiry and response
        </h2>
        <p className="mf-gap-sub">
          Homeowners do not wait around. Slow responses, missed after-hours
          inquiries, and inconsistent follow-up give them every reason to
          choose the next contractor.
        </p>

        <div className="mf-gap-grid">
          {cards.map((card) => (
            <div key={card.subtitle} className="mf-gap-cell">
              <div className="mf-gap-card">
                <div className="mf-gap-icon">{card.icon}</div>
                <p className="mf-gap-value">
                  <span className="mf-gap-num">{card.num}</span>{" "}
                  <span className="mf-gap-unit">{card.unit}</span>
                </p>
                <p className="mf-gap-subtitle">{card.subtitle}</p>
                <span aria-hidden className="mf-gap-dash" />
                <p className="mf-gap-body">{card.body}</p>
              </div>
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
            Modeled estimate and based on industry averages. Your demo will
            calculate the gap using your actual lead flow
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

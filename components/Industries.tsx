import type { ReactNode } from "react";

const ICON = "#CBD8CE";

const TruckIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M2.5 6.5h10v9H2.5zM12.5 9.5h4l3 3v3h-7z"
      stroke={ICON}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <circle cx="6.5" cy="17" r="1.7" stroke={ICON} strokeWidth="1.4" />
    <circle cx="16.5" cy="17" r="1.7" stroke={ICON} strokeWidth="1.4" />
  </svg>
);

const HeadsetIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M4.5 13v-1a7.5 7.5 0 0 1 15 0v1"
      stroke={ICON}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <rect x="3" y="12.5" width="3.5" height="6" rx="1.5" stroke={ICON} strokeWidth="1.4" />
    <rect x="17.5" y="12.5" width="3.5" height="6" rx="1.5" stroke={ICON} strokeWidth="1.4" />
    <path
      d="M19.25 18.5v1a2.5 2.5 0 0 1-2.5 2.5H12.5"
      stroke={ICON}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const CalendarCheckIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3.5" y="5" width="17" height="15" rx="2" stroke={ICON} strokeWidth="1.4" />
    <path
      d="M3.5 9.5h17M8 3.5v3M16 3.5v3"
      stroke={ICON}
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M8.5 14.5l2.2 2.2 4-4.4"
      stroke={ICON}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChatIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M3 5.5h11v8H7l-4 3v-3H3z"
      stroke={ICON}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M17 9.5h4v6h-1v2.5l-3-2.5h-4"
      stroke={ICON}
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

type Problem = {
  icon: ReactNode;
  title: string;
  body: string;
};

const problems: Problem[] = [
  {
    icon: <TruckIcon />,
    title: "During the Job",
    body: "Calls come in while techs are driving, working, or finishing the last appointment.",
  },
  {
    icon: <HeadsetIcon />,
    title: "After Hours",
    body: "Evening and weekend inquiries still need more than a message taken by someone else.",
  },
  {
    icon: <CalendarCheckIcon />,
    title: "After the Quote",
    body: "A sent quote can go cold when nobody follows up at the right time.",
  },
  {
    icon: <ChatIcon />,
    title: "Across Channels",
    body: "Calls, texts, forms, and chats create messy handoffs when they live in separate places.",
  },
];

export default function Industries() {
  return (
    <section
      id="industries"
      style={{ backgroundColor: "#F5F2EC" }}
      className="pt-32 pb-12 md:pt-44 md:pb-20"
    >
      <div className="max-w-4xl mx-auto px-6">
        <p
          className="type-eyebrow mb-3 md:mb-4 text-center md:text-left"
          style={{ color: "#627C85" }}
        >
          Where leads get stuck
        </p>
        <h2
          className="type-headline mb-6 md:mb-10 text-center md:text-left"
          style={{ color: "#212926" }}
        >
          Your team is working.{" "}
          <br className="mf-stuck-br" />
          The lead is waiting.
        </h2>

        <div>
          {problems.map((p, i) => (
            <div
              key={p.title}
              className="mf-stuck-item"
              style={i > 0 ? { borderTop: "1px solid #DDD5C6" } : undefined}
            >
              <span className="mf-stuck-icon">{p.icon}</span>
              <div className="mf-stuck-main">
                <span aria-hidden className="mf-stuck-rule" />
                <div>
                  <p className="mf-stuck-title">{p.title}</p>
                  <p className="mf-stuck-body">{p.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mf-stuck-cta">
          <p>That&apos;s where MannaFlow comes in</p>
        </div>

        <a
          href="#how-it-works"
          className="mf-scroll-cue"
          aria-label="Scroll down to see how we help"
        >
          <svg width="30" height="34" viewBox="0 0 30 34" fill="none" aria-hidden>
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

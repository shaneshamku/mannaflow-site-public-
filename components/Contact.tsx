"use client";

import { useState, type FormEvent, type ChangeEvent, type ReactNode } from "react";
import Image from "next/image";

type Status = "idle" | "sending" | "sent" | "error";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  businessType: "",
  message: "",
};

/* ---- Icons (simple stroke, sized to inherit color) ---- */

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const UserIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
  </svg>
);
const MailIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);
const PhoneIcon = () => (
  <svg {...iconProps}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z" />
  </svg>
);
const BriefcaseIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="7" width="18" height="12" rx="2" />
    <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
  </svg>
);
const WrenchIcon = () => (
  <svg {...iconProps}>
    <path d="M14.7 6.3a4 4 0 00-5.4 5.2L4 16.8 7.2 20l5.3-5.3a4 4 0 005.2-5.4l-2.6 2.6-2.3-.6-.6-2.3z" />
  </svg>
);
const CalendarIcon = () => (
  <svg {...iconProps} width={18} height={18}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
  </svg>
);
const LockIcon = () => (
  <svg {...iconProps} width={14} height={14}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 018 0v3" />
  </svg>
);
const ClockIcon = () => (
  <svg {...iconProps} width={24} height={24}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l2.5 2" />
  </svg>
);
const UsersIcon = () => (
  <svg {...iconProps} width={24} height={24}>
    <circle cx="9" cy="9" r="3" />
    <path d="M3 20c0-3 2.7-4.5 6-4.5s6 1.5 6 4.5" />
    <path d="M16 6a3 3 0 010 6M21 20c0-2.4-1.6-3.9-4-4.4" />
  </svg>
);
const ShieldIcon = () => (
  <svg {...iconProps} width={24} height={24}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const CheckIcon = () => (
  <svg {...iconProps} width={16} height={16} strokeWidth={2}>
    <path d="M5 12l4.5 4.5L19 7" />
  </svg>
);

const benefits = [
  {
    icon: <ClockIcon />,
    title: "30-Minute Walkthrough",
    desc: "See how calls, messages, and follow-ups would work for your business.",
  },
  {
    icon: <UsersIcon />,
    title: "Built Around Your Lead Flow",
    desc: "We'll look at how leads come in today and where they get stuck.",
  },
  {
    icon: <ShieldIcon />,
    title: "No Pressure",
    desc: "Ask questions, see the system, and decide if it makes sense.",
  },
];

const trustRows = [
  "30-minute walkthrough",
  "Built around your lead flow",
  "No pressure",
];

export default function Contact({
  subtext = "In 30 minutes, we'll map your lead flow, show the demo, and see where MannaFlow could save your team time.",
}: {
  subtext?: string;
  supportText?: string;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState(initialForm);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="mf-book py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* ---- Left column: copy + benefits ---- */}
          <div>
            <p className="type-eyebrow mf-book-eyebrow mb-4">Get Started</p>
            <h2 className="type-headline mf-book-heading mb-5">
              Book your <em>free</em> MannaFlow demo
            </h2>
            <p className="type-subhead mf-book-sub" style={{ maxWidth: "42ch" }}>
              {subtext}
            </p>

            {/* Detailed benefit rows — desktop only */}
            <div className="hidden lg:block mt-12">
              <div className="space-y-7">
                {benefits.map((b) => (
                  <div key={b.title} className="flex items-stretch gap-5">
                    <span className="mf-book-benefit-icon">{b.icon}</span>
                    <span className="mf-book-benefit-rule" />
                    <div className="pt-1">
                      <p className="type-card-title mf-book-benefit-title mb-1">
                        {b.title}
                      </p>
                      <p
                        className="type-body mf-book-benefit-desc"
                        style={{ fontSize: "0.95rem", lineHeight: 1.55, maxWidth: "34ch" }}
                      >
                        {b.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <svg
                className="mt-9 mb-4"
                width="40"
                height="10"
                viewBox="0 0 40 10"
                fill="none"
                aria-hidden
              >
                <path
                  d="M1 5c4-6 8 6 12 0s8-6 12 0 8 6 14 0"
                  stroke="#5FA875"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
              <p
                className="type-body mf-book-close"
                style={{ fontSize: "0.95rem" }}
              >
                Let&apos;s find the leaks and keep more leads moving.
              </p>
            </div>
          </div>

          {/* ---- Right column: form card ---- */}
          <div className="mf-book-card">
            <span className="mf-book-badge">
              <Image
                src="/images/logo-icon.png"
                alt=""
                width={32}
                height={32}
              />
            </span>
            <div className="mf-book-card-top">
              <span />
              <span />
            </div>

            {status === "sent" ? (
              <div className="py-6 text-center">
                <p className="type-card-title mb-2" style={{ color: "#212926" }}>
                  Request received.
                </p>
                <p className="type-body" style={{ color: "#627C85" }}>
                  We&apos;ll reach out within one business day to schedule your
                  demo.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field
                  id="name"
                  label="Full Name"
                  icon={<UserIcon />}
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
                <Field
                  id="email"
                  label="Email"
                  type="email"
                  icon={<MailIcon />}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                <Field
                  id="phone"
                  label="Phone"
                  type="tel"
                  icon={<PhoneIcon />}
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="(555) 000-0000"
                  autoComplete="tel"
                />
                <Field
                  id="company"
                  label="Company"
                  icon={<BriefcaseIcon />}
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Your company name"
                  autoComplete="organization"
                />

                <div>
                  <label
                    htmlFor="businessType"
                    className="type-label mf-book-label block mb-2"
                  >
                    Trade / Business Type
                  </label>
                  <div className="mf-input-wrap">
                    <span className="mf-input-icon">
                      <WrenchIcon />
                    </span>
                    <select
                      id="businessType"
                      name="businessType"
                      value={form.businessType}
                      onChange={handleChange}
                      required
                      className="form-input form-select mf-book-input"
                      style={{ color: form.businessType ? "#212926" : "#A39B8B" }}
                    >
                      <option value="" disabled>
                        Contractor, home services, trades…
                      </option>
                      <option value="Contractor">Contractor</option>
                      <option value="Home services">Home services</option>
                      <option value="Trades">Trades</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {status === "error" && (
                  <p className="type-body" style={{ color: "#A65F28", fontSize: "0.9rem" }}>
                    Something went wrong. Email us at mannaflow.io@gmail.com and
                    we&apos;ll get back to you.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mf-book-submit"
                  style={{ marginTop: "0.5rem" }}
                >
                  <CalendarIcon />
                  {status === "sending" ? "Sending…" : "Book My Free Demo"}
                </button>

                <p className="mf-book-secure">
                  <LockIcon />
                  Your information is secure and never shared.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* ---- Compact trust rows — mobile only ---- */}
        <div className="lg:hidden mt-10">
          {trustRows.map((row) => (
            <div
              key={row}
              className="mf-book-trust-row flex items-center gap-4 py-4"
            >
              <span className="mf-book-trust-icon">
                <CheckIcon />
              </span>
              <span
                className="type-card-title mf-book-trust-label"
                style={{ fontSize: "1.05rem" }}
              >
                {row}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- Reusable labelled input with left icon ---- */

function Field({
  id,
  label,
  icon,
  type = "text",
  ...props
}: {
  id: string;
  label: string;
  icon: ReactNode;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="type-label mf-book-label block mb-2">
        {label}
      </label>
      <div className="mf-input-wrap">
        <span className="mf-input-icon">{icon}</span>
        <input
          id={id}
          name={id}
          type={type}
          className="form-input mf-book-input"
          {...props}
        />
      </div>
    </div>
  );
}

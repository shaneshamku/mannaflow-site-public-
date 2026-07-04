"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  businessType: "",
  message: "",
};

export default function Contact({
  subtext = "In 30 minutes, we will show you how MannaFlow can help your business respond faster, follow up cleaner, and reduce the manual work around every lead.",
  supportText,
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
    <section
      id="contact"
      style={{ backgroundColor: "#F5F2EC" }}
      className="py-12 md:py-20"
    >
      <div className="max-w-2xl mx-auto px-6">
        <p className="type-eyebrow mb-4" style={{ color: "#627C85" }}>
          Get Started
        </p>
        <h2 className="type-headline mb-4" style={{ color: "#212926" }}>
          Book your free MannaFlow demo.
        </h2>
        <p
          className="type-subhead mb-8 md:mb-12"
          style={{ color: "#212926", maxWidth: "50ch" }}
        >
          {subtext}
        </p>

        {status === "sent" ? (
          <div className="py-12">
            <p className="type-headline mb-4" style={{ color: "#212926" }}>
              Request received.
            </p>
            <p className="type-body" style={{ color: "#627C85" }}>
              We will reach out within one business day to schedule your demo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="name"
                  className="type-label block mb-2"
                  style={{ color: "#212926" }}
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="type-label block mb-2"
                  style={{ color: "#212926" }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="phone"
                  className="type-label block mb-2"
                  style={{ color: "#212926" }}
                >
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="(555) 000-0000"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label
                  htmlFor="company"
                  className="type-label block mb-2"
                  style={{ color: "#212926" }}
                >
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Your company name"
                  autoComplete="organization"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="businessType"
                className="type-label block mb-2"
                style={{ color: "#212926" }}
              >
                Trade / Business Type
              </label>
              <input
                id="businessType"
                name="businessType"
                value={form.businessType}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Contractor, home services, trades, or other"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="type-label block mb-2"
                style={{ color: "#212926" }}
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                className="form-input"
                style={{ resize: "vertical" }}
                placeholder="Tell us about your business and how leads come in today"
              />
            </div>

            {status === "error" && (
              <p className="type-body" style={{ color: "#A65F28" }}>
                Something went wrong. Email us at mannaflow.io@gmail.com and we
                will get back to you.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-primary"
            >
              {status === "sending" ? "Sending..." : "Request Demo"}
            </button>

            {supportText && (
              <p className="type-body" style={{ color: "#627C85" }}>
                {supportText}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

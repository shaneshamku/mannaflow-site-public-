"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  businessType: "",
  message: "",
};

export default function Contact() {
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
          Get started
        </p>
        <h2 className="type-headline mb-4" style={{ color: "#35524A" }}>
          Book your free demo.
        </h2>
        <p
          className="type-subhead mb-8 md:mb-12"
          style={{ color: "#627C85", maxWidth: "50ch" }}
        >
          30 minutes. We will show you exactly how mannaflow works in your
          business and confirm a price.
        </p>

        {status === "sent" ? (
          <div className="py-12">
            <p className="type-headline mb-4" style={{ color: "#35524A" }}>
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
                  style={{ color: "#35524A" }}
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
                  style={{ color: "#35524A" }}
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
                  style={{ color: "#35524A" }}
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
                  htmlFor="businessType"
                  className="type-label block mb-2"
                  style={{ color: "#35524A" }}
                >
                  Business Type
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  value={form.businessType}
                  onChange={handleChange}
                  required
                  className="form-input form-select"
                  style={{ cursor: "pointer" }}
                >
                  <option value="" disabled>
                    Select one
                  </option>
                  <option value="hvac">HVAC / Home Services</option>
                  <option value="residential">Residential HVAC</option>
                  <option value="commercial">Commercial HVAC</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="message"
                className="type-label block mb-2"
                style={{ color: "#35524A" }}
              >
                Message (optional)
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                className="form-input"
                style={{ resize: "vertical" }}
                placeholder="Tell us about your business or what you want to automate"
              />
            </div>

            {status === "error" && (
              <p className="type-body" style={{ color: "#627C85" }}>
                Something went wrong. Email us at hello@mannaflow.io and we will
                get back to you.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-primary"
            >
              {status === "sending" ? "Sending..." : "Send Request"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

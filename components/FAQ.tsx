const faqs = [
  {
    q: "Will MannaFlow replace my office staff?",
    a: "No. MannaFlow supports your team, it does not replace them. It handles missed calls, basic questions, follow-ups, and handoffs so your staff can focus on customers and work that needs a person.",
  },
  {
    q: "Does it sound robotic, or like a real person?",
    a: "It is designed to feel natural and conversational. Callers can explain what they need, ask questions, and have a normal back-and-forth. If something needs your team, MannaFlow can hand it off.",
  },
  {
    q: "How fast does a new lead get a response?",
    a: "The goal is seconds, not hours. Whether the lead comes from a call, text, form, or chat, MannaFlow helps make sure they are not left waiting.",
  },
  {
    q: "What happens with urgent or emergency calls?",
    a: "You set the rules. If a call sounds urgent, complex, or outside the normal process, MannaFlow can route it to the right person by call, text, or notification.",
  },
  {
    q: "Does it work with my current phone number?",
    a: "Yes. In most cases, you can keep your current number. Calls can be forwarded when your team is busy, after hours, or during the times you want covered.",
  },
  {
    q: "Can it book appointments into my calendar or software?",
    a: "Yes, depending on your setup. MannaFlow can connect with calendars and common field-service tools, or start with a simpler handoff if that gets you live faster.",
  },
  {
    q: "Do I need to change my current systems?",
    a: "Usually, no. We start with your existing lead flow and recommend the simplest setup that saves time without forcing a full system change.",
  },
  {
    q: "What does it cost?",
    a: "Pricing depends on your lead volume and what you want MannaFlow to handle. On the demo, we map your lead flow and recommend the simplest setup that makes sense.",
  },
];

export default function FAQ() {
  return (
    <section
      id="faq"
      style={{ backgroundColor: "#EBE6DB" }}
      className="py-12 md:py-20"
    >
      <div className="max-w-3xl mx-auto px-6">
        <p
          className="type-eyebrow mb-3 md:mb-4 text-center md:text-left"
          style={{ color: "#627C85" }}
        >
          FAQ
        </p>
        <h2
          className="type-headline mb-8 md:mb-12 text-center md:text-left"
          style={{ color: "#212926" }}
        >
          Common questions, straight answers.
        </h2>

        <div>
          {faqs.map((item) => (
            <details
              key={item.q}
              name="faq"
              className="faq-item"
              style={{ borderBottom: "1.5px dashed #C9C0AE" }}
            >
              <summary className="faq-summary py-3.5 md:py-4">
                <span
                  className="type-card-title"
                  style={{ color: "#212926", fontSize: "1.05rem", lineHeight: 1.35 }}
                >
                  {item.q}
                </span>
              </summary>
              <p
                className="type-body pb-4 md:pb-5"
                style={{ color: "#3D4744", maxWidth: "58ch", fontSize: "0.9375rem", lineHeight: 1.6 }}
              >
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

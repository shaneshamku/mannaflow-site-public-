const faqs = [
  {
    q: "Will MannaFlow replace my office staff?",
    a: "No. MannaFlow handles the repetitive response and follow-up work so your staff can focus on scheduling, customers, and the jobs already in motion.",
  },
  {
    q: "How fast does a new lead get a response?",
    a: "Seconds. Calls, texts, and website chats get an immediate answer instead of waiting for someone on your team to be free.",
  },
  {
    q: "What happens with urgent or emergency calls?",
    a: "Urgent jobs are flagged and routed to your team right away, with the customer's details and job information already collected.",
  },
  {
    q: "Do I need to change my phone system or website?",
    a: "No. MannaFlow works alongside your existing phone number, website, and tools — nothing gets ripped out or replaced.",
  },
  {
    q: "Is there a long-term contract?",
    a: "No. One flat monthly rate, and cancellations take effect at the end of the current billing month.",
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
              className="faq-item"
              style={{ borderBottom: "1.5px dashed #C9C0AE" }}
            >
              <summary className="faq-summary py-4 md:py-5">
                <span
                  className="type-card-title"
                  style={{ color: "#212926" }}
                >
                  {item.q}
                </span>
              </summary>
              <p
                className="type-body pb-5 md:pb-6"
                style={{ color: "#3D4744", maxWidth: "58ch" }}
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

import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "How It Works | MannaFlow",
  description:
    "From missed calls to website inquiries, MannaFlow helps contractors respond faster, capture job details, and keep follow-up from falling through the cracks.",
};

const steps = [
  {
    title: "Lead comes in",
    body: "A customer calls, texts, fills out a form, or starts a website chat.",
  },
  {
    title: "MannaFlow responds",
    body: "The lead gets a fast response instead of waiting for someone on your team to become available.",
  },
  {
    title: "Job details are captured",
    body: "MannaFlow collects the key details your team needs, including the customer's name, contact info, job type, urgency, and location.",
  },
  {
    title: "Booking or handoff happens",
    body: "The lead is either moved toward booking or handed to your team with the right context.",
  },
  {
    title: "Follow-up continues",
    body: "If the customer does not book right away, follow-ups continue on a clear schedule.",
  },
  {
    title: "Your team sees what happened",
    body: "Leads, responses, and next steps are organized so your team knows what needs attention.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Nav />
      <main>
        <section
          style={{ backgroundColor: "#14181A", paddingTop: "64px" }}
          className="mf-page-hero py-16 md:py-24"
        >
          <div className="max-w-5xl mx-auto px-6 pt-10 md:pt-16">
            <h1
              className="type-headline mb-4 md:mb-6 md:text-center"
              style={{ color: "#F5F2EC" }}
            >
              How MannaFlow keeps leads moving
            </h1>
            <p
              className="type-subhead md:text-center md:mx-auto"
              style={{ color: "#C9CFCC", maxWidth: "58ch" }}
            >
              From missed calls to website inquiries, MannaFlow helps
              contractors respond faster, capture job details, and keep
              follow-up from falling through the cracks.
            </p>
          </div>
        </section>

        <section style={{ backgroundColor: "#F5F2EC" }} className="py-12 md:py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div>
              {steps.map((step, i) => (
                <div
                  key={step.title}
                  className="grid grid-cols-[3rem_1fr] md:grid-cols-[5rem_1fr] gap-4 md:gap-8 py-6 md:py-8"
                  style={{ borderBottom: "1px solid #DDD5C6" }}
                >
                  <p
                    style={{
                      fontFamily: "'MontaguSlab', Georgia, serif",
                      fontSize: "clamp(1.4rem, 3vw, 2rem)",
                      fontWeight: 300,
                      fontVariationSettings: "'opsz' 48, 'wght' 300",
                      color: "#A65F28",
                      lineHeight: 1,
                    }}
                  >
                    {i + 1}
                  </p>
                  <div>
                    <h2
                      className="type-card-title mb-2"
                      style={{ color: "#212926" }}
                    >
                      {step.title}
                    </h2>
                    <p
                      className="type-body"
                      style={{ color: "#212926", maxWidth: "58ch" }}
                    >
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-10 md:pt-14 md:text-center">
              <a href="/book-demo" className="btn-primary mf-page-cta">
                Book a Free Demo
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Who We Help | MannaFlow",
  description:
    "MannaFlow is for trade and service businesses that already get inquiries but lose time handling calls, texts, booking requests, and follow-up manually.",
};

const goodFit = [
  "You get calls while your team is on site",
  "You rely on office staff, techs, or call centers to catch leads",
  "You send quotes that need follow-up",
  "You want cleaner lead tracking without changing everything at once",
  "You want to save time without hiring more admin help",
];

export default function ContractorsPage() {
  return (
    <>
      <Nav />
      <main>
        <section
          style={{ backgroundColor: "#14181A", paddingTop: "64px" }}
          className="py-16 md:py-24"
        >
          <div className="max-w-5xl mx-auto px-6 pt-10 md:pt-16">
            <h1 className="type-headline mb-4 md:mb-6" style={{ color: "#F5F2EC" }}>
              Built for contractors with more leads than time
            </h1>
            <p
              className="type-subhead"
              style={{ color: "#C9CFCC", maxWidth: "58ch" }}
            >
              MannaFlow is for trade and service businesses that already get
              inquiries but lose time handling calls, texts, booking requests,
              and follow-up manually.
            </p>
          </div>
        </section>

        <section style={{ backgroundColor: "#F5F2EC" }} className="py-12 md:py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="max-w-2xl">
              <div>
                <h2
                  className="type-card-title mb-5 md:mb-6"
                  style={{ color: "#212926" }}
                >
                  MannaFlow is a good fit if:
                </h2>
                <ul className="space-y-4">
                  {goodFit.map((item) => (
                    <li
                      key={item}
                      className="type-body flex gap-3"
                      style={{ color: "#212926" }}
                    >
                      <span style={{ color: "#32DE8A", fontWeight: 700 }}>✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            <div className="pt-10 md:pt-14">
              <a href="/book-demo" className="btn-primary">
                See If MannaFlow Fits
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

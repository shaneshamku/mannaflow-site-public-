import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CallAnsweringDemo from "@/components/demos/CallAnsweringDemo";
import TextChatDemo from "@/components/demos/TextChatDemo";
import FollowUpDemo from "@/components/demos/FollowUpDemo";
import WinBackDemo from "@/components/demos/WinBackDemo";

export const metadata: Metadata = {
  title: "See Demo | MannaFlow",
  description:
    "Watch how MannaFlow handles common lead situations contractors deal with every week.",
};

const demos = [
  { name: "Call Coverage", Demo: CallAnsweringDemo },
  { name: "Text & Website Booking", Demo: TextChatDemo },
  { name: "Quote Follow-Up", Demo: FollowUpDemo },
  { name: "Past Customer Re-Engagement", Demo: WinBackDemo },
];

export default function DemoPage() {
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
              See MannaFlow in action
            </h1>
            <p
              className="type-subhead"
              style={{ color: "#C9CFCC", maxWidth: "58ch" }}
            >
              Watch how MannaFlow handles common lead situations contractors
              deal with every week.
            </p>
          </div>
        </section>

        <section style={{ backgroundColor: "#F5F2EC" }} className="py-12 md:py-20">
          <div className="max-w-6xl mx-auto px-6">
            <p
              className="type-body mb-8 md:mb-14"
              style={{ color: "#212926", maxWidth: "58ch" }}
            >
              These demos show the types of conversations MannaFlow can help
              manage, from the first inquiry to the follow-up that brings a
              lead back.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {demos.map(({ name, Demo }) => (
                <div key={name}>
                  <h2
                    className="type-card-title mb-4"
                    style={{ color: "#212926" }}
                  >
                    {name}
                  </h2>
                  <Demo />
                </div>
              ))}
            </div>

            <div className="pt-10 md:pt-14 text-center">
              <a href="/book-demo" className="btn-primary">
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

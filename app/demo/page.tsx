import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CallAnsweringDemo from "@/components/demos/CallAnsweringDemo";
import TextChatDemo from "@/components/demos/TextChatDemo";
import FollowUpDemo from "@/components/demos/FollowUpDemo";
import WinBackDemo from "@/components/demos/WinBackDemo";
import DemoCarousel from "@/components/demos/DemoCarousel";

export const metadata: Metadata = {
  title: "See Demo | MannaFlow",
  description:
    "Watch how MannaFlow handles common lead situations contractors deal with every week.",
};

const demos = [
  { id: "voice-agent", name: "Voice Agent", Demo: CallAnsweringDemo },
  { id: "chatbot", name: "Chatbot", Demo: TextChatDemo },
  {
    id: "nurture-campaign",
    name: "Nurture Campaign — Quote Follow-Up",
    Demo: FollowUpDemo,
  },
  {
    id: "nurture-winback",
    name: "Nurture Campaign — Customer Win-Back",
    Demo: WinBackDemo,
  },
];

export default function DemoPage() {
  return (
    <>
      <Nav />
      <main>
        <section
          className="mf-demo-hero py-16 md:py-24"
          style={{ paddingTop: "64px" }}
        >
          <div className="max-w-5xl mx-auto px-6 pt-10 md:pt-16">
            <h1
              className="type-headline mb-4 md:mb-6"
              style={{ color: "#F5F2EC", textAlign: "center" }}
            >
              See MannaFlow <span style={{ color: "#12633b" }}>in action</span>
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

        <section
          style={{ backgroundColor: "#F5F2EC", overflowX: "hidden" }}
          className="py-12 md:py-20"
        >
          <div className="max-w-6xl mx-auto px-6">
            <p
              className="type-body mb-8 md:mb-14"
              style={{ color: "#212926", maxWidth: "58ch" }}
            >
              These demos show the types of conversations MannaFlow can help
              manage, from the first inquiry to the follow-up that brings a
              lead back.
            </p>

            <DemoCarousel items={demos} />

            <div className="pt-10 md:pt-14 text-center">
              <a href="/book-demo" className="btn-primary mf-demo-cta">
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

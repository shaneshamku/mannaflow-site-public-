import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "Book a Demo | MannaFlow",
  description:
    "We will review your current lead flow, show the live demo, and recommend the simplest setup that would save your team time.",
};

export default function BookDemoPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: "64px" }}>
        <Contact
          subtext="We will review your current lead flow, show the live demo, and recommend the simplest setup that would save your team time."
          supportText="No pressure. The goal is to see whether MannaFlow can save your team time and reduce missed opportunities."
        />
      </main>
      <Footer />
    </>
  );
}

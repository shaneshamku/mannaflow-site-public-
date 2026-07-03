import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Industries from "@/components/Industries";
import PainPoints from "@/components/PainPoints";
import TopoBand from "@/components/TopoBand";
import Services from "@/components/Services";
import BlurTextQuote from "@/components/BlurTextQuote";
import Competitive from "@/components/Competitive";
import NextSteps from "@/components/NextSteps";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Industries />
        <PainPoints />
        <TopoBand />
        <Services />
        <Competitive />
        <NextSteps />
        <BlurTextQuote />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

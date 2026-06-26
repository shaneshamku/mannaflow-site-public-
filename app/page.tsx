import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Industries from "@/components/Industries";
import PainPoints from "@/components/PainPoints";
import TopoBand from "@/components/TopoBand";
import Services from "@/components/Services";
import TypewriterQuote from "@/components/TypewriterQuote";
import BlurTextQuote from "@/components/BlurTextQuote";
import Competitive from "@/components/Competitive";
import Pricing from "@/components/Pricing";
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
        <TypewriterQuote />
        <Competitive />
        <Pricing />
        <BlurTextQuote />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

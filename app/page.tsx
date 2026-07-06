import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import SectionNotch from "@/components/SectionNotch";
import AgencyIntro from "@/components/AgencyIntro";
import Stats from "@/components/Stats";
import ProblemStatement from "@/components/ProblemStatement";
import Industries from "@/components/Industries";
import HowWeHelp from "@/components/HowWeHelp";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <SectionNotch from="#14181A" />
        <AgencyIntro />
        <SectionNotch from="#F5F2EC" />
        <Stats />
        <ProblemStatement />
        <Industries />
        <HowWeHelp />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

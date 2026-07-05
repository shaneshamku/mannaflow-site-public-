import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import AgencyIntro from "@/components/AgencyIntro";
import Stats from "@/components/Stats";
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
        <AgencyIntro />
        <Stats />
        <Industries />
        <HowWeHelp />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

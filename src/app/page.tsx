import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import MythicPlus from "@/components/MythicPlus/MythicPlus";
import HowItWorks from "@/components/HowItWorks/HowItWorks";
import FAQ from "@/components/FAQ/FAQ";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />

        <MythicPlus />

        <HowItWorks />

        <FAQ />
      </main>
    </>
  );
}
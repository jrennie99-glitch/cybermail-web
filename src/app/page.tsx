import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Features from "@/components/sections/Features";
import AIBrain from "@/components/sections/AIBrain";
import WalletAndPostal from "@/components/sections/WalletAndPostal";
import Pricing from "@/components/sections/Pricing";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <AIBrain />
        <WalletAndPostal />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

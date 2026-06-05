import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import BrandShowcase from "@/components/sections/BrandShowcase";
import Features from "@/components/sections/Features";
import Immersive from "@/components/sections/Immersive";
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
        {/* IMG_7949 (3D circuit envelope) — hero */}
        <Hero />
        {/* IMG_7959 (C + envelope) — what is Cybrmail */}
        <BrandShowcase />
        <Features />
        {/* IMG_7960 (pure C + purple) — privacy promise */}
        <Immersive />
        <AIBrain />
        <WalletAndPostal />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

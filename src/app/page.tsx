import Nav from "@/components/Nav";
import Hero from "@/components/Hero";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        {/* Sections below come in next pass — Features, AI Brain, Wallet,
            Postal, Pricing, FAQ, Footer. Hero approval first. */}
        <section className="min-h-screen bg-bg flex items-center justify-center text-ink-dim font-mono text-sm">
          <p>↓ More sections coming — get the hero approved first</p>
        </section>
      </main>
    </>
  );
}

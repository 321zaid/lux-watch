import type { Metadata } from "next";
import { CinematicIntro } from "@/components/cinematic/cinematic-intro";
import { Navbar } from "@/components/store/navbar";
import { StoreHomeSections } from "@/components/store/home-sections";
import { Footer } from "@/components/store/footer";
import { brand } from "@/lib/brand.config";

export const metadata: Metadata = {
  title: `${brand.name} — ${brand.tagline}`,
  description:
    "A cinematic entry into an independent horology house. Watch the film, then walk the boutique.",
};

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <CinematicIntro />
      {/* The boutique — arrives after the film settles */}
      <div id="store-content" className="relative bg-ivory">
        <StoreHomeSections />
        <Footer />
      </div>
    </main>
  );
}
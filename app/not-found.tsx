import Link from "next/link";
import { brand } from "@/lib/brand.config";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
      <span className="font-body text-[11px] uppercase tracking-[0.5em] text-gold">
        Error · {brand.name} Horlogerie
      </span>
      <h1 className="mt-6 font-display text-[17vw] leading-none text-ivory/95 md:text-8xl">
        {brand.since}
      </h1>
      <p className="mt-4 max-w-md font-body text-lg leading-relaxed text-smoke">
        The piece you were looking for has left the maison — or never existed.
      </p>
      <Link
        href="/"
        className="mt-10 border border-ivory/20 px-8 py-3.5 font-body text-[11px] uppercase tracking-[0.3em] text-ivory/80 transition-colors duration-300 hover:border-gold hover:text-gold"
      >
        Return to the collection
      </Link>
    </main>
  );
}
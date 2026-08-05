import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Great_Vibes } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/brand.config";
import { LenisProvider } from "@/components/animations/lenis";
import { CartProvider } from "@/components/store/cart-context";
import { RevealProvider } from "@/components/animations/reveal-provider";
import { Toaster } from "@/components/ui/toaster";
import { CookieConsent } from "@/components/store/cookie-consent";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  variable: "--font-signature",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0b0c",
};

export const metadata: Metadata = {
  title: {
    default: `${brand.name} — ${brand.tagline}`,
    template: `%s — ${brand.name}`,
  },
  description: brand.description,
  metadataBase: new URL(brand.url),
  openGraph: {
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.description,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${greatVibes.variable} h-full`}>
      <body className="min-h-full antialiased grain">
        <LenisProvider>
          <CartProvider>
            <RevealProvider>
              {children}
              <Toaster />
              <CookieConsent />
            </RevealProvider>
          </CartProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
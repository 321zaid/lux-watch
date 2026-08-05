import type { Metadata } from "next";
import { brand } from "@/lib/brand.config";
import { Container } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${brand.name} handles your data, cookies, and your rights under GDPR and CCPA.`,
};

const SECTIONS = [
  {
    title: "Who we are",
    body: `${brand.legalName} ("${brand.name}", "we", "us") operates the website at ${brand.url}. This policy explains what we collect, why, and the choices you have.`,
  },
  {
    title: "Data we collect",
    body: "Account information (email, name, password) if you create an account; order details (items, totals, shipping address) when you place an order; and a newsletter email if you subscribe. Your cart, wishlist, and cosmetic preferences are stored locally on your device.",
  },
  {
    title: "Cookies",
    body: `Essential cookies keep core features working — your cart, wishlist, sign-in session, and cookie preference itself. These are always on and require no consent. Optional analytics cookies would only be used to understand aggregate traffic, and are loaded only after you press "Accept all". You may change your choice at any time from the footer.`,
  },
  {
    title: "Third parties",
    body: "We use Supabase for account authentication, order storage, and newsletter subscriptions; Cloudflare for hosting and delivery. Payments and email are handled through established processors. Each provider processes data only to the extent needed to provide the service.",
  },
  {
    title: "Your rights",
    body: `Under the GDPR you may request access, rectification, erasure, restriction, portability, or object to processing of your personal data. If you are in California, the CCPA gives you the right to know, delete, and opt out of the sale of personal information — we do not sell your data. To exercise any right, contact ${brand.contact.email}.`,
  },
  {
    title: "Data retention & security",
    body: "We keep account and order records for as long as your account is active, and delete them on request. Communications are encrypted in transit, and access to personal data is limited to those who need it.",
  },
  {
    title: "Children",
    body: "Our services are not directed to anyone under 16, and we do not knowingly collect their data.",
  },
  {
    title: "Changes to this policy",
    body: "We will post any changes on this page and update the date below. Material changes will be flagged on the site.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <Container className="max-w-3xl pb-28 pt-28">
        <p className="font-body text-[11px] uppercase tracking-[0.3em] text-gold">
          Legal
        </p>
        <h1 className="mt-3 font-display text-5xl text-ink">Privacy Policy</h1>
        <p className="mt-3 font-body text-xs uppercase tracking-[0.25em] text-smoke">
          Last updated — {new Date().getFullYear()}
        </p>
        <div className="mt-12 flex flex-col gap-10">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-2xl text-ink">{s.title}</h2>
              <p className="mt-3 font-body text-sm leading-relaxed text-smoke">{s.body}</p>
            </section>
          ))}
          <section>
            <h2 className="font-display text-2xl text-ink">Contact</h2>
            <p className="mt-3 font-body text-sm leading-relaxed text-smoke">
              Questions about this policy? Write to{" "}
              <a href={`mailto:${brand.contact.email}`} className="text-gold underline underline-offset-2 hover:text-gold-dark">
                {brand.contact.email}
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}

import type { Metadata } from "next";
import { AccountPanel } from "@/components/store/account-panel";
import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { Container } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Account",
  description: "Sign in to INFINITY — order history and client care.",
};

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-ivory">
      <Navbar />
      <div className="pt-28" />
      <Container className="pb-24">
        <AccountPanel />
      </Container>
      <Footer />
    </main>
  );
}
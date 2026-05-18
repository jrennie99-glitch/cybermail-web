import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberMail — Email for the Web3 generation",
  description:
    "The local-first AI brain for your inbox. Token-gated mailboxes. Self-destructing emails. Wallet sign-in. Your data never leaves the server.",
  openGraph: {
    title: "CyberMail — Email for the Web3 generation",
    description:
      "Local-first AI brain · Token-gated mailboxes · Self-destruct · Wallet sign-in",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

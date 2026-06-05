import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const fontBody = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cybrmail.net"),
  title: {
    default: "Cybrmail — The AI-native encrypted inbox",
    template: "%s · Cybrmail",
  },
  description:
    "Encrypted email + on-device AI brain + wallet identity + real digital postal mailbox. The first inbox built for the post-password, post-spam, post-surveillance world.",
  keywords: [
    "encrypted email",
    "AI email",
    "wallet email",
    "private email",
    "Web3 inbox",
    "digital postal mail",
    "Sign in with Ethereum",
    "XMTP",
  ],
  openGraph: {
    title: "Cybrmail — The AI-native encrypted inbox",
    description:
      "Encrypted email + on-device AI brain + wallet identity + real digital postal mailbox.",
    type: "website",
    url: "https://cybrmail.net",
    siteName: "Cybrmail",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cybrmail — The AI-native encrypted inbox",
    description:
      "Encrypted email + on-device AI brain + wallet identity + real digital postal mailbox.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fontBody.variable} ${fontDisplay.variable} ${fontMono.variable} dark`}
    >
      <body className="bg-bg text-ink antialiased">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

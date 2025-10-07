import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: "Synth Patch Library - Document Your Modular Synthesis Patches",
    template: "%s | Synth Patch Library"
  },
  description: "Free online tool for documenting and organizing your modular synthesizer patches. Add images, audio, patch diagrams, tags, and detailed notes. Build your personal patch library today.",
  keywords: [
    "modular synthesis",
    "synth patches",
    "eurorack patches",
    "patch documentation",
    "modular synthesizer",
    "patch library",
    "synth patch manager",
    "eurorack documentation",
    "patch diagrams",
    "synthesizer patches",
    "modular synth organization",
    "modular synth patch library",
    "eurorack patch library",
    "synth patch library",
    "modular synth patch documentation",
    "eurorack patch documentation",
    "synth patch documentation"
  ],
  authors: [{ name: "Synth Patch Library" }],
  creator: "Synth Patch Library",
  publisher: "Synth Patch Library",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Synth Patch Library - Document Your Modular Synthesis Patches",
    description: "Free online tool for documenting and organizing your modular synthesizer patches. Add images, audio, patch diagrams, tags, and detailed notes.",
    siteName: "Synth Patch Library",
  },
  twitter: {
    card: "summary_large_image",
    title: "Synth Patch Library - Document Your Modular Synthesis Patches",
    description: "Free online tool for documenting and organizing your modular synthesizer patches. Add images, audio, patch diagrams, tags, and detailed notes.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when you get them:
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


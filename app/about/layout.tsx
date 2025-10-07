import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About & Contact - Support Synth Patch Library",
  description: "Learn about Synth Patch Library and get in touch. Free tool for modular synthesizer enthusiasts. Contact us for questions, feedback, or support the project with a donation.",
  openGraph: {
    title: "About Synth Patch Library - Contact & Support",
    description: "Learn about our mission to help modular synthesizer enthusiasts document their patches. Get in touch or support the project.",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}


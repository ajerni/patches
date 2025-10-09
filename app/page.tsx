import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Music, FileText, Image, Volume2, Tags, Network } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Synth Patch Library",
  description: "Document and organize your modular synthesizer patches with images, audio, visual diagrams, tags and detailed notes. Free online patch library for eurorack and modular synth enthusiasts.",
  openGraph: {
    title: "Synth Patch Library - Document Your Modular Synthesis Patches",
    description: "Document and organize your modular synthesizer patches with images, audio, visual diagrams, tags and detailed notes.",
    type: "website",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Synth Patch Library",
    "applicationCategory": "MultimediaApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Free online tool for documenting and organizing modular synthesizer patches. Add images, audio, patch diagrams, tags, and detailed notes.",
    "operatingSystem": "Any",
    "permissions": "Free to use",
    "featureList": [
      "Patch documentation with titles and descriptions",
      "Image uploads for patch cables and modules",
      "Audio file embedding with player",
      "Visual patch schema editor",
      "Tag-based organization",
      "Personal patch library management"
    ]
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Document Your Patches
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Organize your modular synthesis creations
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link
              href="/register"
              className="bg-primary-600 text-white hover:bg-primary-700 px-8 py-3 rounded-lg text-lg font-medium transition"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 px-8 py-3 rounded-lg text-lg font-medium transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <FeatureCard
            icon={<FileText className="h-10 w-10 text-primary-600" />}
            title="Documentation"
            description="Add titles, descriptions, instructions, and notes to fully document your patches"
          />
          <FeatureCard
            icon={<Image className="h-10 w-10 text-primary-600" />}
            title="Images"
            description="Upload images of your patch cables and module configurations"
          />
          <FeatureCard
            icon={<Volume2 className="h-10 w-10 text-primary-600" />}
            title="Audio"
            description="Link to your audio files and listen with the embedded player"
          />
          <FeatureCard
            icon={<Tags className="h-10 w-10 text-primary-600" />}
            title="Smart Organization"
            description="Use tags to categorize and quickly find your patches"
          />
          <FeatureCard
            icon={<Network className="h-10 w-10 text-primary-600" />}
            title="Patch Diagrams"
            description="Use the patch schema editor to create visual diagrams of your patches"
          />
          <FeatureCard
            icon={<Music className="h-10 w-10 text-primary-600" />}
            title="Personal Modular Library"
            description="Keep your documentation private or share patches with the community"
          />
          
        </div>

        {/* Visual Showcase Section */}
        <div className="mb-12 sm:mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              See It In Action
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Take a look at how your patches will be documented and organized
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 px-6 py-4 border-b border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Example Patch</h3>
                  <p className="text-sm text-gray-600">Scale Explorer - A beginner-friendly patch</p>
                </div>
                <Link
                  href="/patches/cmgj5m2vo0007109dy80vryyu"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition"
                >
                  View Example Patch
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Patch Overview */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Patch Overview</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        <ul className="space-y-1">
                          <li>• Used to explore different "sounds" of scales selected on the Eventide Misha</li>
                          <li>• Teaches the basics of using a VCO, EG and VCA</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Tags</h5>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">sequencer</span>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">basics</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Modules Used Preview */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Modules Used (5)</h4>
                  <div className="space-y-2">
                    {[
                      { name: "A-141-2 VCADSR", manufacturer: "Doepfer", type: "ADSR Envelope" },
                      { name: "A-135-2 Quad VCA", manufacturer: "Doepfer", type: "VCA/Mixer" },
                      { name: "Pico VCO2", manufacturer: "Erica Synths", type: "VCO" },
                      { name: "Pico VC EG", manufacturer: "Erica Synths", type: "Envelope" },
                      { name: "Misha", manufacturer: "Eventide", type: "Sequencer" }
                    ].map((module, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-sm text-gray-900">{module.name}</div>
                          <div className="text-xs text-gray-600">{module.manufacturer}</div>
                        </div>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                          {module.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Start Building Your Patch Library Today
          </h2>
          <p className="text-base sm:text-lg mb-6 opacity-90 px-2">
            Join the community of modular synthesists documenting their creative work
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-primary-600 hover:bg-gray-100 px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-medium transition"
          >
            Create Free Account
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}


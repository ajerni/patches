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
              Take a look at how you can document and organize your modular patches
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
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
                >
                  View Example
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Easy Markup */}
                <div className="text-center">
                  <div className="bg-white rounded-lg aspect-[4/3] mb-4 p-4 border border-gray-200 shadow-sm overflow-hidden">
                    <div className="w-full h-full overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left p-2 font-semibold text-gray-700">Element</th>
                            <th className="text-left p-2 font-semibold text-gray-700">Markdown Syntax</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="bg-white">
                            <td className="p-2">
                              <a href="https://www.markdownguide.org/basic-syntax/#headings" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                                Heading
                              </a>
                            </td>
                            <td className="p-2 font-mono text-gray-800">
                              <div># H1</div>
                              <div>## H2</div>
                              <div>### H3</div>
                            </td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="p-2">
                              <a href="https://www.markdownguide.org/basic-syntax/#emphasis" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                                Bold
                              </a>
                            </td>
                            <td className="p-2 font-mono text-gray-800">**bold text**</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="p-2">
                              <a href="https://www.markdownguide.org/basic-syntax/#italic" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                                Italic
                              </a>
                            </td>
                            <td className="p-2 font-mono text-gray-800">*italicized text*</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="p-2">
                              <a href="https://www.markdownguide.org/basic-syntax/#blockquotes-1" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                                Blockquote
                              </a>
                            </td>
                            <td className="p-2 font-mono text-gray-800">&gt; blockquote</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="p-2">
                              <a href="https://www.markdownguide.org/basic-syntax/#ordered-lists" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                                Ordered List
                              </a>
                            </td>
                            <td className="p-2 font-mono text-gray-800">
                              <div>1. First item</div>
                              <div>2. Second item</div>
                              <div>3. Third item</div>
                            </td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="p-2">
                              <a href="https://www.markdownguide.org/basic-syntax/#unordered-lists" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                                Unordered List
                              </a>
                            </td>
                            <td className="p-2 font-mono text-gray-800">
                              <div>- First item</div>
                              <div>- Second item</div>
                              <div>- Third item</div>
                            </td>
                          </tr>
                          <tr className="bg-white">
                            <td className="p-2">
                              <a href="https://www.markdownguide.org/basic-syntax/#code" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                                Code
                              </a>
                            </td>
                            <td className="p-2 font-mono text-gray-800">`code`</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="p-2">
                              <a href="https://www.markdownguide.org/basic-syntax/#horizontal-rules" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                                Horizontal Rule
                              </a>
                            </td>
                            <td className="p-2 font-mono text-gray-800">---</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="p-2">
                              <a href="https://www.markdownguide.org/basic-syntax/#links" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                                Link
                              </a>
                            </td>
                            <td className="p-2 font-mono text-gray-800">[title](https://www.example.com)</td>
                          </tr>
                         
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Markup</h3>
                  <p className="text-sm text-gray-600">Markdown support for rich formatting</p>
                </div>

                {/* Patch Editor */}
                <div className="text-center">
                  <div className="bg-white rounded-lg aspect-[4/3] mb-4 border border-gray-200 shadow-sm relative p-4">
                    <img 
                      src="/screenshots/editor.webp" 
                      alt="Visual Patch Editor Screenshot"
                      className="w-full h-full object-contain rounded"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Patch Editor</h3>
                  <p className="text-sm text-gray-600">Create patch diagrams with drag-and-drop</p>
                </div>

                {/* Explore and Like */}
                <div className="text-center">
                  <div className="bg-white rounded-lg aspect-[4/3] mb-4 border border-gray-200 shadow-sm relative p-4">
                    <img 
                      src="/screenshots/sharedpatch.webp" 
                      alt="Community Screenshot"
                      className="w-full h-full object-contain rounded"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore & Share</h3>
                  <p className="text-sm text-gray-600">Discover shared patches from the community</p>
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
            Join the community of modular synthesizer enthusiasts documenting their creative work
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


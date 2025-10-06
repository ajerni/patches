import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Music, FileText, Image, Volume2, Tags, Network } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Document Your Patches
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Organize your modular synthesis creations
          </p>
          <div className="flex justify-center space-x-4">
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
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
            title="Patch Schemas"
            description="Use the patch schema editor to create visual diagrams of your patches"
          />
          <FeatureCard
            icon={<Music className="h-10 w-10 text-primary-600" />}
            title="Personal Library"
            description="Build your own collection of patches with full privacy"
          />
          
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Start Building Your Patch Library Today
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Join the community of modular synthesists documenting their creative work
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium transition"
          >
            Create Free Account
          </Link>
        </div>
      </main>

      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Synth Patch Library. All rights reserved.</p>
        </div>
      </footer>
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


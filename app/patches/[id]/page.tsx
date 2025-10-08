"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { HearthisEmbed } from "@/components/HearthisEmbed";
import { Edit, ArrowLeft, Music, Calendar, Tag, Image as ImageIcon, Volume2, Boxes, Network } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import PatchSchemaViewer to avoid SSR issues
const PatchSchemaViewer = dynamic(() => import("@/components/PatchSchemaViewer"), {
  ssr: false,
  loading: () => <div className="bg-gray-100 h-96 flex items-center justify-center">Loading schema...</div>
});

interface Patch {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  notes?: string;
  tags: string[];
  images: string[];
  sounds: string[];
  schema?: any;
  private: boolean;
  patchModules?: Array<{
    module: {
      id: string;
      manufacturer: string;
      name: string;
      type?: string;
      images?: string[];
    };
  }>;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function PatchDetailPage({ params }: { params: { id: string } }) {
  const { status } = useSession();
  const router = useRouter();
  const [patch, setPatch] = useState<Patch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPatch();
    }
  }, [status, params.id]);

  const fetchPatch = async () => {
    try {
      const res = await fetch(`/api/patches/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setPatch(data);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch patch:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Music className="h-12 w-12 text-primary-600 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading patch...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patch) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">{patch.title}</h1>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    patch.private 
                      ? 'bg-white/20 text-white' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {patch.private ? 'Private' : 'Public'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-primary-50">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 sm:h-4 w-3 sm:w-4" />
                    <span>
                      Updated {new Date(patch.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <span>by {patch.user.name}</span>
                </div>
              </div>
              <Link
                href={`/patches/${patch.id}/edit`}
                className="flex items-center justify-center space-x-2 bg-white text-primary-600 hover:bg-primary-50 px-3 sm:px-4 py-2 rounded-lg transition font-medium text-sm sm:text-base w-full sm:w-auto"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>
            </div>

            {/* Tags */}
            {patch.tags.length > 0 && (
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-primary-100" />
                <div className="flex flex-wrap gap-2">
                  {patch.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/20 text-white rounded-full text-sm backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Description</h2>
          <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{patch.description}</p>
        </div>

          {/* Modules Used */}
          {patch.patchModules && patch.patchModules.length > 0 && (
            <div className="border-b border-gray-200">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 px-4 sm:px-8 py-3 sm:py-4 border-b border-primary-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Boxes className="h-4 sm:h-5 w-4 sm:w-5 text-primary-600" />
                Modules Used
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-normal text-gray-600">
                  ({patch.patchModules.length})
                </span>
              </h2>
            </div>
            <div className="p-4 sm:p-6 bg-gray-50/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                {patch.patchModules.map(({ module }) => (
                  <Link
                    key={module.id}
                    href={`/modules/${module.id}`}
                    className="bg-white border border-gray-200 rounded-lg hover:border-primary-400 hover:shadow-md transition-all duration-200 group flex overflow-hidden h-20"
                  >
                    {/* Module Info - Left Side */}
                    <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition text-sm truncate">
                        {module.name}
                      </h3>
                      <p className="text-xs text-gray-600 truncate">{module.manufacturer}</p>
                      {module.type && (
                        <span className="inline-block px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded text-[10px] w-fit mt-1 font-medium">
                          {module.type}
                        </span>
                      )}
                    </div>

                    {/* Module Image - Right Side (Portrait) */}
                    {module.images && module.images.length > 0 ? (
                      <div className="relative w-16 h-20 flex-shrink-0 bg-gray-100">
                        <Image
                          src={module.images[0]}
                          alt={module.name}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-20 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <Boxes className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
            </div>
          )}

          {/* Patch Schema */}
          {patch.schema && (
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Network className="h-4 sm:h-5 w-4 sm:w-5" />
              Patch Schema
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Visual diagram showing the signal flow and connections in this patch.
              <span className="block mt-1 text-xs">
                <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span> Audio 
                <span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-1 ml-2"></span> 1V/oct 
                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1 ml-2"></span> CV 
                <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-1 ml-2"></span> Gates/Triggers 
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1 ml-2"></span> Clock
              </span>
            </p>
            <div className="w-full">
              <PatchSchemaViewer schema={patch.schema} width={1200} height={800} />
            </div>
            </div>
          )}

          {/* Instructions */}
          {patch.instructions && (
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Instructions</h2>
              <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{patch.instructions}</p>
            </div>
          )}

          {/* Notes */}
          {patch.notes && (
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Notes</h2>
              <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{patch.notes}</p>
            </div>
          )}

          {/* Images */}
          {patch.images.length > 0 && (
            <div className="border-b border-gray-200">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 px-4 sm:px-8 py-3 sm:py-4 border-b border-primary-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="h-4 sm:h-5 w-4 sm:w-5 text-primary-600" />
                Images
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-normal text-gray-600">
                  ({patch.images.length})
                </span>
              </h2>
            </div>
            <div className="p-4 sm:p-6 bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {patch.images.map((image, idx) => (
                  <a
                    key={idx}
                    href={image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <img
                      src={image}
                      alt={`${patch.title} - Image ${idx + 1}`}
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-200 bg-white group-hover:border-primary-400 group-hover:shadow-lg transition-all duration-200"
                    />
                  </a>
                ))}
              </div>
            </div>
            </div>
          )}

          {/* Sounds */}
          {patch.sounds.length > 0 && (
            <div>
              <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 px-4 sm:px-8 py-3 sm:py-4 border-b border-primary-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Volume2 className="h-4 sm:h-5 w-4 sm:w-5 text-primary-600" />
                Audio Examples
                <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-normal text-gray-600">
                  ({patch.sounds.length})
                </span>
              </h2>
            </div>
            <div className="p-4 sm:p-6 bg-gray-50/50 space-y-3 sm:space-y-4">
              {patch.sounds.map((sound, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <HearthisEmbed url={sound} index={idx} />
                </div>
              ))}
            </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


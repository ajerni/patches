"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { HearthisEmbed } from "@/components/HearthisEmbed";
import { Edit, ArrowLeft, Music, Calendar, Tag, Image as ImageIcon, Volume2, Boxes } from "lucide-react";
import Image from "next/image";

interface Patch {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  notes?: string;
  tags: string[];
  images: string[];
  sounds: string[];
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

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{patch.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Updated {new Date(patch.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <span>•</span>
                <span>by {patch.user.name}</span>
              </div>
            </div>
            <Link
              href={`/patches/${patch.id}/edit`}
              className="flex items-center space-x-2 bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg transition"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Link>
          </div>

          {/* Tags */}
          {patch.tags.length > 0 && (
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {patch.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{patch.description}</p>
        </div>

        {/* Modules Used */}
        {patch.patchModules && patch.patchModules.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Boxes className="h-5 w-5" />
              Modules Used
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {patch.patchModules.map(({ module }) => (
                <Link
                  key={module.id}
                  href={`/modules/${module.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-md transition group"
                >
                  {/* Module Image */}
                  {module.images && module.images.length > 0 ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-gray-100">
                      <Image
                        src={module.images[0]}
                        alt={module.name}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg bg-gray-100 mb-3 flex items-center justify-center">
                      <Boxes className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Module Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition truncate">
                      {module.name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{module.manufacturer}</p>
                    {module.type && (
                      <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {module.type}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {patch.instructions && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{patch.instructions}</p>
          </div>
        )}

        {/* Notes */}
        {patch.notes && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{patch.notes}</p>
          </div>
        )}

        {/* Images */}
        {patch.images.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <ImageIcon className="h-5 w-5 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">Images</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="w-full h-64 object-cover rounded-lg group-hover:opacity-90 transition"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Sounds */}
        {patch.sounds.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Volume2 className="h-5 w-5 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">Audio Examples</h2>
            </div>
            <div className="space-y-4">
              {patch.sounds.map((sound, idx) => (
                <HearthisEmbed key={idx} url={sound} index={idx} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


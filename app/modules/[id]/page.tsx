"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Edit, ArrowLeft, Boxes, Calendar, Image as ImageIcon, Music } from "lucide-react";
import Image from "next/image";

interface Module {
  id: string;
  manufacturer: string;
  name: string;
  type?: string;
  notes?: string;
  images?: string[];
  patchModules?: Array<{
    patch: {
      id: string;
      title: string;
      description: string;
      tags: string[];
      images: string[];
    };
  }>;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function ModuleDetailPage({ params }: { params: { id: string } }) {
  const { status } = useSession();
  const router = useRouter();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchModule();
    }
  }, [status, params.id]);

  const fetchModule = async () => {
    try {
      const res = await fetch(`/api/modules/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setModule(data);
      } else {
        router.push("/modules");
      }
    } catch (error) {
      console.error("Failed to fetch module:", error);
      router.push("/modules");
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
            <Boxes className="h-12 w-12 text-primary-600 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading module...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!module) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/modules"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Modules</span>
        </Link>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Boxes className="h-8 w-8 text-white" />
                  <div>
                    <h1 className="text-3xl font-bold text-white">{module.name}</h1>
                    <p className="text-lg text-primary-50">{module.manufacturer}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-primary-50 mt-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Updated {new Date(module.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span>•</span>
                  <span>by {module.user.name}</span>
                </div>
              </div>
              <Link
                href={`/modules/${module.id}/edit`}
                className="flex items-center space-x-2 bg-white text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg transition font-medium"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>
            </div>

            {/* Type */}
            {module.type && (
              <div className="mt-3">
                <span className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                  {module.type}
                </span>
              </div>
            )}
          </div>

          {/* Images */}
          {module.images && module.images.length > 0 && (
            <div className="border-b border-gray-200">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 px-8 py-4 border-b border-primary-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary-600" />
                Images
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({module.images.length})
                </span>
              </h2>
            </div>
            <div className="p-6 bg-gray-50/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {module.images.map((imageUrl, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-white hover:border-primary-400 hover:shadow-lg transition-all duration-200 group"
                  >
                    <Image
                      src={imageUrl}
                      alt={`${module.name} - Image ${idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
            </div>
          )}

          {/* Notes */}
          {module.notes && (
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{module.notes}</p>
            </div>
          )}

          {/* Used in Patches */}
          {module.patchModules && module.patchModules.length > 0 && (
            <div className="border-b border-gray-200">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 px-8 py-4 border-b border-primary-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Music className="h-5 w-5 text-primary-600" />
                Used in Patches
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({module.patchModules.length})
                </span>
              </h2>
            </div>
            <div className="p-6 bg-gray-50/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {module.patchModules.map(({ patch }) => (
                  <Link
                    key={patch.id}
                    href={`/patches/${patch.id}`}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-lg transition-all duration-200 group"
                  >
                    {/* Patch Image */}
                    {patch.images && patch.images.length > 0 ? (
                      <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-gray-100">
                        <Image
                          src={patch.images[0]}
                          alt={patch.title}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 mb-3 flex items-center justify-center">
                        <Music className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Patch Info */}
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition line-clamp-2">
                        {patch.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{patch.description}</p>
                      {patch.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {patch.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {patch.tags.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              +{patch.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            </div>
          )}

          {/* Module Info */}
          <div className="px-8 py-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Module Information</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Manufacturer</dt>
                <dd className="mt-1 text-sm text-gray-900">{module.manufacturer}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Module Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{module.name}</dd>
              </div>
              {module.type && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{module.type}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Added</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(module.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}



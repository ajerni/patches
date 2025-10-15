"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Pagination } from "@/components/Pagination";
import { Plus, Search, Music, Edit, Trash2, Calendar, SortAsc, SortDesc, Heart } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Patch {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: string[];
  sounds: string[];
  private: boolean;
  createdAt: string;
  updatedAt: string;
  likeCount?: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [patches, setPatches] = useState<Patch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'date' | 'alphabetical' | 'likes'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchPatches();
    }
  }, [session]);

  const fetchPatches = async () => {
    try {
      const res = await fetch("/api/patches");
      if (res.ok) {
        const data = await res.json();
        setPatches(data);
      }
    } catch (error) {
      console.error("Failed to fetch patches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patch?")) return;

    try {
      const res = await fetch(`/api/patches/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPatches(patches.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete patch:", error);
    }
  };

  const filteredPatches = patches
    .filter((patch) =>
      patch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patch.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patch.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'alphabetical':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'likes':
          const aLikes = a.likeCount || 0;
          const bLikes = b.likeCount || 0;
          comparison = aLikes - bLikes;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Handle sort change
  const handleSortChange = (newSortBy: 'date' | 'alphabetical' | 'likes') => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  // Reset to page 1 when search term or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPatches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatches = filteredPatches.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Music className="h-12 w-12 text-primary-600 animate-pulse mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Patches</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Oganize your modular synthesis patch documentation
          </p>
        </div>

        {/* Search and Sort Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, tags, creators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Sort Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSortChange('date')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  sortBy === 'date'
                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Date</span>
                {sortBy === 'date' && (
                  sortOrder === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />
                )}
              </button>
              
              <button
                onClick={() => handleSortChange('alphabetical')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  sortBy === 'alphabetical'
                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>A-Z</span>
                {sortBy === 'alphabetical' && (
                  sortOrder === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />
                )}
              </button>
              
              <button
                onClick={() => handleSortChange('likes')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                  sortBy === 'likes'
                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart className="h-4 w-4" />
                <span>Most Liked</span>
                {sortBy === 'likes' && (
                  sortOrder === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-end mb-6">
          <Link
            href="/patches/new"
            className="flex items-center justify-center space-x-2 bg-primary-600 text-white hover:bg-primary-700 px-6 py-2 rounded-lg font-medium transition"
          >
            <Plus className="h-5 w-5" />
            <span>New Patch</span>
          </Link>
        </div>

        {/* Patches Grid */}
        {filteredPatches.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {patches.length === 0 ? "No patches yet" : "No patches found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {patches.length === 0
                ? "Start documenting your first Eurorack patch"
                : "Try adjusting your search"}
            </p>
            {patches.length === 0 && (
              <Link
                href="/patches/new"
                className="inline-flex items-center space-x-2 bg-primary-600 text-white hover:bg-primary-700 px-6 py-3 rounded-lg font-medium transition"
              >
                <Plus className="h-5 w-5" />
                <span>Create Your First Patch</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {paginatedPatches.map((patch) => (
              <div
                key={patch.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group"
              >
                <Link href={`/patches/${patch.id}`}>
                  {patch.images.length > 0 ? (
                    <div className="relative w-full h-48 overflow-hidden">
                      <Image
                        src={patch.images[0]}
                        alt={patch.title}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <Music className="h-16 w-16 text-primary-600" />
                    </div>
                  )}
                </Link>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {patch.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      patch.private 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {patch.private ? 'Private' : 'Public'}
                    </span>
                  </div>
                  <div className="text-gray-600 mb-4 line-clamp-2 prose prose-sm max-w-none prose-p:text-gray-600 prose-headings:text-gray-900 prose-ul:text-gray-600 prose-li:text-gray-600">
                    <ReactMarkdown>{patch.description}</ReactMarkdown>
                  </div>

                  {patch.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {patch.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {patch.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{patch.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Link
                      href={`/patches/${patch.id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      View Details
                    </Link>
                    <div className="flex space-x-2">
                      <Link
                        href={`/patches/${patch.id}/edit`}
                        className="p-2 text-gray-600 hover:text-primary-600 transition"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(patch.id)}
                        className="p-2 text-gray-600 hover:text-red-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredPatches.length}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </main>
    </div>
  );
}


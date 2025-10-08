"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Search, Music, Calendar, User, Tag, Loader2, SortAsc, SortDesc } from "lucide-react";

interface SharedPatch {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: string[];
  sounds: string[];
  private: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
  moduleCount: number;
  modules: Array<{
    id: string;
    name: string;
    manufacturer: string;
  }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

export default function SharedPatchesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [patches, setPatches] = useState<SharedPatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'date' | 'alphabetical'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [error, setError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch patches function
  const fetchPatches = useCallback(async (page: number = 1, reset: boolean = true, showLoading: boolean = true, searchQuery?: string) => {
    try {
      if (page === 1 && showLoading) {
        setLoading(true);
      } else if (page > 1) {
        setLoadingMore(true);
      } else if (page === 1 && !showLoading) {
        setSearching(true);
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy,
        sortOrder,
      });
      
      const query = searchQuery !== undefined ? searchQuery : searchTerm;
      if (query.trim()) {
        params.append('search', query.trim());
      }
      
      const response = await fetch(`/api/patches/shared?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch patches');
      }
      
      const data = await response.json();
      
      if (reset) {
        setPatches(data.patches);
      } else {
        setPatches(prev => [...prev, ...data.patches]);
      }
      
      setPagination(data.pagination);
      setError("");
    } catch (err) {
      console.error('Error fetching patches:', err);
      setError('Failed to load patches. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setSearching(false);
    }
  }, [sortBy, sortOrder]);

  // Initial load
  useEffect(() => {
    if (status === "authenticated") {
      fetchPatches(1, true);
    }
  }, [status, fetchPatches]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (status === "authenticated") {
        // Only show loading for initial load, not for search/sort changes
        const isInitialLoad = !searchTerm && sortBy === 'date' && sortOrder === 'desc';
        fetchPatches(1, true, isInitialLoad, searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, sortBy, sortOrder, status, fetchPatches]);

  // Load more patches
  const loadMore = () => {
    if (pagination?.hasMore && !loadingMore) {
      fetchPatches(pagination.page + 1, false);
    }
  };

  // Handle sort change
  const handleSortChange = (newSortBy: 'date' | 'alphabetical') => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading shared patches...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shared Patches</h1>
          <p className="text-gray-600">
            Discover amazing patches shared by the community
            {pagination && ` • ${pagination.totalCount} patches available`}
          </p>
        </div>

        {/* Search and Sort Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                {searching ? (
                  <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-600 animate-spin" />
                ) : (
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                )}
                <input
                  type="text"
                  placeholder="Search patches, tags, or creators..."
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
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Patches Grid */}
        {patches.length === 0 && !loading ? (
          <div className="text-center py-12">
            <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patches found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'Be the first to share a patch!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {patches.map((patch) => (
              <Link
                key={patch.id}
                href={`/patches/${patch.id}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group"
              >
                {/* Patch Image */}
                {patch.images.length > 0 ? (
                  <div className="relative w-full h-32 overflow-hidden">
                    <Image
                      src={patch.images[0]}
                      alt={patch.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <Music className="h-8 w-8 text-primary-600" />
                  </div>
                )}

                {/* Patch Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition">
                    {patch.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <User className="h-3 w-3" />
                    <span className="truncate">{patch.user.name}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {patch.description}
                  </p>

                  {/* Tags */}
                  {patch.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
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

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>🎵 {patch.moduleCount} modules</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(patch.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {pagination?.hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Patches'
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

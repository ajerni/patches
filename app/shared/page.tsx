"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { VirtualPatchGrid } from "@/components/VirtualPatchGrid";
import { Search, Music, Calendar, User, Tag, Loader2, SortAsc, SortDesc, Heart } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface SharedPatch {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: string[];
  sounds: string[];
  private: boolean;
  likeCount: number;
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

// Infinite scroll with virtual scrolling for large datasets
interface PaginationState {
  page: number;
  limit: number; // 20-50 items per page
  hasMore: boolean;
  total: number;
  nextCursor?: string | null;
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
  const [pagination, setPagination] = useState<PaginationState | null>(null);
  const [error, setError] = useState("");
  const [useVirtualScrolling, setUseVirtualScrolling] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [likedPatches, setLikedPatches] = useState<Set<string>>(new Set());
  const [likingPatches, setLikingPatches] = useState<Set<string>>(new Set());
  const [likesLoaded, setLikesLoaded] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch patches function
  const fetchPatches = useCallback(async (page: number = 1, reset: boolean = true, showLoading: boolean = true, searchQuery?: string, cursor?: string) => {
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
      
      // Use cursor for better performance with large datasets
      if (cursor) {
        params.append('cursor', cursor);
      }
      
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
               setLikesLoaded(false); // Reset likes loaded state for new patches
             } else {
               setPatches(prev => [...prev, ...data.patches]);
               setLikesLoaded(false); // Reset likes loaded state for new patches
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

  // Handle container dimensions and virtual scrolling decision
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Decide when to use virtual scrolling (when we have many patches)
  useEffect(() => {
    setUseVirtualScrolling(patches.length > 100);
  }, [patches.length]);

  // Initial load
  useEffect(() => {
    if (status === "authenticated") {
      fetchPatches(1, true);
    }
  }, [status, fetchPatches]);

  // Load user's existing likes
  const loadUserLikes = useCallback(async () => {
    if (status !== "authenticated" || likesLoaded) return;
    
    try {
      // Get all patch IDs from current patches
      const patchIds = patches.map(patch => patch.id);
      if (patchIds.length === 0) return;

      // Check like status for all patches
      const likePromises = patchIds.map(async (patchId) => {
        try {
          const response = await fetch(`/api/patches/${patchId}/like`);
          if (response.ok) {
            const data = await response.json();
            return { patchId, liked: data.liked };
          }
        } catch (error) {
          console.error(`Error checking like status for patch ${patchId}:`, error);
        }
        return { patchId, liked: false };
      });

      const likeResults = await Promise.all(likePromises);
      const likedPatchIds = likeResults
        .filter(result => result.liked)
        .map(result => result.patchId);

      setLikedPatches(new Set(likedPatchIds));
      setLikesLoaded(true);
    } catch (error) {
      console.error('Error loading user likes:', error);
      setLikesLoaded(true); // Set to true to prevent infinite retries
    }
  }, [status, patches, likesLoaded]);

  // Load user likes when patches are loaded
  useEffect(() => {
    if (status === "authenticated" && patches.length > 0) {
      loadUserLikes();
    }
  }, [status, patches, loadUserLikes]);

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

  // Load more patches using cursor-based pagination
  const loadMore = () => {
    if (pagination?.hasMore && !loadingMore && pagination?.nextCursor) {
      fetchPatches(pagination.page + 1, false, false, undefined, pagination.nextCursor);
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

  // Handle like/unlike
  const handleLike = async (patchId: string, isLiked: boolean) => {
    if (likingPatches.has(patchId)) return; // Prevent double-clicks
    
    setLikingPatches(prev => new Set(prev).add(patchId));
    
    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/patches/${patchId}/like`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      const data = await response.json();
      
      // Update the patch in the patches array
      setPatches(prev => prev.map(patch => 
        patch.id === patchId 
          ? { ...patch, likeCount: data.likeCount }
          : patch
      ));

      // Update liked patches set
      setLikedPatches(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.delete(patchId);
        } else {
          newSet.add(patchId);
        }
        return newSet;
      });

    } catch (error) {
      console.error('Error updating like status:', error);
      // You could show a toast notification here
    } finally {
      setLikingPatches(prev => {
        const newSet = new Set(prev);
        newSet.delete(patchId);
        return newSet;
      });
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
            {pagination && ` • ${pagination.total} patches available`}
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
                  placeholder="Search patches, tags, creators, or modules..."
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
          <div 
            ref={containerRef}
            className="w-full"
            style={{ height: useVirtualScrolling ? '600px' : 'auto' }}
          >
            {useVirtualScrolling ? (
              <VirtualPatchGrid
                patches={patches}
                hasNextPage={pagination?.hasMore || false}
                isNextPageLoading={loadingMore}
                loadNextPage={loadMore}
                width={containerDimensions.width}
                height={containerDimensions.height || 600}
                likedPatches={likedPatches}
                likingPatches={likingPatches}
                onLike={handleLike}
                likesLoaded={likesLoaded}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {patches.map((patch) => (
                  <div
                    key={patch.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group"
                  >
                    <Link href={`/patches/${patch.id}`} className="block">
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
                    </Link>

                    {/* Patch Info */}
                    <div className="p-4">
                      <Link href={`/patches/${patch.id}`} className="block">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition">
                          {patch.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <User className="h-3 w-3" />
                          <span className="truncate">{patch.user.name}</span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3 line-clamp-2 prose prose-sm max-w-none prose-p:text-gray-600 prose-headings:text-gray-900 prose-ul:text-gray-600 prose-li:text-gray-600">
                          <ReactMarkdown>{patch.description}</ReactMarkdown>
                        </div>
                      </Link>

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

                      {/* Footer with Like Button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <span>🎵 {patch.moduleCount} modules</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(patch.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        {/* Like Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLike(patch.id, likedPatches.has(patch.id));
                          }}
                          disabled={likingPatches.has(patch.id) || !likesLoaded}
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            !likesLoaded
                              ? 'bg-gray-50 text-gray-400'
                              : likedPatches.has(patch.id)
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          } ${(likingPatches.has(patch.id) || !likesLoaded) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <Heart 
                            className={`h-3 w-3 ${
                              likesLoaded && likedPatches.has(patch.id) ? 'fill-current' : ''
                            }`} 
                          />
                          <span>{patch.likeCount}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Load More Button - Only show when not using virtual scrolling */}
        {pagination?.hasMore && !useVirtualScrolling && (
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

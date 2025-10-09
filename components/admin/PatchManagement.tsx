'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  User,
  Heart,
  Package,
  Image,
  Volume2,
  Network,
  Tag,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface Patch {
  id: string;
  title: string;
  description: string;
  descriptionPreview: string;
  instructions: string | null;
  notes: string | null;
  tags: string[];
  images: string[];
  sounds: string[];
  private: boolean;
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  hasSchema: boolean;
  recentLikes: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    patchModules: number;
    likes: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface PatchesResponse {
  patches: Patch[];
  pagination: Pagination;
}

export function PatchManagement() {
  const [patches, setPatches] = useState<Patch[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [visibility, setVisibility] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [visibilityConfirm, setVisibilityConfirm] = useState<{id: string, title: string, private: boolean} | null>(null);

  useEffect(() => {
    fetchPatches();
  }, [currentPage, search, sortBy, sortOrder, visibility]);

  const fetchPatches = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search,
        sortBy,
        sortOrder,
        visibility
      });
      
      const response = await fetch(`/api/admin/patches?${params}`);
      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required');
        } else if (response.status === 403) {
          setError('Admin access required');
        } else {
          setError('Failed to load patches');
        }
        return;
      }
      
      const data: PatchesResponse = await response.json();
      setPatches(data.patches);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to load patches');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatch = async (patchId: string) => {
    try {
      const response = await fetch(`/api/admin/patches?patchId=${patchId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete patch');
        return;
      }
      
      // Refresh the patch list
      fetchPatches();
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete patch');
    }
  };

  const handleToggleVisibility = async (patchId: string, isPrivate: boolean) => {
    try {
      const response = await fetch('/api/admin/patches', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patchId,
          private: isPrivate
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update patch visibility');
        return;
      }
      
      // Refresh the patch list
      fetchPatches();
      setVisibilityConfirm(null);
    } catch (err) {
      setError('Failed to update patch visibility');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPatches();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && patches.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchPatches}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, description, tags, or user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Patches</option>
              <option value="public">Public Only</option>
              <option value="private">Private Only</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Last Updated</option>
              <option value="title">Title</option>
              <option value="likeCount">Likes</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
            <button
              type="submit"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Patches Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Patches ({pagination?.total || 0})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patches.map((patch) => (
                <tr key={patch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {patch.title}
                          </p>
                          {patch.private ? (
                            <EyeOff className="h-4 w-4 text-gray-400" title="Private" />
                          ) : (
                            <Eye className="h-4 w-4 text-green-500" title="Public" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {patch.descriptionPreview}
                        </p>
                        {patch.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {patch.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </span>
                            ))}
                            {patch.tags.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{patch.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{patch.user.name}</p>
                        <p className="text-sm text-gray-500">{patch.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center gap-4">
                        {patch.images.length > 0 && (
                          <div className="flex items-center">
                            <Image className="h-4 w-4 mr-1 text-blue-500" />
                            <span>{patch.images.length}</span>
                          </div>
                        )}
                        {patch.sounds.length > 0 && (
                          <div className="flex items-center">
                            <Volume2 className="h-4 w-4 mr-1 text-purple-500" />
                            <span>{patch.sounds.length}</span>
                          </div>
                        )}
                        {patch.hasSchema && (
                          <div className="flex items-center">
                            <Network className="h-4 w-4 mr-1 text-green-500" />
                            <span>Schema</span>
                          </div>
                        )}
                        {patch._count.patchModules > 0 && (
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-1 text-orange-500" />
                            <span>{patch._count.patchModules}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1 text-red-500" />
                        <span>{patch.likeCount}</span>
                      </div>
                      {patch.recentLikes > 0 && (
                        <div className="text-xs text-blue-500">
                          +{patch.recentLikes} this week
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(patch.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/patches/${patch.id}`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      <button
                        onClick={() => setVisibilityConfirm({
                          id: patch.id,
                          title: patch.title,
                          private: !patch.private
                        })}
                        className={`flex items-center ${
                          patch.private 
                            ? 'text-green-600 hover:text-green-900' 
                            : 'text-orange-600 hover:text-orange-900'
                        }`}
                      >
                        {patch.private ? (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Make Public
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Make Private
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(patch.id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 border border-gray-200 rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
              disabled={currentPage === pagination.pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(currentPage - 1) * pagination.limit + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pagination.limit, pagination.total)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{pagination.total}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                  disabled={currentPage === pagination.pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Patch</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this patch? This action cannot be undone and will permanently remove the patch and all its associated data.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleDeletePatch(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 mr-2"
                >
                  Delete Patch
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visibility Confirmation Modal */}
      {visibilityConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                {visibilityConfirm.private ? (
                  <Eye className="h-6 w-6 text-blue-600" />
                ) : (
                  <EyeOff className="h-6 w-6 text-blue-600" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                {visibilityConfirm.private ? 'Make Patch Private' : 'Make Patch Public'}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to make "{visibilityConfirm.title}" {visibilityConfirm.private ? 'private' : 'public'}?
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleToggleVisibility(visibilityConfirm.id, visibilityConfirm.private)}
                  className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 mr-2"
                >
                  {visibilityConfirm.private ? 'Make Private' : 'Make Public'}
                </button>
                <button
                  onClick={() => setVisibilityConfirm(null)}
                  className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

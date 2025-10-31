"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Pagination } from "@/components/Pagination";
import { Plus, Search, Music, Edit, Trash2, Boxes, Calendar, SortAsc, SortDesc } from "lucide-react";

interface Module {
  id: string;
  manufacturer: string;
  name: string;
  types?: string[];
  notes?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ModulesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'date' | 'alphabetical'>('date');
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
      fetchModules();
    }
  }, [session]);

  const fetchModules = async () => {
    try {
      const res = await fetch("/api/modules");
      if (res.ok) {
        const data = await res.json();
        setModules(data);
      }
    } catch (error) {
      console.error("Failed to fetch modules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return;

    try {
      const res = await fetch(`/api/modules/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setModules(modules.filter((m) => m.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete module:", error);
    }
  };

  const filteredModules = modules
    .filter((module) =>
      module.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.types?.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'alphabetical':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Handle sort change
  const handleSortChange = (newSortBy: 'date' | 'alphabetical') => {
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
  const totalPages = Math.ceil(filteredModules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedModules = filteredModules.slice(startIndex, endIndex);

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
            <Boxes className="h-12 w-12 text-primary-600 animate-pulse mx-auto mb-4" />
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Modules</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your module collection
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
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-end mb-6">
          <Link
            href="/modules/new"
            className="flex items-center justify-center space-x-2 bg-primary-600 text-white hover:bg-primary-700 px-6 py-2 rounded-lg font-medium transition"
          >
            <Plus className="h-5 w-5" />
            <span>Add Module</span>
          </Link>
        </div>

        {/* Modules List */}
        {filteredModules.length === 0 ? (
          <div className="text-center py-12">
            <Boxes className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {modules.length === 0 ? "No modules yet" : "No modules found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {modules.length === 0
                ? "Start building your Eurorack collection"
                : "Try adjusting your search"}
            </p>
            {modules.length === 0 && (
              <Link
                href="/modules/new"
                className="inline-flex items-center space-x-2 bg-primary-600 text-white hover:bg-primary-700 px-6 py-3 rounded-lg font-medium transition"
              >
                <Plus className="h-5 w-5" />
                <span>Add Your First Module</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
              {paginatedModules.map((module) => (
              <div
                key={module.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="flex">
                  {/* Module Info - Left Side */}
                  <div className="flex-1 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <Link href={`/modules/${module.id}`}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {module.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500 mb-2">{module.manufacturer}</p>
                        {module.types && module.types.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {module.types.slice(0, 2).map((type) => (
                              <span
                                key={type}
                                className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                              >
                                {type}
                              </span>
                            ))}
                            {module.types.length > 2 && (
                              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{module.types.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {module.notes && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                        {module.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t mt-auto">
                      <Link
                        href={`/modules/${module.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        View Details
                      </Link>
                      <div className="flex space-x-2">
                        <Link
                          href={`/modules/${module.id}/edit`}
                          className="p-2 text-gray-600 hover:text-primary-600 transition"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(module.id)}
                          className="p-2 text-gray-600 hover:text-red-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Module Image - Right Side (Portrait) */}
                  <Link href={`/modules/${module.id}`} className="flex-shrink-0 p-3">
                    {module.images && module.images.length > 0 ? (
                      <div className="relative w-24 sm:w-32 h-full bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={module.images[0]}
                          alt={module.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 sm:w-32 h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <Boxes className="h-8 sm:h-12 w-8 sm:w-12 text-gray-400" />
                      </div>
                    )}
                  </Link>
                </div>
              </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredModules.length}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </main>
    </div>
  );
}



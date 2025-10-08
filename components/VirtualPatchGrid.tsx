"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Music, Calendar, User } from 'lucide-react';

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

interface VirtualPatchGridProps {
  patches: SharedPatch[];
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  loadNextPage: () => void;
  width: number;
  height: number;
}

const PatchCard = ({ patch }: { patch: SharedPatch }) => (
  <div className="h-full p-2">
    <Link href={`/patches/${patch.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group h-full flex flex-col">
        {/* Image */}
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

        {/* Content */}
        <div className="p-3 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
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
          
          <p className="text-gray-600 text-xs mb-2 line-clamp-2 flex-1">
            {patch.description}
          </p>

          {/* Tags */}
          {patch.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {patch.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {patch.tags.length > 2 && (
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{patch.tags.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span className="truncate">{patch.user.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(patch.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  </div>
);

export function VirtualPatchGrid({ 
  patches, 
  hasNextPage, 
  isNextPageLoading, 
  loadNextPage, 
  width, 
  height 
}: VirtualPatchGridProps) {
  // Calculate responsive columns
  const getColumnsPerRow = (containerWidth: number) => {
    if (containerWidth < 640) return 1; // sm
    if (containerWidth < 768) return 2; // md
    if (containerWidth < 1024) return 3; // lg
    return 4; // xl+
  };

  const columnsPerRow = getColumnsPerRow(width);
  
  // Load more when scrolling near the end
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isNextPageLoading) {
      loadNextPage();
    }
  };

  return (
    <div 
      className="w-full overflow-auto"
      style={{ height: height }}
      onScroll={handleScroll}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 p-4">
        {patches.map((patch) => (
          <PatchCard key={patch.id} patch={patch} />
        ))}
      </div>
      
      {isNextPageLoading && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <span>Loading more patches...</span>
          </div>
        </div>
      )}
    </div>
  );
}

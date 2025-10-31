import React from "react";

export default function ProductSkeleton() {
  return (
    <article className="bg-white rounded-xl overflow-hidden animate-pulse">
      <div className="relative rounded-lg overflow-hidden bg-gray-200">
        <div className="w-full relative aspect-[11/10] md:h-[220px] bg-gray-300"></div>
        <span className="absolute top-3 right-3 bg-gray-300 text-xs px-3 py-1 rounded-full shadow h-6 w-12"></span>
      </div>

      <div className="relative mt-3 p-2">
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-300 rounded"></div>
          ))}
        </div>

        <div className="h-3 bg-gray-300 rounded mb-1 w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded mb-1 w-1/2"></div>

        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-300 rounded w-16"></div>
        </div>

        {/* Action buttons skeleton */}
        <div className="absolute top-0 right-2 h-full flex flex-col justify-between items-end px-1 z-50">
          <div className="bg-gray-300 p-3 rounded-full w-12 h-12"></div>
          <div className="bg-gray-300 p-3 rounded-full w-12 h-12"></div>
        </div>
      </div>
    </article>
  );
}

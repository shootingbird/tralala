import React from "react";
import ProductSkeleton from "./ProductSkeleton";

interface ProductGridSkeletonProps {
  count?: number;
  mobileGridSize?: number;
}

export default function ProductGridSkeleton({
  count = 12,
  mobileGridSize = 2,
}: ProductGridSkeletonProps) {
  return (
    <section className="max-w-[1300px] mx-auto px-4 md:px-6 py-6">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-32"></div>
      </div>

      {/* Products grid skeleton */}
      <div
        className={`grid gap-2 grid-cols-${mobileGridSize} sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`}
      >
        {Array.from({ length: count }).map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>

      {/* Cart button skeleton */}
      <div className="mt-6 flex justify-center">
        <div className="bg-gray-300 rounded-lg px-6 py-3 w-32 h-12"></div>
      </div>
    </section>
  );
}

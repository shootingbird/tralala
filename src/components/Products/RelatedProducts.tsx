"use client";

import { useGetRelatedProductsQuery } from "@/slices/products/productApiSlice";
import ProductGrid from "./ProductGrid";

interface RelatedProductsProps {
  productId: number;
  category: string;
  limit?: number;
}

export function RelatedProducts({
  productId,
  category,
  limit = 6,
}: RelatedProductsProps) {
  const { data, isLoading, error } = useGetRelatedProductsQuery({
    productId,
    category,
    limit,
  });

  if (isLoading) {
    return (
      <section className="mt-12 max-w-[1300px] mx-auto px-4 md:px-6 py-6">
        <h2 className="text-2xl font-semibold mb-6">
          Similar Items You Might Also Like
        </h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </section>
    );
  }

  if (error || !data?.products || data.products.length === 0) {
    return null; // Don't show the section if there are no related products
  }

  return (
    <ProductGrid
      title="Similar Items You Might Also Like"
      products={data.products}
      showHead={true}
      mobileGridSize={2}
    />
  );
}

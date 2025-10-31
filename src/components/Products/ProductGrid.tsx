"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import clsx from "clsx";
import ProductCard from "./ProductCard";
import ProductGridHeader from "./ProductGridHeader";
import CartButton from "./CartButton";
import { Product } from "@/types/product";

type ProductGridProp = {
  title: string;
  mobileGridSize?: number; // number of columns on mobile (1..6)
  products: Product[];
  showHead?: boolean;
  // Infinite scroll props
  isInfiniteScroll?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
};

const ALLOWED_MOBILE_COLUMNS = [1, 2, 3, 4, 5, 6] as const;
type AllowedCols = (typeof ALLOWED_MOBILE_COLUMNS)[number];

const gridColsMap: Record<AllowedCols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

export default function ProductGrid({
  title,
  mobileGridSize = 2,
  products,
  showHead = true,
  isInfiniteScroll = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: ProductGridProp) {
  const [wishlist, setWishlist] = useState<Record<number, boolean>>({});
  const [cartCount, setCartCount] = useState(3);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Ensure the provided size is an allowed one; fallback to 2
  const safeMobileGridSize = ALLOWED_MOBILE_COLUMNS.includes(
    mobileGridSize as AllowedCols
  )
    ? (mobileGridSize as AllowedCols)
    : 2;

  function toggleWishlist(id: number) {
    setWishlist((s) => ({ ...s, [id]: !s[id] }));
  }

  function addToCart(id: number) {
    setCartCount((c) => c + 1);
  }

  // Infinite scroll logic
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        hasNextPage &&
        !isFetchingNextPage &&
        onLoadMore
      ) {
        onLoadMore();
      }
    },
    [hasNextPage, isFetchingNextPage, onLoadMore]
  );

  useEffect(() => {
    if (!isInfiniteScroll || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "100px",
    });

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [handleIntersection, isInfiniteScroll]);

  return (
    <section className="max-w-[1300px] mx-auto px-2 md:px-6  md:py-6">
      {showHead ? <ProductGridHeader title={title} /> : null}

      <div
        className={clsx(
          "grid gap-x-1",
          // mobile columns (from map) — these are concrete classes Tailwind can detect at build time
          gridColsMap[safeMobileGridSize],
          // responsive behaviour uses static classes so Tailwind picks them up too
          "sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        )}
      >
        {products.map((product, index: number) => (
          <ProductCard
            key={`${product.productId}-${index}`}
            product={product}
            onToggleWishlist={toggleWishlist}
            index={index}
            isGrid={true}
          />
        ))}
      </div>

      {/* Infinite scroll loading indicator */}
      {isInfiniteScroll && isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Sentinel element for intersection observer */}
      {isInfiniteScroll && hasNextPage && (
        <div ref={loadMoreRef} className="h-4" />
      )}
    </section>
  );
}

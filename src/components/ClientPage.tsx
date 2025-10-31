"use client";

import Header from "@/components/shared/Header";
import MegaMenuPage from "@/components/shared/MegaMenu";
import React, { useState, useRef, useEffect } from "react";
import ProductGrid from "@/components/Products/ProductGrid";
import ProductSlider from "./Products/ProductSlider";
import ProductGridSkeleton from "@/components/Products/ProductGridSkeleton";
import { useDetectScreen } from "../../hooks/useDetectScreen";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import Banner from "./HomeScreen/Banner";
import { useGetExploreProductsQuery } from "@/slices/products/productApiSlice";
import { fetchProducts } from "@/lib/api/products";
import { Product } from "@/types/product";

const ClientPage = () => {
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [explorePage, setExplorePage] = useState(1);
  const megaMenuRef = useRef<HTMLDivElement | null>(null);
  useDetectScreen();

  const isMobile = useSelector((state: RootState) => state.screen.isMobile);
  const isDesktop = useSelector((state: RootState) => state.screen.isDesktop);

  // RTK Query for explore products with infinite scroll
  const {
    data: exploreData,
    isLoading: isExploreLoading,
    isFetching: isExploreFetching,
  } = useGetExploreProductsQuery(
    { page: explorePage, per_page: 50 },
    {
      refetchOnMountOrArgChange: false,
    }
  );

  const exploreProducts = exploreData?.products || [];
  const hasNextPage = exploreData?.pagination.has_next || false;

  const loadMoreExploreProducts = () => {
    if (hasNextPage && !isExploreFetching) {
      setExplorePage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const response = await fetchProducts({
          has_images: true,
          per_page: 12,
        });
        setFeaturedProducts(response.products);
      } catch (error) {
        console.error("Failed to load featured products:", error);
        // No fallback - show empty state or error
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!megaMenuRef.current) return;
      if (
        !megaMenuRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest("[data-menu-toggle]")
      )
        setShowMegaMenu(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  return (
    <div className="mt-24 ">
      <div className="fixed top-0 right-0 left-0  z-50">
        <Header onCategoryClick={setShowMegaMenu} />
      </div>

      {showMegaMenu ? (
        <div ref={megaMenuRef}>
          <MegaMenuPage onClose={() => setShowMegaMenu(false)} />
        </div>
      ) : null}

      {isMobile ? (
        <div>
          {loading ? (
            <>
              <div className="px-4 py-4">
                <div className="h-6 bg-gray-300 rounded w-32 mb-4 animate-pulse"></div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-200 rounded-lg aspect-[11/10] animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="px-4 py-4">
                <div className="h-6 bg-gray-300 rounded w-32 mb-4 animate-pulse"></div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-200 rounded-lg aspect-[11/10] animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            </>
          ) : featuredProducts.length > 0 ? (
            <>
              <ProductSlider
                title={"New Arrival"}
                mobileGridSize={3}
                products={featuredProducts}
                showNavigationButtons={false}
              />
              <ProductSlider
                title={"Top Picks"}
                mobileGridSize={3}
                products={featuredProducts}
                showNavigationButtons={false}
              />
            </>
          ) : (
            <div className="px-4 py-4 text-center">
              <p className="text-gray-500">No products available</p>
            </div>
          )}
        </div>
      ) : null}

      {isDesktop ? (
        <div>
          {loading ? (
            <>
              <ProductGridSkeleton count={6} />
              <ProductGridSkeleton count={6} />
            </>
          ) : featuredProducts.length > 0 ? (
            <>
              <ProductSlider
                title={"New Arrival"}
                mobileGridSize={4}
                products={featuredProducts}
                showNavigationButtons={true}
              />
              <ProductSlider
                title={"Top Picks"}
                mobileGridSize={4}
                products={featuredProducts}
                showNavigationButtons={true}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No products available</p>
            </div>
          )}
        </div>
      ) : null}

      <Banner />

      {isExploreLoading && explorePage === 1 ? (
        <ProductGridSkeleton count={12} />
      ) : exploreProducts.length > 0 ? (
        <ProductGrid
          title={"Explore Products"}
          products={exploreProducts}
          mobileGridSize={2}
          showHead={false}
          isInfiniteScroll={true}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isExploreFetching}
          onLoadMore={loadMoreExploreProducts}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No products available</p>
        </div>
      )}
    </div>
  );
};

export default ClientPage;

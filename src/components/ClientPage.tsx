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
import Link from "next/link";
import Image from "next/image";

const ClientPage = () => {
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [newArrivalProducts, setNewArrivalProducts] = useState<Product[]>([]);
  const [topPickProducts, setTopPickProducts] = useState<Product[]>([]);
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
    const loadProducts = async () => {
      try {
        // Load new arrivals
        const newArrivalResponse = await fetchProducts({
          has_images: true,
          per_page: 12,
          filter: "newest",
        });
        setNewArrivalProducts(newArrivalResponse.products);

        // Load top picks
        const topPickResponse = await fetchProducts({
          has_images: true,
          per_page: 12,
          filter: "top",
        });
        setTopPickProducts(topPickResponse.products);
      } catch (error) {
        console.error("Failed to load products:", error);
        // Set empty arrays on error
        setNewArrivalProducts([]);
        setTopPickProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
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
    <div className="">
      {/* Logo - only show on mobile and outside sticky container */}
      {isMobile && (
        <div className="px-4 py-2 bg-white">
          <Link href={"/"} className="flex items-center w-48">
            <Image
              src="/logo-transparent.png"
              alt="Steadfast"
              width={200}
              height={50}
              priority
              className="object-contain w-25 h-8"
            />
          </Link>
        </div>
      )}

      {/* Sticky header container */}
      <div className="sticky top-0 right-0 left-0 z-50">
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
          ) : newArrivalProducts.length > 0 || topPickProducts.length > 0 ? (
            <>
              {newArrivalProducts.length > 0 && (
                <ProductSlider
                  title={"New Arrival"}
                  mobileGridSize={3}
                  products={newArrivalProducts}
                  showNavigationButtons={false}
                />
              )}
              {topPickProducts.length > 0 && (
                <ProductSlider
                  title={"Top Picks"}
                  mobileGridSize={3}
                  products={topPickProducts}
                  showNavigationButtons={false}
                />
              )}
            </>
          ) : (
            <div className="px-4 py-4 text-center">
              <p className="text-gray-500">No products available</p>
            </div>
          )}
        </div>
      ) : null}

      {isDesktop ? (
        <div className="">
          {loading ? (
            <>
              <ProductGridSkeleton count={6} />
              <ProductGridSkeleton count={6} />
            </>
          ) : newArrivalProducts.length > 0 || topPickProducts.length > 0 ? (
            <>
              {newArrivalProducts.length > 0 && (
                <ProductSlider
                  title={"New Arrival"}
                  mobileGridSize={5}
                  products={newArrivalProducts}
                  showNavigationButtons={true}
                />
              )}
              {topPickProducts.length > 0 && (
                <ProductSlider
                  title={"Top Picks"}
                  mobileGridSize={5}
                  products={topPickProducts}
                  showNavigationButtons={true}
                />
              )}
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

// components/product/ProductGrid.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  Fragment,
} from "react";
import { X } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { ProductFilter, FilterOption } from "./ProductFilter";
import { Pagination } from "@/components/common/Pagination";
import { Breadcrumb } from "../ui/Breadcrumb";
import { NoProducts } from "../ui/NoProducts";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination as SwiperPagination } from "swiper/modules";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

type FilterValue = string[] | number[] | { min?: number; max?: number };

interface Product {
  productId: string;
  title: string;
  brand: string;
  price: number;
  rating: number;
  category: string;
  image: string;
  images: string[];
  stock: number;
  isNew?: boolean;
  discount?: {
    amount: number;
    percentage: number;
  };
  variations?: {
    price: number;
    quantity: number;
    variation: string;
  }[];
  [k: string]: any;
}

interface ProductGridProps {
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  enableSales?: boolean;
  products?: Product[]; // fallback client-driven data
  filters?: FilterOption[]; // optional UI only
  onFilterChange?: (filters: Record<string, FilterValue>) => void; // forwarded to parent
  isLoading?: boolean;
  maxRecord?: number;
  emptyState?: React.ReactNode;
  breadCrumb?: { label: string; href?: string }[];
  infiniteScroll?: boolean;
  enablePagination?: boolean;
  scrollonmobile?: boolean;

  // Server-driven infinite scroll:
  apiEndpoint?: string; // full endpoint (may include query string)
  perPage?: number; // per_page to use (overrides any existing per_page in apiEndpoint)
  resetKey?: unknown; // when this changes, reset to page 1
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  title,
  subtitle,
  viewAllLink,
  products = [],
  enableSales = true,
  filters,
  breadCrumb,
  onFilterChange,
  isLoading = true,
  maxRecord = 12,
  infiniteScroll = false,
  enablePagination = true,
  scrollonmobile = false,
  apiEndpoint,
  perPage = 12,
  resetKey,
}) => {
  // UI filter drawer state (only for rendering ProductFilter if provided)
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Loading states
  const [loading, setLoading] = useState<boolean>(isLoading);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // ----- Client-side (prop-driven) state fallback -----
  const [displayedProductsFromProp, setDisplayedProductsFromProp] = useState<
    Product[]
  >([]);

  // ----- Server-driven state -----
  const [items, setItems] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // sentinel & abort refs
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // callback-ref state for sentinel element (ensures observer created only when DOM node exists)
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Refs to avoid stale closures inside observer callback
  const currentPageRef = useRef<number>(currentPage);
  const hasMoreRef = useRef<boolean>(hasMore);
  const loadingMoreRef = useRef<boolean>(loadingMore);

  // totalPages for fallback pagination (client-driven)
  const totalPages = Math.ceil(products.length / (maxRecord || 1));

  // sync refs whenever relevant state changes
  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  // -------------- Helpers --------------

  /**
   * Build a fetch URL for a given page based on the provided apiEndpoint.
   * - Accepts absolute or relative apiEndpoint.
   * - Preserves existing query params, but *overwrites* page & per_page.
   */
  const buildUrlForPage = useCallback(
    (page: number) => {
      if (!apiEndpoint) {
        // fallback: use a relative endpoint constructed from initialQueryParams (none here)
        throw new Error("apiEndpoint is required for server-driven mode");
      }

      // Build absolute URL using window.location.origin if apiEndpoint is relative
      let url: URL;
      try {
        url = new URL(apiEndpoint);
      } catch (e) {
        // relative URL
        url = new URL(apiEndpoint, window.location.origin);
      }

      // Ensure page & per_page are set to requested values
      url.searchParams.set("page", String(page));
      url.searchParams.set("per_page", String(perPage));

      return url.toString();
    },
    [apiEndpoint, perPage]
  );

  /**
   * Parse a flexible backend response into products array and hasMore flag.
   */
  const parseResponse = useCallback(
    (data: any, page: number, perPageNum: number) => {
      const productsArray: Product[] =
        data?.products ?? data?.items ?? (Array.isArray(data) ? data : []);

      let hasMoreFlag = false;
      if (data?.meta?.has_more !== undefined) {
        hasMoreFlag = Boolean(data.meta.has_more);
      } else if (data?.pagination?.has_next !== undefined) {
        hasMoreFlag = Boolean(data.pagination.has_next);
      } else if (data?.total !== undefined) {
        const total = Number(data.total);
        hasMoreFlag = page * perPageNum < total;
      } else if (Array.isArray(productsArray)) {
        // fallback: if returned items length equals perPage, likely there are more
        hasMoreFlag = productsArray.length === perPageNum;
      }

      return { productsArray, hasMoreFlag };
    },
    []
  );

  // -------------- Fetching --------------

  const fetchPage = useCallback(
    async (pageToFetch: number, append = true) => {
      if (!apiEndpoint || !isMountedRef.current) return;

      // guard: don't trigger duplicate fetch for same page if already loading
      if (loadingMoreRef.current && append) return;

      setLoadingMore(true);

      // Abort previous request
      try {
        abortRef.current?.abort();
      } catch (e) {
        // ignore
      }
      const controller = new AbortController();
      abortRef.current = controller;
      const signal = controller.signal;

      try {
        const url = buildUrlForPage(pageToFetch);
        const res = await fetch(url, { signal });
        if (!res.ok) {
          throw new Error(`Fetch failed: ${res.status}`);
        }
        const data = await res.json();

        const { productsArray, hasMoreFlag } = parseResponse(
          data,
          pageToFetch,
          perPage
        );

        if (!isMountedRef.current) return;

        setItems((prev) =>
          append ? [...prev, ...productsArray] : productsArray
        );
        setHasMore(hasMoreFlag);
        setCurrentPage(pageToFetch);

        // keep the refs in sync immediately
        currentPageRef.current = pageToFetch;
        hasMoreRef.current = hasMoreFlag;
      } catch (err: any) {
        if (err?.name === "AbortError") {
          // aborted - fine
        } else {
          console.error("ProductGrid fetch error:", err);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [apiEndpoint, buildUrlForPage, parseResponse, perPage]
  );

  // -------------- Initialize / Reset behavior --------------

  // client-driven fallback: show slice of provided products
  useEffect(() => {
    if (!infiniteScroll) {
      setLoading(false);
      setDisplayedProductsFromProp(products.slice(0, maxRecord));
    }
  }, [products, maxRecord, infiniteScroll]);

  // when apiEndpoint / perPage / infiniteScroll changes — fetch first page
  useEffect(() => {
    if (!infiniteScroll || !apiEndpoint) return;
    setLoading(true);
    setItems([]);
    setHasMore(true);
    setCurrentPage(1);
    // also sync refs
    currentPageRef.current = 1;
    hasMoreRef.current = true;
    void fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint, perPage, infiniteScroll]);

  // Reset when resetKey changes (parent signals new filters / new apiEndpoint)
  useEffect(() => {
    if (!infiniteScroll || !apiEndpoint) return;

    // cancel pending fetch, reset items and fetch page 1
    try {
      abortRef.current?.abort();
    } catch (e) {
      // ignore
    }
    setItems([]);
    setHasMore(true);
    setLoading(true);
    setCurrentPage(1);

    // sync refs immediately
    currentPageRef.current = 1;
    hasMoreRef.current = true;

    void fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, apiEndpoint, infiniteScroll, perPage]);

  // -------------- IntersectionObserver for infinite scroll --------------
  useEffect(() => {
    if (!infiniteScroll || !apiEndpoint) return;

    const el = sentinelEl;
    if (!el) return;

    // disconnect previous observer if any
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          // use refs for latest state to avoid stale closures
          if (
            hasMoreRef.current &&
            !loadingMoreRef.current &&
            isMountedRef.current
          ) {
            const nextPage = currentPageRef.current + 1;
            // guard: only request if nextPage is sensible
            if (nextPage > 0) {
              void fetchPage(nextPage, true);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0.1,
      }
    );

    observer.observe(el);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelEl, fetchPage, infiniteScroll, apiEndpoint]);

  // cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      try {
        abortRef.current?.abort();
      } catch (e) {
        // ignore
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // -------------- Filter UI forwarding -------------f-
  // ProductGrid will render ProductFilter if `filters` prop is provided,
  // but it will *not* perform client-side filtering — only forward the event to the parent.
  const handleFilterChange = (filtersObj: Record<string, FilterValue>) => {
    // forward to parent so parent can build a new apiEndpoint and update props
    onFilterChange?.(filtersObj);
  };

  // Decide what list to render depending on mode
  const renderList =
    infiniteScroll && apiEndpoint ? items : displayedProductsFromProp;

  console.log(renderList);

  // -------------- Render --------------
  return (
    <section className="space-y-4 md:space-y-6 py-4 md:py-[2rem] relative">
      <div className="container mx-auto px-2 sm:px-2 md:px-4 lg:px-6">
        {breadCrumb && <Breadcrumb items={breadCrumb} />}

        {(title || subtitle || filters) && (
          <div className="flex flex-row justify-between items-center mb-4 sm:mb-5 gap-3 sm:gap-0">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 className="text-xl sm:text-lg font-bold sm:font-semibold text-gray-900 leading-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm sm:text-sm text-gray-600 mt-1 sm:mt-1 line-clamp-2 max-w-none sm:max-w-sm">
                  {subtitle}
                </p>
              )}
            </div>

            {filters && (
              <div className="flex justify-end sm:justify-start">
                <button
                  onClick={() => setIsFilterOpen((s) => !s)}
                  className="flex items-center justify-center gap-2 text-sm py-2.5 px-4 sm:py-2 sm:px-4 rounded-full bg-[#EDF0F8] md:bg-transparent border border-[#EDF0F8] hover:border-gray-300 transition-colors min-h-[44px] sm:min-h-0"
                  aria-label="Open filters"
                >
                  <div className="hidden md:flex items-center">
                    <span>Filters</span>
                    <svg
                      className="w-4 h-4 ml-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  <div className="md:hidden flex items-center">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.75 7.75V13.5C8.75 13.6989 8.67098 13.8897 8.53033 14.0303C8.38968 14.171 8.19891 14.25 8 14.25C7.80109 14.25 7.61032 14.171 7.46967 14.0303C7.32902 13.8897 7.25 13.6989 7.25 13.5V7.75C7.25 7.55109 7.32902 7.36032 7.46967 7.21967C7.61032 7.07902 7.80109 7 8 7C8.19891 7 8.38968 7.07902 8.53033 7.21967C8.67098 7.36032 8.75 7.55109 8.75 7.75ZM12.5 12C12.3011 12 12.1103 12.079 11.9697 12.2197C11.829 12.3603 11.75 12.5511 11.75 12.75V13.5C11.75 13.6989 11.829 13.8897 11.9697 14.0303C12.1103 14.171 12.3011 14.25 12.5 14.25C12.6989 14.25 12.8897 14.171 13.0303 14.0303C13.171 13.8897 13.25 13.6989 13.25 13.5V12.75C13.25 12.5511 13.171 12.3603 13.0303 12.2197C12.8897 12.079 12.6989 12 12.5 12ZM14 9.5H13.25V2.5C13.25 2.30109 13.171 2.11032 13.0303 1.96967C12.8897 1.82902 12.6989 1.75 12.5 1.75C12.3011 1.75 12.1103 1.82902 11.9697 1.96967C11.829 2.11032 11.75 2.30109 11.75 2.5V9.5H11C10.8011 9.5 10.6103 9.57902 10.4697 9.71967C10.329 9.86032 10.25 10.0511 10.25 10.25C10.25 10.4489 10.329 10.6397 10.4697 10.7803C10.6103 10.921 10.8011 11 11 11H14C14.1989 11 14.3897 10.921 14.5303 10.7803C14.671 10.6397 14.75 10.4489 14.75 10.25C14.75 10.05109 14.671 9.86032 14.5303 9.71967C14.3897 9.57902 14.1989 9.5 14 9.5Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="ml-2 font-medium">Filters</span>
                  </div>
                </button>
              </div>
            )}
            {viewAllLink && (
              <a
                href={viewAllLink}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
              >
                View All
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {filters && isFilterOpen && (
            <div className="hidden md:block w-full md:w-64 flex-shrink-0">
              <ProductFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                activeFilters={{}}
              />
            </div>
          )}

          {filters && isFilterOpen && (
            <>
              {/* Backdrop */}
              <div
                className="md:hidden fixed inset-0 bg-black/50 bg-opacity-50 z-40"
                onClick={() => setIsFilterOpen(false)}
              />
              {/* Mobile Filter Sidebar */}
              <div className="md:hidden fixed top-0 left-0 h-full w-80 bg-white z-50 overflow-y-auto shadow-lg">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Filters
                  </h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Close filters"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="p-4 pb-6">
                  <ProductFilter
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    activeFilters={{}}
                    onApply={() => setIsFilterOpen(false)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="block w-full flex-1 min-w-0">
            {(!loading && renderList.length === 0) ||
            (!infiniteScroll && products.length === 0 && !isLoading) ? (
              <NoProducts />
            ) : (
              <>
                {/* Mobile Swiper - Always show on mobile when scrollonmobile is true */}
                {scrollonmobile && (
                  <div className="block md:hidden">
                    {loading && renderList.length === 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={index}
                            className="animate-pulse bg-gray-200 rounded-lg h-[280px] w-full"
                          />
                        ))}
                      </div>
                    ) : renderList.length > 0 ? (
                      <Swiper
                        modules={[Navigation, SwiperPagination]}
                        spaceBetween={5}
                        slidesPerView={3}
                        navigation={{
                          nextEl: ".custom-next",
                          prevEl: ".custom-prev",
                        }}
                        className="relative mySwiper"
                      >
                        {renderList.map((product, index) => (
                          <SwiperSlide key={product.productId ?? index}>
                            <ProductCard
                              {...product}
                              brand={product.brand || "Unknown Brand"}
                              category={product.category || "General"}
                              image={
                                product.image ||
                                product.images?.[0] ||
                                "/logo.png"
                              }
                            />
                          </SwiperSlide>
                        ))}

                        {/* Custom Navigation Buttons */}
                        <button className="custom-prev absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-md hover:bg-gray-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>

                        <button className="custom-next absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-white p-3 shadow-md hover:bg-gray-100">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </Swiper>
                    ) : (
                      <NoProducts />
                    )}
                  </div>
                )}

                {/* Desktop Grid - Show on desktop, or on mobile if scrollonmobile is false */}
                <div
                  className={`${
                    scrollonmobile ? "hidden md:grid" : "grid"
                  } grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 ${
                    isFilterOpen
                      ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                  } gap-x-1 gap-y-3 sm:gap-x-2 sm:gap-y-3 md:gap-6`}
                >
                  {loading && renderList.length === 0
                    ? Array.from({ length: perPage }).map((_, index) => (
                        <div
                          key={index}
                          className="animate-pulse bg-gray-200 rounded-[1rem] h-[20rem] md:h-[25rem]"
                        />
                      ))
                    : renderList.map((product, index) => (
                        <ProductCard
                          key={product.productId ?? index}
                          enableSales={enableSales}
                          {...product}
                          brand={product.category || "Unknown Brand"}
                          category={product.category || "General"}
                          image={
                            product.image || product.images?.[0] || "/logo.png"
                          }
                        />
                      ))}
                </div>

                {/* server-driven sentinel + loading */}
                {infiniteScroll && apiEndpoint && (
                  <Fragment>
                    {loadingMore && (
                      <div className="mt-8 flex flex-col items-center justify-center gap-2">
                        <p className="text-gray-600">Fetching...</p>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                      </div>
                    )}
                    {/* callback ref ensures sentinelEl is set only when in DOM */}
                    <div
                      ref={(el) => {
                        setSentinelEl(el);
                        sentinelRef.current = el;
                      }}
                      className="h-6"
                    />
                    {!hasMore && !loadingMore && items.length > 0 && (
                      <p className="mt-6 text-center text-gray-500">
                        No more products
                      </p>
                    )}
                  </Fragment>
                )}

                {/* fallback client-side pagination */}
                {!infiniteScroll && enablePagination && totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(p) => {
                      setCurrentPage(p);
                      // update displayedProductsFromProp slice
                      const start = (p - 1) * maxRecord;
                      setDisplayedProductsFromProp(
                        products.slice(start, start + maxRecord)
                      );
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;

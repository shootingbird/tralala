"use client";
import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { ProductFilter, FilterOption } from "./ProductFilter";
import { Pagination } from "@/components/common/Pagination";
import { Breadcrumb } from "../ui/Breadcrumb";
import { NoProducts } from "../ui/NoProducts";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination as SwiperPagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

type FilterValue = string[] | number[] | { min?: number; max?: number };

interface ProductGridProps {
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  enableSales?: boolean;
  products: Array<{
    productId: string;
    title: string;
    brand: string;
    price: number;
    rating: number;
    category: string;
    image: string;
    images: string[];
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
  }>;
  filters?: FilterOption[];
  onFilterChange?: (filters: Record<string, FilterValue>) => void;
  isLoading?: boolean;
  maxRecord?: number;
  emptyState?: React.ReactNode;
  breadCrumb?: {
    label: string;
    href?: string;
  }[];
  infiniteScroll?: boolean;
  enablePagination?: boolean;
  scrollonmobile?: boolean;
}

export const ProductGrid = ({
  title,
  subtitle,
  viewAllLink,
  products,
  enableSales = true,
  filters,
  breadCrumb,
  onFilterChange,
  isLoading = true,
  maxRecord = 12,
  infiniteScroll = false,
  enablePagination = true,
  scrollonmobile = false,
}: ProductGridProps) => {
  const [activeFilters, setActiveFilters] = useState<
    Record<string, FilterValue>
  >({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setIsLoading] = useState(isLoading);
  const [displayedProducts, setDisplayedProducts] = useState<typeof products>(
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const totalPages = Math.ceil(products.length / maxRecord);

  useEffect(() => {
    if (products && products.length > 0) {
      setIsLoading(false);
      setDisplayedProducts(products.slice(0, maxRecord));
      setCurrentIndex(maxRecord);
      setHasMore(products.length > maxRecord);
    }
  }, [products, maxRecord]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !infiniteScroll) return;

    setLoadingMore(true);
    // Simulate API fetch delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const nextIndex = currentIndex + maxRecord;
    const newProducts = products.slice(currentIndex, nextIndex);

    setDisplayedProducts((prev) => [...prev, ...newProducts]);
    setCurrentIndex(nextIndex);
    setHasMore(nextIndex < products.length);
    setLoadingMore(false);
  }, [currentIndex, hasMore, loadingMore, products, maxRecord, infiniteScroll]);

  useEffect(() => {
    if (!infiniteScroll) return;

    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const scrollThreshold = document.documentElement.scrollHeight * 0.8;

      if (scrollPosition >= scrollThreshold) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore, infiniteScroll]);

  const handleFilterChange = (filterId: string, value: FilterValue) => {
    const newFilters = {
      ...activeFilters,
      [filterId]: value,
    };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <section className="space-y-4  md:py-[2rem] relative">
      <div className="container mx-auto px-3    md:pt-0">
        {breadCrumb && <Breadcrumb items={breadCrumb} />}

        {(title || subtitle || filters) && (
          <div className="flex justify-between mb-5 items-center">
            <div>
              {title && <h2 className="text-lg  font-semibold">{title}</h2>}
              {subtitle && (
                <p className="text-sm max-w-sm line-clamp-2 text-gray-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {filters && (
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 text-sm py-2 px-2 md:py-2 md:px-4 rounded-full bg-[#EDF0F8] md:bg-transparent border border-[#EDF0F8] hover:border-gray-300"
              >
                <div className="hidden md:flex">
                  <span className="hidden md:flex">
                    {Array.isArray(activeFilters["popularity"])
                      ? activeFilters["popularity"][0]
                      : "Most Popular"}
                  </span>

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
                <span className="md:hidden">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.75 7.75V13.5C8.75 13.6989 8.67098 13.8897 8.53033 14.0303C8.38968 14.171 8.19891 14.25 8 14.25C7.80109 14.25 7.61032 14.171 7.46967 14.0303C7.32902 13.8897 7.25 13.6989 7.25 13.5V7.75C7.25 7.55109 7.32902 7.36032 7.46967 7.21967C7.61032 7.07902 7.80109 7 8 7C8.19891 7 8.38968 7.07902 8.53033 7.21967C8.67098 7.36032 8.75 7.55109 8.75 7.75ZM12.5 12C12.3011 12 12.1103 12.079 11.9697 12.2197C11.829 12.3603 11.75 12.5511 11.75 12.75V13.5C11.75 13.6989 11.829 13.8897 11.9697 14.0303C12.1103 14.171 12.3011 14.25 12.5 14.25C12.6989 14.25 12.8897 14.171 13.0303 14.0303C13.171 13.8897 13.25 13.6989 13.25 13.5V12.75C13.25 12.5511 13.171 12.3603 13.0303 12.2197C12.8897 12.079 12.6989 12 12.5 12ZM14 9.5H13.25V2.5C13.25 2.30109 13.171 2.11032 13.0303 1.96967C12.8897 1.82902 12.6989 1.75 12.5 1.75C12.3011 1.75 12.1103 1.82902 11.9697 1.96967C11.829 2.11032 11.75 2.30109 11.75 2.5V9.5H11C10.8011 9.5 10.6103 9.57902 10.4697 9.71967C10.329 9.86032 10.25 10.0511 10.25 10.25C10.25 10.4489 10.329 10.6397 10.4697 10.7803C10.6103 10.921 10.8011 11 11 11H14C14.1989 11 14.3897 10.921 14.5303 10.7803C14.671 10.6397 14.75 10.4489 14.75 10.25C14.75 10.0511 14.671 9.86032 14.5303 9.71967C14.3897 9.57902 14.1989 9.5 14 9.5ZM3.5 10C3.30109 10 3.11032 10.079 2.96967 10.2197C2.82902 10.3603 2.75 10.5511 2.75 10.75V13.5C2.75 13.6989 2.82902 13.8897 2.96967 14.0303C3.11032 14.171 3.30109 14.25 3.5 14.25C3.69891 14.25 3.88968 14.171 4.03033 14.0303C4.17098 13.8897 4.25 13.6989 4.25 13.5V10.75C4.25 10.5511 4.17098 10.3603 4.03033 10.2197C3.88968 10.079 3.69891 10 3.5 10ZM5 7.5H4.25V2.5C4.25 2.30109 4.17098 2.11032 4.03033 1.96967C3.88968 1.82902 3.69891 1.75 3.5 1.75C3.30109 1.75 3.11032 1.82902 2.96967 1.96967C2.82902 2.11032 2.75 2.30109 2.75 2.5V7.5H2C1.80109 7.5 1.61032 7.57902 1.46967 7.71967C1.32902 7.86032 1.25 8.05109 1.25 8.25C1.25 8.44891 1.32902 8.63968 1.46967 8.78033C1.61032 8.92098 1.80109 9 2 9H5C5.19891 9 5.38968 8.92098 5.53033 8.78033C5.67098 8.63968 5.75 8.44891 5.75 8.25C5.75 8.05109 5.67098 7.86032 5.53033 7.71967C5.38968 7.57902 5.19891 7.5 5 7.5ZM9.5 4.5H8.75V2.5C8.75 2.30109 8.67098 2.11032 8.53033 1.96967C8.38968 1.82902 8.19891 1.75 8 1.75C7.80109 1.75 7.61032 1.82902 7.46967 1.96967C7.32902 2.11032 7.25 2.30109 7.25 2.5V4.5H6.5C6.30109 4.5 6.11032 4.57902 5.96967 4.71967C5.82902 4.86032 5.75 5.05109 5.75 5.25C5.75 5.44891 5.82902 5.63968 5.96967 5.78033C6.11032 5.92098 6.30109 6 6.5 6H9.5C9.69891 6 9.88968 5.92098 10.0303 5.78033C10.171 5.63968 10.25 5.44891 10.25 5.25C10.25 5.05109 10.171 4.86032 10.0303 4.71967C9.88968 4.57902 9.69891 4.5 9.5 4.5Z"
                      fill="black"
                    />
                  </svg>
                </span>
              </button>
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

        <div className="flex gap-6">
          {filters && isFilterOpen && (
            <div className="hidden md:block w-64 flex-shrink-0">
              <ProductFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                activeFilters={activeFilters}
              />
            </div>
          )}

          {filters && isFilterOpen && (
            <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>
                <ProductFilter
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  activeFilters={activeFilters}
                />
              </div>
            </div>
          )}

          <div className="block w-full flex-1">
            {products.length === 0 && !isLoading ? (
              <NoProducts />
            ) : (
              <>
                {scrollonmobile && (
                  <div className="md:hidden">
                    <Swiper
                      modules={[SwiperPagination]}
                      spaceBetween={13}
                      slidesPerView={2.5}
                      pagination={{
                        clickable: true,
                        dynamicBullets: true,
                      }}
                      className="mySwiper pb-10"
                    >
                      {loading
                        ? Array.from({ length: 3 }).map((_, index) => (
                            <SwiperSlide key={index}>
                              <div className="animate-pulse bg-gray-200 rounded-lg h-[300px] w-full"></div>
                            </SwiperSlide>
                          ))
                        : displayedProducts.map((product, index) => (
                            <SwiperSlide key={index}>
                              <ProductCard {...product} />
                            </SwiperSlide>
                          ))}
                    </Swiper>
                  </div>
                )}

                <div
                  className={`${
                    scrollonmobile ? "hidden md:grid" : "grid"
                  } grid-cols-2 ${
                    filters && isFilterOpen
                      ? "md:grid-cols-3"
                      : "md:grid-cols-3 lg:grid-cols-6"
                  } gap-3 space-y-2 md:space-y-0 md:gap-6`}
                >
                  {loading
                    ? Array.from({ length: 12 }).map((_, index) => (
                        <div
                          key={index}
                          className="animate-pulse bg-gray-200 rounded-[1rem] h-[20rem] md:h-[25rem]"
                        ></div>
                      ))
                    : displayedProducts.map((product, index) => (
                        <ProductCard
                          key={index}
                          enableSales={enableSales}
                          productId={product.productId}
                          title={product.title}
                          brand={product.brand}
                          category={product.category}
                          price={product.price}
                          rating={product.rating}
                          image={product.image}
                          images={product.images}
                          isNew={product.isNew}
                          discount={product.discount}
                          variations={product.variations}
                        />
                      ))}
                </div>
                {loadingMore && (
                  <div className="mt-8 flex flex-col items-center justify-center gap-2">
                    <p className="text-gray-600">Fetching...</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                )}
                {!infiniteScroll && enablePagination && totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
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

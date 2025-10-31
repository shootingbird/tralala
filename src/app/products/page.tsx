"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProductGrid from "@/components/Products/ProductGrid";
import ProductGridSkeleton from "@/components/Products/ProductGridSkeleton";
import { useGetProductsQuery } from "@/slices/products/productApiSlice";
import { Product } from "@/types/product";
import Header from "@/components/shared/Header";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useGetCategoriesQuery } from "@/slices/products/productApiSlice";
import { useState, useEffect } from "react";
import FilterSidebar, {
  SortOption,
  FilterOptions,
} from "@/components/Products/FilterSidebar";
import AppWapper from "@/app/AppWapper";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );
  useGetCategoriesQuery(undefined, {
    skip: categories.length > 0,
  });

  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [filters, setFilters] = useState<FilterOptions>({
    selectedCategories: [],
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const params: Record<string, string | number | boolean> = {};

  // Get query parameters
  const q = searchParams.get("q");
  const cat = searchParams.get("cat");
  const category = searchParams.get("category");
  const subcat = searchParams.get("subcat");
  const has_discount = searchParams.get("has_discount");
  const has_images = searchParams.get("has_images");
  const code = searchParams.get("code");
  const created_after = searchParams.get("created_after");
  const created_before = searchParams.get("created_before");
  const updated_after = searchParams.get("updated_after");
  const updated_before = searchParams.get("updated_before");
  const per_page = searchParams.get("per_page");

  if (q) params.q = q;
  if (cat) params.category = cat;
  if (category) params.category = category;
  if (subcat) params.subcat = subcat;
  if (has_discount) params.has_discount = has_discount === "true";
  if (has_images) params.has_images = has_images === "true";
  if (code) params.code = code;
  if (created_after) params.created_after = created_after;
  if (created_before) params.created_before = created_before;
  if (updated_after) params.updated_after = updated_after;
  if (updated_before) params.updated_before = updated_before;
  if (per_page) params.per_page = parseInt(per_page);

  // Add page and per_page for infinite scroll
  params.page = page;
  params.per_page = 50;

  // Add filter params
  if (filters.minPrice !== undefined) params.min_price = filters.minPrice;
  if (filters.maxPrice !== undefined) params.max_price = filters.maxPrice;
  if (filters.minRating !== undefined) params.min_rating = filters.minRating;
  if (filters.selectedCategories.length > 0)
    params.categories = filters.selectedCategories.join(",");
  if (sort !== "relevance") params.sort_by = sort;

  const { data, isLoading, isError, error, isFetching } =
    useGetProductsQuery(params);

  const hasNextPage = data?.pagination.has_next || false;

  // Accumulate products
  useEffect(() => {
    if (data && !isFetching) {
      const newProducts = data.products;
      if (page === 1) {
        setAllProducts(newProducts);
      } else {
        setAllProducts((prev) => [...prev, ...newProducts]);
      }
    }
  }, [data, isFetching, page]);

  // Reset when search params change
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
  }, [searchParams]);

  // Products are already filtered and sorted by API
  const displayProducts = allProducts;

  const loadMoreProducts = () => {
    if (hasNextPage && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  if (isLoading && page === 1) {
    return (
      <div className="min-h-screen">
        <div className=" mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="h-8 bg-gray-300 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
          </div>
          <ProductGridSkeleton count={12} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">
            Error:{" "}
            {"message" in error ? error.message : "Failed to load products"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const categoryId = searchParams.get("category");
  const subcatParam = searchParams.get("subcat");
  const searchQuery = searchParams.get("q");

  let title = "Products";
  if (searchQuery) {
    title = `Search results for "${searchQuery}"`;
  } else if (categoryId) {
    const category = categories.find((cat) => cat.id === categoryId);
    title = category ? category.name : categoryId;
  } else if (subcatParam) {
    // Find subcategory name by ID
    let subcategoryName = subcatParam;
    for (const cat of categories) {
      const sub = cat.subcategories.find((sub) => sub.id === subcatParam);
      if (sub) {
        subcategoryName = sub.name;
        break;
      }
    }
    title = subcategoryName;
  }

  return (
    <div className="min-h-screen">
      <Header isProductPage={true} />
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-8">
        <p className="text-lg font-medium ">Shop by Categories</p>

        <nav className="hidden md:block bg-white overflow-x-auto no-scrollbar relative z-[10] px-6">
          <div className="px-6 relative min-h-20">
            <ul className="absolute top-0 left-4 right-4 md:relative flex justify-start items-center gap-2 md:gap-6 py-3 text-sm text-gray-700">
              {categories.map((cat) => (
                <li key={cat.id} className="list-none relative rounded-3xl">
                  <Link
                    href={`/products?category=${cat.id}`}
                    className="px-4 py-3 rounded-md whitespace-nowrap hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <div className="relative w-40 h-30">
                      <Image
                        src={cat.image_url}
                        alt={cat.description}
                        fill
                        unoptimized
                        className="rounded-full"
                      />
                    </div>

                    <p className="text-center mt-2">{cat?.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 capitalize">
              {title.replace(/-/g, " ")}
            </h1>
            <p className="text-gray-600 mt-2">
              {displayProducts.length} product
              {displayProducts.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
          </button>
        </div>

        <FilterSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          sort={sort}
          onSortChange={setSort}
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={() => {
            setIsSidebarOpen(false);
          }}
          categories={categories}
        />

        {displayProducts.length > 0 ? (
          <ProductGrid
            title=""
            products={displayProducts}
            showHead={false}
            isInfiniteScroll={true}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetching}
            onLoadMore={loadMoreProducts}
          />
        ) : !isLoading && page === 1 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <AppWapper>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductsPageContent />
      </Suspense>
    </AppWapper>
  );
}

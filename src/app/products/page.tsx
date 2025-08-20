// app/(path)/products/page.tsx
"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductGrid from "@/components/product/ProductGrid";
import ProductFilter, {
  FilterOption,
} from "@/components/product/ProductFilter";
import { TopBanner } from "@/components/layout/TopBanner";
import { Header } from "@/components/layout/Header";
import { NoProducts } from "@/components/ui/NoProducts";

// ===== TYPES =====
type FilterValue =
  | string[]
  | number[]
  | { min?: number; max?: number }
  | string
  | number
  | boolean;

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
}

// ===== QUERY BUILDER SYSTEM =====
interface QueryParams {
  q?: string;
  filter?: string;
  sort?: string;
  category?: string;
  subcat?: string;
  min_price?: number;
  max_price?: number;
  rating_min?: number;
  rating_max?: number;
  in_stock?: boolean;
  stock_status?: string;
  is_variable?: boolean;
  tags?: string[];
  tags_mode?: string;
  ids?: string[];
  exclude_ids?: string[];
  has_discount?: boolean;
  has_images?: boolean;
  code?: string;
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
  per_page?: number;
  page?: number;
}

class QueryBuilder {
  private params: QueryParams = {};

  constructor(initialParams: Partial<QueryParams> = {}) {
    this.params = { ...initialParams };
  }

  setParam<K extends keyof QueryParams>(
    key: K,
    value: QueryParams[K]
  ): QueryBuilder {
    if (value === undefined || value === null || value === "") {
      delete this.params[key];
    } else {
      this.params[key] = value;
    }
    return this;
  }

  setParams(newParams: Partial<QueryParams>): QueryBuilder {
    Object.entries(newParams).forEach(([key, value]) => {
      this.setParam(key as keyof QueryParams, value);
    });
    return this;
  }

  buildQuery(): string {
    const searchParams = new URLSearchParams();

    Object.entries(this.params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;

      if (Array.isArray(value)) {
        if (value.length > 0) {
          searchParams.set(key, value.join(","));
        }
      } else {
        searchParams.set(key, String(value));
      }
    });

    return searchParams.toString();
  }

  getParams(): QueryParams {
    return { ...this.params };
  }

  reset(): QueryBuilder {
    this.params = {};
    return this;
  }

  clone(): QueryBuilder {
    return new QueryBuilder(this.params);
  }
}

// ===== HELPER FUNCTIONS =====
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ??
  "https://steadfastecommercebackend.pxxl.click"
).replace(/\/$/, "");
const DEFAULT_PER_PAGE = 24;

const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  delay = 350
) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Convert UI filters to query parameters
const convertFiltersToQuery = (
  filters: Record<string, FilterValue>
): Partial<QueryParams> => {
  const queryParams: Partial<QueryParams> = {};

  Object.entries(filters).forEach(([key, value]) => {
    switch (key) {
      case "q":
      case "filter":
      case "sort":
      case "code":
      case "created_after":
      case "created_before":
      case "updated_after":
      case "updated_before":
      case "tags_mode":
      case "stock_status":
        if (typeof value === "string" && value.trim()) {
          queryParams[key] = value.trim();
        }
        break;

      case "price":
        if (typeof value === "object" && !Array.isArray(value)) {
          const priceRange = value as { min?: number; max?: number };
          if (priceRange.min !== undefined && priceRange.min > 0) {
            queryParams.min_price = priceRange.min;
          }
          if (priceRange.max !== undefined && priceRange.max > 0) {
            queryParams.max_price = priceRange.max;
          }
        }
        break;

      case "rating":
        if (Array.isArray(value) && value.length > 0) {
          const ratings = value.map(Number).filter((n) => !isNaN(n));
          if (ratings.length > 0) {
            queryParams.rating_min = Math.min(...ratings);
            if (ratings.length > 1) {
              queryParams.rating_max = Math.max(...ratings);
            }
          }
        } else if (typeof value === "object" && !Array.isArray(value)) {
          const ratingRange = value as { min?: number; max?: number };
          if (ratingRange.min !== undefined)
            queryParams.rating_min = ratingRange.min;
          if (ratingRange.max !== undefined)
            queryParams.rating_max = ratingRange.max;
        }
        break;

      case "category":
      case "subcat":
        if (Array.isArray(value) && value.length > 0) {
          queryParams[key] = value.filter(Boolean).join(",");
        } else if (typeof value === "string" && value.trim()) {
          queryParams[key] = value.trim();
        }
        break;

      case "tags":
      case "ids":
      case "exclude_ids":
        if (Array.isArray(value) && value.length > 0) {
          queryParams[key] = value.map(String).filter(Boolean);
        }
        break;

      case "in_stock":
      case "is_variable":
      case "has_discount":
      case "has_images":
        if (typeof value === "boolean") {
          queryParams[key] = value;
        }
        break;
    }
  });

  return queryParams;
};

// Parse URL search params back to filter state for UI
const parseUrlToFilters = (
  searchParams: URLSearchParams
): Record<string, FilterValue> => {
  const filters: Record<string, FilterValue> = {};

  // Simple string params
  const simpleParams = [
    "q",
    "filter",
    "sort",
    "code",
    "created_after",
    "created_before",
    "updated_after",
    "updated_before",
    "tags_mode",
    "stock_status",
  ];
  simpleParams.forEach((param) => {
    const value = searchParams.get(param);
    if (value && value.trim()) {
      filters[param] = value.trim();
    }
  });

  // Category (comma-separated to array)
  const category = searchParams.get("category");
  if (category) {
    filters.category = category
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c);
  }

  const subcat = searchParams.get("subcat");
  if (subcat) {
    filters.subcat = subcat
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c);
  }

  // Price range
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  if (minPrice || maxPrice) {
    filters.price = {
      ...(minPrice && !isNaN(Number(minPrice))
        ? { min: Number(minPrice) }
        : {}),
      ...(maxPrice && !isNaN(Number(maxPrice))
        ? { max: Number(maxPrice) }
        : {}),
    };
  }

  // Rating range - convert back to array for UI
  const ratingMin = searchParams.get("rating_min");
  const ratingMax = searchParams.get("rating_max");
  if (ratingMin || ratingMax) {
    const ratings = [];
    if (ratingMin && !isNaN(Number(ratingMin))) ratings.push(Number(ratingMin));
    if (ratingMax && !isNaN(Number(ratingMax)) && ratingMax !== ratingMin) {
      ratings.push(Number(ratingMax));
    }
    if (ratings.length) filters.rating = ratings;
  }

  // Tags (comma-separated to array)
  const tags = searchParams.get("tags");
  if (tags) {
    filters.tags = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
  }

  // Boolean filters
  const boolParams = ["in_stock", "is_variable", "has_discount", "has_images"];
  boolParams.forEach((param) => {
    const value = searchParams.get(param);
    if (value !== null) {
      filters[param] = value === "true";
    }
  });

  // ID arrays
  const ids = searchParams.get("ids");
  if (ids) {
    filters.ids = ids
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id);
  }

  const excludeIds = searchParams.get("exclude_ids");
  if (excludeIds) {
    filters.exclude_ids = excludeIds
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id);
  }

  return filters;
};

/* ---------- Main Page Component ---------- */
export default function ProductsPage() {
  return (
    <>
      <TopBanner theme="dark" />
      <Header />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[320px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900" />
          </div>
        }
      >
        <ProductList />
      </Suspense>
    </>
  );
}

function ProductList(): JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ===== STATE =====
  const [categories, setCategories] = useState<Category[]>([]);

  // Query builder instance
  const queryBuilderRef = useRef<QueryBuilder>(
    new QueryBuilder({
      per_page: DEFAULT_PER_PAGE,
      page: 1,
    })
  );

  const [currentQueryString, setCurrentQueryString] = useState<string>("");
  const [queryChangeKey, setQueryChangeKey] = useState<number>(0);

  // Active filters for the UI (parsed from URL)
  const [activeFilters, setActiveFilters] = useState<
    Record<string, FilterValue>
  >({});

  // Filters configuration for ProductFilter component
  const [filtersConfig, setFiltersConfig] = useState<FilterOption[]>([
    {
      id: "category",
      label: "Category",
      type: "checkbox",
      options: [],
    },
    {
      id: "price",
      label: "Price Range",
      type: "range",
      range: { min: 0, max: 1000000 },
    },
    {
      id: "rating",
      label: "Rating",
      type: "rating",
      options: [
        { value: "5", label: "5★ & above", amount: 0 },
        { value: "4", label: "4★ & above", amount: 0 },
        { value: "3", label: "3★ & above", amount: 0 },
        { value: "2", label: "2★ & above", amount: 0 },
        { value: "1", label: "1★ & above", amount: 0 },
      ],
    },
  ]);

  // ===== INITIALIZATION FROM URL =====
  useEffect(() => {
    const initialParams: Partial<QueryParams> = {
      per_page: DEFAULT_PER_PAGE,
      page: 1,
    };

    // Parse all URL search params
    searchParams.forEach((value, key) => {
      switch (key) {
        case "q":
        case "filter":
        case "sort":
        case "code":
        case "created_after":
        case "created_before":
        case "updated_after":
        case "updated_before":
        case "tags_mode":
        case "stock_status":
        case "category":
        case "subcat":
          initialParams[key] = value;
          break;
        case "min_price":
        case "max_price":
        case "rating_min":
        case "rating_max":
        case "per_page":
        case "page":
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            initialParams[key] = numValue;
          }
          break;
        case "in_stock":
        case "is_variable":
        case "has_discount":
        case "has_images":
          initialParams[key] = value === "true";
          break;
        case "tags":
        case "ids":
        case "exclude_ids":
          initialParams[key] = value.split(",").filter(Boolean);
          break;
      }
    });

    // Update query builder and generate query string
    queryBuilderRef.current = new QueryBuilder(initialParams);
    const newQueryString = queryBuilderRef.current.buildQuery();
    setCurrentQueryString(newQueryString);
    setQueryChangeKey((prev) => prev + 1);

    // Parse URL params to filter state for UI
    const filters = parseUrlToFilters(searchParams);
    setActiveFilters(filters);
  }, [searchParams]);

  // ===== LOAD CATEGORIES =====
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`);
        if (!res.ok) throw new Error("Failed to fetch categories");

        const json = await res.json();
        let cats: Category[] = [];

        if (Array.isArray(json)) {
          cats = json;
        } else if (json && typeof json === "object" && "categories" in json) {
          cats = json.categories;
        }

        if (cats.length > 0) {
          setCategories(cats);
          updateCategoryFilters(cats);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    loadCategories();
  }, []);

  // Update category filter options
  const updateCategoryFilters = (cats: Category[]) => {
    setFiltersConfig((prev) =>
      prev.map((filter) => {
        if (filter.id === "category") {
          return {
            ...filter,
            options: cats.map((cat) => ({
              value: cat.id,
              label: cat.name,
              amount: 0,
            })),
          };
        }
        return filter;
      })
    );
  };

  // ===== QUERY MANAGEMENT =====
  const updateQuery = useCallback(
    (newParams: Partial<QueryParams>, resetPage = true) => {
      if (resetPage) {
        newParams.page = 1;
      }

      // Update query builder
      queryBuilderRef.current.setParams(newParams);
      const newQueryString = queryBuilderRef.current.buildQuery();

      // Update state
      setCurrentQueryString(newQueryString);
      setQueryChangeKey((prev) => prev + 1);

      // Update URL
      const path = `/products${newQueryString ? `?${newQueryString}` : ""}`;
      router.replace(path, { scroll: false });
    },
    [router]
  );

  // Debounced query update for real-time filtering
  const debouncedUpdateQuery = useRef(
    debounce((newParams: Partial<QueryParams>) => {
      updateQuery(newParams);
    }, 350)
  ).current;

  // ===== FILTER HANDLERS =====
  const handleFilterChange = useCallback(
    (filters: Record<string, FilterValue>) => {
      console.log("Filter change received:", filters);

      // Update active filters state
      setActiveFilters(filters);

      // Convert to query params and update URL
      const queryParams = convertFiltersToQuery(filters);
      console.log("Converted to query params:", queryParams);

      debouncedUpdateQuery(queryParams);
    },
    [debouncedUpdateQuery]
  );

  // ===== BUILD API ENDPOINT =====
  const apiEndpoint = `${API_BASE}/api/products${
    currentQueryString ? `?${currentQueryString}` : ""
  }`;

  console.log("Current API Endpoint:", apiEndpoint);

  // Get initial search query for title
  const initialQ = searchParams.get("q") || "";

  return (
    <div className="min-h-[60vh]">
      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div className="container mx-auto px-3 mb-4">
          <details className="bg-gray-100 p-4 rounded text-xs">
            <summary className="cursor-pointer font-mono">Debug Info</summary>
            <div className="mt-2 space-y-1">
              <div>
                <strong>Query String:</strong> {currentQueryString || "Empty"}
              </div>
              <div>
                <strong>API Endpoint:</strong> {apiEndpoint}
              </div>
              <div>
                <strong>Query Change Key:</strong> {queryChangeKey}
              </div>
              <div>
                <strong>Active Filters:</strong>{" "}
                {JSON.stringify(activeFilters, null, 2)}
              </div>
            </div>
          </details>
        </div>
      )}

      <div className="container mx-auto px-3 md:pt-0 py-6 flex gap-6">
        <div className="flex-1">
          <ProductGrid
            title="All Products"
            subtitle={
              initialQ
                ? `Search results for "${initialQ}"`
                : "Browse our collection"
            }
            products={[]} // Empty - using server-driven mode
            filters={filtersConfig as any}
            onFilterChange={handleFilterChange}
            isLoading={false} // ProductGrid manages its own loading
            emptyState={<NoProducts />}
            enablePagination={false}
            infiniteScroll={true}
            apiEndpoint={apiEndpoint}
            perPage={DEFAULT_PER_PAGE}
            scrollonmobile={true}
            resetKey={queryChangeKey} // This tells ProductGrid when to reset and
          />
        </div>
      </div>
    </div>
  );
}

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
  category?: string | string[];
  subcat?: string | string[];
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
      this.setParam(key as keyof QueryParams, value as any);
    });
    return this;
  }

  buildQuery(): string {
    const searchParams = new URLSearchParams();

    Object.entries(this.params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;

      if (Array.isArray(value)) {
        if (value.length > 0) {
          // Use repeated key[] entries instead of comma-joining
          value.forEach((v) => {
            if (v !== undefined && v !== null && String(v).trim() !== "") {
              searchParams.append(`${key}[]`, String(v));
            }
          });
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

// Helper: prefer repeated key[] entries, fallback to comma-separated single key
const getArrayFromSearchParams = (
  searchParams: URLSearchParams,
  key: string
): string[] => {
  // Prefer repeated key[] values
  const arr = searchParams.getAll(`${key}[]`).filter(Boolean);
  if (arr.length > 0) return arr.map((v) => v.trim());

  // Fall back to comma-separated single "key" value (legacy)
  const raw = searchParams.get(key);
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
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
          // keep as array so QueryBuilder will serialize as key[] entries
          queryParams[key] = value.map(String).filter(Boolean);
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

  // Category (supports category[] or CSV) -> array
  const categoryArr = getArrayFromSearchParams(searchParams, "category");
  if (categoryArr.length) filters.category = categoryArr;

  const subcatArr = getArrayFromSearchParams(searchParams, "subcat");
  if (subcatArr.length) filters.subcat = subcatArr;

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
    const ratings: number[] = [];
    if (ratingMin && !isNaN(Number(ratingMin))) ratings.push(Number(ratingMin));
    if (ratingMax && !isNaN(Number(ratingMax)) && ratingMax !== ratingMin) {
      ratings.push(Number(ratingMax));
    }
    if (ratings.length) filters.rating = ratings;
  }

  // Tags (supports tags[] or CSV)
  const tagsArr = getArrayFromSearchParams(searchParams, "tags");
  if (tagsArr.length) filters.tags = tagsArr;

  // Boolean filters
  const boolParams = ["in_stock", "is_variable", "has_discount", "has_images"];
  boolParams.forEach((param) => {
    const value = searchParams.get(param);
    if (value !== null) {
      filters[param] = value === "true";
    }
  });

  // ID arrays (supports ids[] or CSV)
  const idsArr = getArrayFromSearchParams(searchParams, "ids");
  if (idsArr.length) filters.ids = idsArr;

  const excludeIdsArr = getArrayFromSearchParams(searchParams, "exclude_ids");
  if (excludeIdsArr.length) filters.exclude_ids = excludeIdsArr;

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

    // simple string keys
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
    simpleParams.forEach((p) => {
      const val = searchParams.get(p);
      if (val && val.trim()) initialParams[p as keyof QueryParams] = val;
    });

    // numbers (only if param exists and not empty)
    [
      "min_price",
      "max_price",
      "rating_min",
      "rating_max",
      "per_page",
      "page",
    ].forEach((p) => {
      const val = searchParams.get(p);
      if (val !== null && val.trim() !== "") {
        const n = Number(val);
        if (!isNaN(n)) initialParams[p as keyof QueryParams] = n as any;
      }
    });

    // booleans
    ["in_stock", "is_variable", "has_discount", "has_images"].forEach((p) => {
      const val = searchParams.get(p);
      if (val !== null && val.trim() !== "")
        initialParams[p as keyof QueryParams] = val === ("true" as any);
    });

    // arrays (category[], subcat[], tags[], ids[], exclude_ids[] OR CSV fallback)
    const catArr = getArrayFromSearchParams(searchParams, "category");
    if (catArr.length) initialParams.category = catArr;

    const subcatArr = getArrayFromSearchParams(searchParams, "subcat");
    if (subcatArr.length) initialParams.subcat = subcatArr;

    const tagsArr = getArrayFromSearchParams(searchParams, "tags");
    if (tagsArr.length) initialParams.tags = tagsArr;

    const idsArr = getArrayFromSearchParams(searchParams, "ids");
    if (idsArr.length) initialParams.ids = idsArr;

    const excludeArr = getArrayFromSearchParams(searchParams, "exclude_ids");
    if (excludeArr.length) initialParams.exclude_ids = excludeArr;

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
          cats = (json as any).categories;
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

// "use client";

// import { useEffect, useRef, useState, useCallback } from "react";
// import { ProductGrid } from "@/components/product/ProductGrid";
// import { TopBanner } from "@/components/layout/TopBanner";
// import { Header } from "@/components/layout/Header";
// import { useParams, useSearchParams, useRouter } from "next/navigation";
// import { NoProducts } from "@/components/ui/NoProducts";

// // ===== TYPES =====
// type FilterValue = string[] | number[] | { min?: number; max?: number };

// interface FilterOption {
//   id: string;
//   label: string;
//   type: "checkbox" | "radio" | "range" | "rating";
//   options?: Array<{ value: string; label: string; amount?: number }>;
//   range?: { min: number; max: number };
// }

// interface Category {
//   id: string;
//   name: string;
//   slug?: string;
//   description?: string;
//   image_url?: string;
// }

// // ===== QUERY BUILDER SYSTEM =====
// interface QueryParams {
//   q?: string;
//   filter?: string;
//   sort?: string;
//   category?: string;
//   subcat?: string;
//   min_price?: number;
//   max_price?: number;
//   rating_min?: number;
//   rating_max?: number;
//   in_stock?: boolean;
//   stock_status?: string;
//   is_variable?: boolean;
//   tags?: string[];
//   tags_mode?: string;
//   ids?: string[];
//   exclude_ids?: string[];
//   has_discount?: boolean;
//   has_images?: boolean;
//   code?: string;
//   created_after?: string;
//   created_before?: string;
//   updated_after?: string;
//   updated_before?: string;
//   per_page?: number;
//   page?: number;
// }

// class QueryBuilder {
//   private params: QueryParams = {};

//   constructor(initialParams: Partial<QueryParams> = {}) {
//     this.params = { ...initialParams };
//   }

//   // Set individual parameter
//   setParam<K extends keyof QueryParams>(
//     key: K,
//     value: QueryParams[K]
//   ): QueryBuilder {
//     if (value === undefined || value === null || value === "") {
//       delete this.params[key];
//     } else {
//       this.params[key] = value;
//     }
//     return this;
//   }

//   // Set multiple parameters at once
//   setParams(newParams: Partial<QueryParams>): QueryBuilder {
//     Object.entries(newParams).forEach(([key, value]) => {
//       this.setParam(key as keyof QueryParams, value);
//     });
//     return this;
//   }

//   // Build query string
//   buildQuery(): string {
//     const searchParams = new URLSearchParams();

//     Object.entries(this.params).forEach(([key, value]) => {
//       if (value === undefined || value === null || value === "") return;

//       if (Array.isArray(value)) {
//         if (value.length > 0) {
//           searchParams.set(key, value.join(","));
//         }
//       } else {
//         searchParams.set(key, String(value));
//       }
//     });

//     return searchParams.toString();
//   }

//   // Get current parameters
//   getParams(): QueryParams {
//     return { ...this.params };
//   }

//   // Reset to initial state
//   reset(): QueryBuilder {
//     this.params = {};
//     return this;
//   }

//   // Clone builder
//   clone(): QueryBuilder {
//     return new QueryBuilder(this.params);
//   }
// }

// // ===== HELPER FUNCTIONS =====
// const DEFAULT_PAGE_SIZE = 24;
// const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

// const debounce = <T extends (...args: unknown[]) => void>(
//   fn: T,
//   delay = 350
// ) => {
//   let timer: ReturnType<typeof setTimeout> | null = null;
//   return (...args: Parameters<T>): void => {
//     if (timer) clearTimeout(timer);
//     timer = setTimeout(() => fn(...args), delay);
//   };
// };

// // Convert UI filters to query parameters
// const convertFiltersToQuery = (
//   filters: Record<string, FilterValue>
// ): Partial<QueryParams> => {
//   const queryParams: Partial<QueryParams> = {};

//   Object.entries(filters).forEach(([key, value]) => {
//     switch (key) {
//       case "q":
//       case "filter":
//       case "sort":
//       case "code":
//       case "created_after":
//       case "created_before":
//       case "updated_after":
//       case "updated_before":
//       case "tags_mode":
//       case "stock_status":
//         if (typeof value === "string" && value.trim()) {
//           queryParams[key] = value.trim();
//         }
//         break;

//       case "price":
//         if (typeof value === "object" && !Array.isArray(value)) {
//           const priceRange = value as { min?: number; max?: number };
//           if (priceRange.min !== undefined && priceRange.min > 0) {
//             queryParams.min_price = priceRange.min;
//           }
//           if (priceRange.max !== undefined && priceRange.max > 0) {
//             queryParams.max_price = priceRange.max;
//           }
//         }
//         break;

//       case "rating":
//         if (Array.isArray(value) && value.length > 0) {
//           // For rating checkboxes, use the minimum selected rating
//           const ratings = value.map(Number).filter((n) => !isNaN(n));
//           if (ratings.length > 0) {
//             queryParams.rating_min = Math.min(...ratings);
//           }
//         } else if (typeof value === "object" && !Array.isArray(value)) {
//           const ratingRange = value as { min?: number; max?: number };
//           if (ratingRange.min !== undefined)
//             queryParams.rating_min = ratingRange.min;
//           if (ratingRange.max !== undefined)
//             queryParams.rating_max = ratingRange.max;
//         }
//         break;

//       case "category":
//       case "subcat":
//         if (Array.isArray(value) && value.length > 0) {
//           queryParams[key] = value.filter(Boolean).join(",");
//         } else if (typeof value === "string" && value.trim()) {
//           queryParams[key] = value.trim();
//         }
//         break;

//       case "tags":
//       case "ids":
//       case "exclude_ids":
//         if (Array.isArray(value) && value.length > 0) {
//           queryParams[key] = value.map(String).filter(Boolean);
//         }
//         break;

//       case "in_stock":
//       case "is_variable":
//       case "has_discount":
//       case "has_images":
//         if (typeof value === "boolean") {
//           queryParams[key] = value;
//         }
//         break;
//     }
//   });

//   return queryParams;
// };

// // ===== MAIN COMPONENT =====
// export default function ProductsPage(): JSX.Element {
//   const params = useParams();
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const categorySlugOrName = String(params?.category ?? "");

//   // ===== STATE =====
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [categoryData, setCategoryData] = useState<Category | null>(null);

//   // Query builder instance
//   const queryBuilderRef = useRef<QueryBuilder>(
//     new QueryBuilder({
//       per_page: DEFAULT_PAGE_SIZE,
//       page: 1,
//     })
//   );

//   const [currentQueryString, setCurrentQueryString] = useState<string>("");
//   const [queryChangeKey, setQueryChangeKey] = useState<number>(0);

//   // Filters for the UI (will be populated based on category/initial data)
//   const [productFilters, setProductFilters] = useState<FilterOption[]>([
//     {
//       id: "category",
//       label: "Category",
//       type: "checkbox",
//       options: [],
//     },
//     {
//       id: "price",
//       label: "Price Range",
//       type: "range",
//       range: { min: 0, max: 1000000 },
//     },
//     {
//       id: "rating",
//       label: "Rating",
//       type: "rating",
//       options: [
//         { value: "5", label: "5★ & above", amount: 0 },
//         { value: "4", label: "4★ & above", amount: 0 },
//         { value: "3", label: "3★ & above", amount: 0 },
//         { value: "2", label: "2★ & above", amount: 0 },
//         { value: "1", label: "1★ & above", amount: 0 },
//       ],
//     },
//   ]);

//   // ===== INITIALIZATION FROM URL =====
//   useEffect(() => {
//     const initialParams: Partial<QueryParams> = {
//       per_page: DEFAULT_PAGE_SIZE,
//       page: 1,
//     };

//     // Parse URL search params
//     searchParams.forEach((value, key) => {
//       switch (key) {
//         case "q":
//         case "filter":
//         case "sort":
//         case "code":
//         case "created_after":
//         case "created_before":
//         case "updated_after":
//         case "updated_before":
//         case "tags_mode":
//         case "stock_status":
//         case "category":
//         case "subcat":
//           initialParams[key] = value;
//           break;
//         case "min_price":
//         case "max_price":
//         case "rating_min":
//         case "rating_max":
//         case "per_page":
//         case "page":
//           const numValue = Number(value);
//           if (!isNaN(numValue)) {
//             initialParams[key] = numValue;
//           }
//           break;
//         case "in_stock":
//         case "is_variable":
//         case "has_discount":
//         case "has_images":
//           initialParams[key] = value === "true";
//           break;
//         case "tags":
//         case "ids":
//         case "exclude_ids":
//           initialParams[key] = value.split(",").filter(Boolean);
//           break;
//       }
//     });

//     // Add category from route params (overrides URL param)
//     if (categorySlugOrName) {
//       initialParams.category = categorySlugOrName;
//     }

//     // Update query builder and generate query string
//     queryBuilderRef.current = new QueryBuilder(initialParams);
//     const newQueryString = queryBuilderRef.current.buildQuery();
//     setCurrentQueryString(newQueryString);
//     setQueryChangeKey((prev) => prev + 1);
//   }, [searchParams, categorySlugOrName]);

//   // ===== LOAD CATEGORIES (for filter options) =====
//   useEffect(() => {
//     const loadCategories = async () => {
//       try {
//         // Check cache first
//         const cached = localStorage.getItem("categories");
//         if (cached) {
//           try {
//             const parsed: unknown = JSON.parse(cached);
//             if (Array.isArray(parsed)) {
//               const cats = parsed as Category[];
//               setCategories(cats);
//               updateCategoryFilters(cats);
//             }
//           } catch {
//             // ignore parse error
//           }
//         }

//         // Fetch fresh data
//         const res = await fetch(`${API_BASE}/api/categories`);
//         if (!res.ok) throw new Error("Failed to fetch categories");

//         const json = (await res.json()) as unknown;
//         let cats: Category[] = [];

//         if (Array.isArray(json)) {
//           cats = json as Category[];
//         } else if (json && typeof json === "object" && "categories" in json) {
//           const categoriesData = (json as Record<string, unknown>)[
//             "categories"
//           ];
//           if (Array.isArray(categoriesData)) {
//             cats = categoriesData as Category[];
//           }
//         }

//         if (cats.length > 0) {
//           setCategories(cats);
//           updateCategoryFilters(cats);
//           localStorage.setItem("categories", JSON.stringify(cats));
//         }
//       } catch (err) {
//         console.error("Failed to load categories:", err);
//       }
//     };

//     loadCategories();
//   }, []);

//   // Update category filter options
//   const updateCategoryFilters = (cats: Category[]) => {
//     setProductFilters((prev) =>
//       prev.map((filter) => {
//         if (filter.id === "category") {
//           return {
//             ...filter,
//             options: cats.map((cat) => ({
//               value: cat.id,
//               label: cat.name,
//               amount: 0, // Will be updated by ProductGrid after it fetches data
//             })),
//           };
//         }
//         return filter;
//       })
//     );
//   };

//   // Find current category data
//   useEffect(() => {
//     if (categorySlugOrName && categories.length > 0) {
//       const category = categories.find(
//         (c) =>
//           c.id === categorySlugOrName ||
//           c.slug === categorySlugOrName ||
//           c.name.toLowerCase() === categorySlugOrName.toLowerCase()
//       );
//       setCategoryData(category || null);
//     } else {
//       setCategoryData(null);
//     }
//   }, [categorySlugOrName, categories]);

//   // ===== QUERY MANAGEMENT =====
//   const updateQuery = useCallback(
//     (newParams: Partial<QueryParams>, resetPage = true) => {
//       if (resetPage) {
//         newParams.page = 1;
//       }

//       // Update query builder
//       queryBuilderRef.current.setParams(newParams);
//       const newQueryString = queryBuilderRef.current.buildQuery();

//       // Update state
//       setCurrentQueryString(newQueryString);
//       setQueryChangeKey((prev) => prev + 1);

//       // Update URL without causing a page refresh
//       const url = new URL(window.location.href);
//       url.search = newQueryString;
//       router.replace(url.pathname + url.search, { scroll: false });

//       console.log("Query updated:", newQueryString);
//     },
//     [router]
//   );

//   // Debounced query update (for real-time filtering)
//   const debouncedUpdateQuery = useRef(
//     debounce((newParams: Partial<QueryParams>) => {
//       updateQuery(newParams);
//     }, 350)
//   ).current;

//   // ===== FILTER HANDLERS =====
//   const handleFilterChange = useCallback(
//     (filters: Record<string, FilterValue>) => {
//       console.log("Filter change received:", filters);
//       const queryParams = convertFiltersToQuery(filters);
//       console.log("Converted to query params:", queryParams);
//       debouncedUpdateQuery(queryParams);
//     },
//     [debouncedUpdateQuery]
//   );

//   // Handle search input changes
//   const handleSearchChange = useCallback(
//     (searchTerm: string) => {
//       updateQuery({ q: searchTerm.trim() || undefined });
//     },
//     [updateQuery]
//   );

//   // Handle sort changes
//   const handleSortChange = useCallback(
//     (sortValue: string) => {
//       updateQuery({ sort: sortValue || undefined });
//     },
//     [updateQuery]
//   );

//   // ===== BUILD API ENDPOINT =====
//   const apiEndpoint = `${API_BASE}/api/products${
//     currentQueryString ? `?${currentQueryString}` : ""
//   }`;

//   console.log("Current API Endpoint:", apiEndpoint);

//   // ===== RENDER =====
//   return (
//     <>
//       <TopBanner theme={"dark"} />
//       <Header />
//       <br />

//       {/* Debug info (remove in production) */}
//       {process.env.NODE_ENV === "development" && (
//         <div className="container mx-auto px-3 mb-4">
//           <details className="bg-gray-100 p-4 rounded text-xs">
//             <summary className="cursor-pointer font-mono">Debug Info</summary>
//             <div className="mt-2 space-y-1">
//               <div>
//                 <strong>Category:</strong> {categorySlugOrName || "None"}
//               </div>
//               <div>
//                 <strong>Query String:</strong> {currentQueryString || "Empty"}
//               </div>
//               <div>
//                 <strong>API Endpoint:</strong> {apiEndpoint}
//               </div>
//               <div>
//                 <strong>Query Change Key:</strong> {queryChangeKey}
//               </div>
//             </div>
//           </details>
//         </div>
//       )}

//       <ProductGrid
//         title={
//           categoryData?.name ||
//           categories.find(
//             (c) => c.id === categorySlugOrName || c.slug === categorySlugOrName
//           )?.name ||
//           "Products"
//         }
//         subtitle={
//           categoryData?.description ||
//           categories.find(
//             (c) => c.id === categorySlugOrName || c.slug === categorySlugOrName
//           )?.description ||
//           "Browse our collection"
//         }
//         products={[]}
//         filters={productFilters as any}
//         onFilterChange={handleFilterChange}
//         isLoading={false}
//         emptyState={<NoProducts />}
//         enablePagination={false}
//         infiniteScroll={true}
//         apiEndpoint={apiEndpoint}
//         perPage={DEFAULT_PAGE_SIZE}
//         scrollonmobile={true}
//         resetKey={queryChangeKey} // This tells ProductGrid when to reset and re-fetch
//       />
//     </>
//   );
// }

"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Cookies from "js-cookie";
import { format } from "date-fns";
import {
  ChevronDown,
  Dot,
  EllipsisVertical,
  SlidersHorizontal,
} from "lucide-react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Pagination } from "@/components/common/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import AppWapper from "@/app/AppWapper";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";

type Order = {
  image: string;
  orderId: string;
  product_qty: number;
  createdAt: string; // ISO
  status: string;
  placedDate: string; // ISO
  raw?: Record<string, unknown>; // original payload if needed
};

type APIOrder = {
  order_id: string;
  created_at: string;
  status: string;
  is_paid?: boolean;
  id?: number;
  contact?: { email?: string; name?: string };
  items_count?: number;
  updated_at?: string;
  items?: Array<Record<string, unknown>>;
  pagination?: Record<string, unknown>;
  // plus other fields from the response...
  [key: string]: unknown;
};

const PLACEHOLDER_IMAGE = "/404.png";

const getStatusColor = (status: string) => {
  const s = (status || "").toLowerCase();
  return (
    {
      processing: "text-yellow-500",
      placed: "text-blue-500",
      shipped: "text-gray-500",
      delivered: "text-green-600",
      cancelled: "text-red-500",
    }[s] || "text-gray-500"
  );
};

const mapApiToOrder = (a: APIOrder): Order => {
  // Try to find the first item with a non-empty image_url
  const validImage =
    (a.items?.find(
      (item: Record<string, unknown>) =>
        typeof item.image_url === "string" && item.image_url.trim() !== ""
    )?.image_url as string) ?? PLACEHOLDER_IMAGE;

  return {
    image: validImage,
    orderId: a.order_id || `#${a.id ?? Math.floor(Math.random() * 100000)}`,
    product_qty: a.items_count ?? 1,
    createdAt: a.created_at || new Date().toISOString(),
    status: a.status || "unknown",
    placedDate: a.updated_at || a.created_at || new Date().toISOString(),
    raw: a,
  };
};

const capitalize = (s?: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

// Small loading skeleton that keeps the same general layout/styling
const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex justify-between items-start gap-4 md:gap-6 group rounded-xl py-3 md:p-4"
        >
          <div className="flex gap-4 md:gap-6 w-full">
            <div className="w-24 h-24 md:w-52 md:h-44 flex-shrink-0 rounded-md overflow-hidden bg-gray-200 animate-pulse" />

            <div className="flex flex-col justify-between gap-3 text-sm md:text-base text-gray-700 w-full">
              <div className="space-y-2">
                <div className="h-4 md:h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
              </div>

              <div className="flex items-center gap-2 font-medium">
                <div className="w-3 h-3 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

const ErrorBanner: React.FC<{
  error: { code?: string; message?: string } | null;
  onRetry?: () => void;
}> = ({ error, onRetry }) => {
  const router = useRouter();
  if (!error) return null;

  const isTokenInvalid = error.code === "TOKEN_INVALID";

  return (
    <div className="w-full bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">
            {error.message || "Something went wrong."}
          </p>
          {isTokenInvalid && (
            <p className="text-xs mt-1">
              Your session is invalid. Please sign in again.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              if (isTokenInvalid) {
                Cookies.remove("token");
                Cookies.remove("access_token");
                Cookies.remove("auth_token");
                localStorage.removeItem("token");
                router.push("/login");
              } else {
                onRetry?.();
              }
            }}
            className="px-3 py-1 rounded bg-white border text-sm"
          >
            {isTokenInvalid ? "Sign in" : "Retry"}
          </button>

          {!isTokenInvalid && (
            <button
              onClick={onRetry}
              className="px-3 py-1 rounded bg-white border text-sm"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const OrderCard = ({ order }: { order: Order }) => {
  const { orderId, product_qty, createdAt, status } = order;
  const router = useRouter();
  const [imgSrc, setImgSrc] = useState(order.image || PLACEHOLDER_IMAGE);
  return (
    <div className="flex justify-between items-start gap-4 md:gap-6 group transition-all duration-200 hover:bg-gray-50 rounded-xl py-3 md:p-4">
      <div
        className="flex gap-4 md:gap-6 w-full"
        onClick={() => router.push(`/orders/${encodeURIComponent(orderId)}`)}
      >
        <div className="w-24 h-24 md:w-52 md:h-44 flex-shrink-0 rounded-md overflow-hidden">
          <Image
            src={imgSrc}
            alt={`Product(s) for Order ${orderId}`}
            width={208}
            height={176}
            priority
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
          />
        </div>

        <div className="flex flex-col justify-between gap-3 text-sm md:text-base text-gray-700 w-full">
          <div className="space-y-1">
            <p className="text-sm md:text-lg font-semibold">
              Order {orderId} ({product_qty}{" "}
              {product_qty > 1 ? "Products" : "Product"})
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              Placed on {format(new Date(createdAt), "MMMM d, yyyy h:mmaaa")}
            </p>
          </div>

          <div
            className={`flex items-center gap-1 font-medium ${getStatusColor(
              status
            )}`}
          >
            <Dot className="w-5 h-5" />
            <p className="text-xs md:text-base">{capitalize(status)}</p>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0">
        <button
          className="hidden md:inline-block text-[#E94B1C] text-sm font-medium hover:underline"
          aria-label="Return and Refund"
          onClick={() => router.push(`/orders/${encodeURIComponent(orderId)}`)}
        >
          View Details
        </button>

        <button
          className="md:hidden p-1 text-gray-600 hover:text-[#E94B1C] transition"
          aria-label="Order options"
        >
          <EllipsisVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default function OrderHistory() {
  return (
    <AppWapper>
      <OrderHistoryContent />
    </AppWapper>
  );
}

function OrderHistoryContent() {
  const { getToken } = useAuth();

  // UI / pagination
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);

  // data
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{
    code?: string;
    message?: string;
  } | null>(null);

  // server pagination info
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalOrders, setTotalOrders] = useState<number>(0);

  // filters + sort
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [query, setQuery] = useState<string>("");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Profile", href: "/profile" },
    { label: "Order History" },
  ];

  const fetchOrders = useCallback(
    async (opts?: {
      page?: number;
      perPage?: number;
      signal?: AbortSignal;
    }) => {
      const pageToFetch = opts?.page ?? page;
      const perPageToFetch = opts?.perPage ?? perPage;
      const signal = opts?.signal;

      setLoading(true);
      setError(null);

      try {
        const token = getToken();
        const base = process.env.NEXT_PUBLIC_API_URL;
        const params = new URLSearchParams();
        params.set("page", String(pageToFetch));
        params.set("per_page", String(perPageToFetch));
        params.set("email", "");
        params.set("user_id", "");
        params.set("created_after", "");
        params.set("created_before", "");
        params.set("q", query);
        params.set("has_customer_read", "1");

        const url = `${base}/api/orders?include_items=true&${params.toString()}`;

        const headers: Record<string, string> = { Accept: "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(url, { method: "GET", headers, signal });

        if (!res.ok) {
          // try to parse structured error response
          let parsed: Record<string, unknown> | null = null;
          try {
            parsed = await res.json();
          } catch (e) {
            // fallthrough
          }

          const errCode = (parsed?.error as Record<string, unknown>)
            ?.code as string;
          const errMsg =
            ((parsed?.error as Record<string, unknown>)?.message as string) ||
            (parsed?.message as string) ||
            `Failed fetching orders (${res.status})`;

          const errObj = { code: errCode, message: errMsg };
          setError(errObj);

          // if token invalid, do not throw to avoid double-handling; just return
          if (errCode === "TOKEN_INVALID") {
            return;
          }

          throw new Error(errMsg);
        }

        const json = await res.json();

        const payload: APIOrder[] = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.orders)
          ? json.orders
          : Array.isArray(json)
          ? (json as APIOrder[])
          : [];

        const mapped = payload.map(mapApiToOrder);
        console.log(mapped);

        // server pagination
        const pagination = json.pagination || {};
        const total = pagination.total ?? mapped.length ?? 0;
        const tPages =
          pagination.total_pages ??
          Math.max(1, Math.ceil(total / perPageToFetch));

        setTotalPages(tPages);
        setTotalOrders(total);

        setOrders(mapped);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // aborted, don't set an error state
          return;
        }
        console.error("Fetch orders error:", err);
        setError({
          message: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        setLoading(false);
      }
    },
    [getToken, page, perPage, query]
  );

  // fetch when page/perPage/query changes, with abort support
  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();

    if (!mounted) return;

    fetchOrders({ page, perPage, signal: ac.signal });

    return () => {
      mounted = false;
      ac.abort();
    };
  }, [fetchOrders, page, perPage]);

  // client-side filtered + sorted list
  const filteredSorted = useMemo(() => {
    let list = [...orders];

    if (statusFilter && statusFilter !== "All") {
      list = list.filter(
        (o) => o.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    list.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? tb - ta : ta - tb;
    });

    return list;
  }, [orders, statusFilter, sortOrder]);

  // when user changes page using pagination component
  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const handleRetry = () => fetchOrders({ page, perPage });

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-10">
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          <section className="bg-white px-4 md:px-6 py-6 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl md:text-2xl text-black font-semibold">
                Orders
              </h2>

              <div className="flex justify-between items-center gap-4">
                <p className="hidden md:inline-block text-sm text-gray-700 font-medium">
                  Showing {filteredSorted.length} Result
                  {filteredSorted.length !== 1 && "s"} from total {totalOrders}
                </p>

                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-full border-none">
                      <div className="hidden md:flex gap-2 border px-2 py-1 rounded-full">
                        {statusFilter} <ChevronDown className="text-gray-600" />
                      </div>
                      <div className="md:hidden">
                        <SlidersHorizontal className="text-gray-800" />
                      </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                      {[
                        "All",
                        "processing",
                        "delivered",
                        "cancelled",
                        "shipped",
                        "placed",
                      ].map((s) => (
                        <DropdownMenuItem
                          key={s}
                          onClick={() =>
                            setStatusFilter(s === "All" ? "All" : s)
                          }
                          className="capitalize"
                        >
                          {s}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-full border-none">
                      <div className="hidden md:flex gap-2 border px-2 py-1 rounded-full">
                        Sort <ChevronDown className="text-gray-600" />
                      </div>
                      <div className="md:hidden">
                        <ChevronDown className="text-gray-800" />
                      </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                        Newest first
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                        Oldest first
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {error && <ErrorBanner error={error} onRetry={handleRetry} />}

            <div className="flex flex-col gap-4">
              {loading && orders.length === 0 && <LoadingSkeleton />}

              {!loading && orders.length === 0 && (
                <p className="text-sm text-gray-500">No orders found.</p>
              )}

              {!loading &&
                filteredSorted.length > 0 &&
                filteredSorted.map((order) => (
                  <div key={order.orderId} className="mb:pb-4 md:border-b">
                    <OrderCard order={order} />
                  </div>
                ))}

              {loading && orders.length > 0 && (
                // show a lightweight loader when refreshing (keeps existing list visible)
                <p className="text-sm text-gray-500">Refreshing orders...</p>
              )}
            </div>

            <div className="flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

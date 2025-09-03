"use client";

import React, { use, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { TopBanner } from "@/components/layout/TopBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { RatingModal } from "@/components/orders/RatingModal";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import Cookies from "js-cookie";
import OrderProgressBar from "@/components/orders/OrderProgressBar";

// --- Types that match your API response ---

export type OrderStatus =
  | "placed"
  | "processing"
  | "shipped"
  | "arrived"
  | "delivered";
interface OrderItem {
  line_total: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  variation_id?: number | null;
  variation_label?: string | null;
}

interface Amounts {
  delivery_fee: number;
  discount: number;
  subtotal: number;
  tax: number;
  total: number;
}

interface Contact {
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  phone: string;
}

interface Delivery {
  duration?: string;
  fee?: number;
  pickup_location?: string;
  zone_id?: number;
}

interface Shipping {
  address: string;
  city: string;
  state: string;
}

interface Order {
  id: number;
  order_id: string;
  user_id: number;
  status: string;
  is_paid: boolean;
  payment_status?: string;
  amounts: Amounts;
  contact: Contact;
  shipping: Shipping;
  items: OrderItem[];
  notes?: string | null;
  created_at: string;
  updated_at: string;
  padicode?: string;
  coupon_code?: string | null;
  delivery?: Delivery;
}

type Params = { id: string };

// --- Helpers ---
const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return d.toLocaleDateString("en-US", options);
};

const formatCurrency = (value: number | string | undefined) => {
  const n = Number(value || 0);
  return "NGN " + n.toLocaleString();
};

// --- Component ---
export default function OrderDetailsPage({
  params,
}: {
  params: Promise<Params>;
}) {
  // keep same semantics as original file
  const { id } = use(params) as Params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Orders", href: "/orders" },
    { label: "Order Details" },
  ];

  // Map order status to stages (kept original labels / UI behavior)
  const getOrderStages = (status: string) => {
    const allStages = [
      { label: "Order Placed", status: "upcoming" },
      { label: "Processing", status: "upcoming" },
      { label: "Shipped", status: "upcoming" },
      { label: "Arrived", status: "upcoming" },
      { label: "Delivered", status: "upcoming" },
    ];

    const stageMap: { [key: string]: number } = {
      placed: 0,
      processing: 1,
      shipped: 2,
      arrived: 3,
      delivered: 4,
    };

    const idx = stageMap[status?.toLowerCase?.()] ?? 0;

    return allStages.map((stage, i) => {
      if (i < idx) return { ...stage, status: "completed" as const };
      if (i === idx) return { ...stage, status: "current" as const };
      return { ...stage, status: "upcoming" as const };
    });
  };

  // Build reasonable activities using the timestamps we have (kept messaging similar)
  const getOrderActivities = (o: Order) => {
    const activities: { message: string; date: string }[] = [];
    const createdDate = new Date(o.created_at);
    const formattedCreatedDate = formatDateTime(createdDate);

    // same fall-through approach used originally, but we use concrete times where possible
    switch (o.status.toLowerCase()) {
      case "delivered":
        activities.push({
          message:
            "Your order has been delivered. Thank you for shopping at Steadfast International!",
          date: formatDateTime(o.updated_at || new Date()),
        });
      // fall through
      case "arrived":
        activities.push({
          message:
            "Your order has arrived at the pickup location and is ready for collection.",
          date: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 5)),
        });
      // fall through
      case "shipped":
        activities.push({
          message: "Your order has been shipped.",
          date: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)),
        });
      // fall through
      case "processing":
        activities.push({
          message: "Your order is successfully processed.",
          date: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)),
        });
      // fall through
      default:
        activities.push({
          message: "Your order has been confirmed.",
          date: formattedCreatedDate,
        });
    }

    // original UI expects newest first
    return activities.reverse();
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("token");
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}?include_items=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          let parsed = null;
          try {
            parsed = await response.json();
          } catch (e) {
            // ignore
          }
          const errMsg =
            parsed?.error ||
            parsed?.message ||
            `Failed to fetch order (status ${response.status})`;
          throw new Error(errMsg);
        }

        const data = await response.json();

        // the API you pasted returns data.order
        const loadedOrder: Order = (data.order || data) as Order;

        setOrder(loadedOrder);
      } catch (err) {
        if ((err as any).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to fetch order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    return () => controller.abort();
  }, [id]);

  const handleRatingSubmit = async (rating: number, comment: string) => {
    console.log("Rating submitted:", { rating, comment, orderId: id });
    // placeholder - integrate with your rating endpoint
  };

  if (loading) {
    return (
      <>
        <TopBanner theme="dark" />
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Breadcrumb items={breadcrumbItems} className="mb-6" />
          <div className="bg-white rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 space-y-4">
                <div className="h-48 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-24 bg-gray-100 rounded" />
              </div>
              <div className="space-y-4">
                <div className="h-20 bg-gray-100 rounded" />
                <div className="h-16 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Order not found
      </div>
    );
  }

  const orderStages = getOrderStages(order.status);
  const orderActivities = getOrderActivities(order);
  const formattedCreatedDate = formatDateTime(new Date(order.created_at));
  const expectedArrivalDate = new Date(
    new Date(order.created_at).getTime() + 6 * 24 * 60 * 60 * 1000
  );
  const formattedExpectedDate = formatDateTime(expectedArrivalDate);

  // Calculate total items using API items
  const totalItems =
    order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ?? 0;

  console.log(order);
  return (
    <>
      <TopBanner theme="dark" />
      <Header />
      <main className="container mx-auto md:px-4 py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-medium h-full">Order Details</h1>
            <div className="">
              <Button
                variant="outline"
                onClick={() => setIsRatingModalOpen(true)}
                className="text-[#184193] flex items-center gap-1"
                rounded={true}
              >
                Leave a Rating
                <Plus className="text-[#184193] w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="bg-[#F8F9FA] rounded-lg p-6 mb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-medium">
                  #{order.order_id ?? order.id}
                </h2>
                <p className="text-sm text-gray-500">
                  {totalItems} Products • Order Placed on {formattedCreatedDate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#184193] text-xl font-semibold">
                  {formatCurrency(order.amounts?.total)}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Order expected arrival {formattedExpectedDate}
            </p>

            <div className="mt-20">
              <OrderProgressBar
                status={(order?.status as OrderStatus) ?? "placed"}
                className=""
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Order Activity</h2>
            <div className="space-y-4">
              {orderActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-[#F8F9FA] p-4 rounded-lg"
                >
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">
              Product ({order.items.length.toString().padStart(2, "0")})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8F9FA] text-sm">
                  <tr>
                    <th className="text-left py-3 px-4">PRODUCTS</th>
                    <th className="text-right py-3 px-4">PRICE</th>
                    <th className="text-right py-3 px-4">QUANTITY</th>
                    <th className="text-right py-3 px-4">SUB TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {order?.items.map((item) => {
                    const productName =
                      item.product_name || `Product ${item.product_id}`;
                    const productPrice = item.unit_price ?? 0;
                    // API doesn't return product images in the provided response; keep fallback
                    const imageUrl = "/404.png";

                    return (
                      <tr key={item.product_id} className="border-b">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16">
                              <Image
                                src={imageUrl}
                                alt={productName}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                            <div className="text-sm">{productName}</div>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">
                          NGN {productPrice.toLocaleString()}
                        </td>
                        <td className="text-right py-4 px-4">
                          x{item.quantity}
                        </td>
                        <td className="text-right py-4 px-4">
                          NGN {item.line_total.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* three column info */}
          <section className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-3">Shipping Address</h3>
              <div className="bg-[#F8F9FA] p-4 rounded-lg">
                <div className="font-medium mb-1">{order.contact?.name}</div>
                <div className="text-sm text-gray-600">
                  {order.shipping?.address}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Phone:</span>{" "}
                  {order.contact?.phone}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Email:</span>{" "}
                  {order.contact?.email}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Delivery</h3>
              <div className="bg-[#F8F9FA] p-4 rounded-lg">
                <div className="text-sm mb-1">
                  Method: {order.delivery?.pickup_location ?? "Home Delivery"}
                </div>
                <div className="text-sm">
                  Duration: {order.delivery?.duration ?? "—"}
                </div>
                <div className="text-sm mt-2">
                  Delivery fee: {formatCurrency(order.amounts.delivery_fee)}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Order Notes</h3>
              <div className="bg-[#F8F9FA] p-4 rounded-lg">
                <div className="text-sm text-gray-600">
                  {order.notes ?? "No notes provided."}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Last updated: {formatDateTime(order.updated_at)}
                </div>
              </div>
            </div>
          </section>

          {/* order summary */}
          <div className="mt-6 border-t pt-6 flex flex-col md:flex-row justify-between gap-6">
            {/* Amounts */}
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(order.amounts.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="text-red-600">
                  -{formatCurrency(order.amounts.discount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(order.amounts.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery fee</span>
                <span>{formatCurrency(order.amounts.delivery_fee)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(order.amounts.total)}</span>
              </div>
            </div>

            {/* Payment Status */}
            <div className="flex items-center gap-2 md:gap-3 self-start md:self-center">
              <span className="text-sm text-gray-600">Payment:</span>
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  order.is_paid
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {order.is_paid ? "Paid" : order.payment_status ?? "Pending"}
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
      />
    </>
  );
}

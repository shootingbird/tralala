"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { TopBanner } from "@/components/layout/TopBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { RatingModal } from "@/components/orders/RatingModal";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import Cookies from "js-cookie";

// Types aligned with the API response you showed
interface ApiItem {
  line_total: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  variation_id?: number | null;
  variation_label?: string | null;
}

interface ApiOrder {
  amounts: {
    delivery_fee: number;
    discount: number;
    subtotal: number;
    tax: number;
    total: number;
  };
  contact: {
    email?: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    phone?: string;
  };
  created_at: string;
  delivery?: any;
  id: number;
  is_paid?: boolean;
  items: ApiItem[];
  notes?: string | null;
  order_id?: string;
  payment_status?: string;
  shipping?: {
    address?: string;
    city?: string;
    state?: string;
  };
  status?: string;
  updated_at?: string;
  user_id?: number;
}

interface OrderProduct {
  id: string;
  product_id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  product?: any;
}

interface Order {
  id: string;
  user_id: string;
  cart: OrderProduct[];
  status: string;
  address: string;
  name: string;
  phone_number?: string;
  total_amount: number;
  payment_status: string;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
}

interface OrderActivity {
  message: string;
  date: string;
}

interface OrderStage {
  label: string;
  status: "completed" | "current" | "upcoming";
}

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Orders", href: "/orders" },
    { label: "Order Details" },
  ];

  const getOrderStages = (status: string): OrderStage[] => {
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

    const currentStageIndex = stageMap[status?.toLowerCase?.()] ?? 0;

    return allStages.map((stage, index) => {
      if (index < currentStageIndex) return { ...stage, status: "completed" };
      if (index === currentStageIndex) return { ...stage, status: "current" };
      return { ...stage, status: "upcoming" };
    });
  };

  const formatDateTime = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : date;
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

  const getOrderActivities = (o: Order): OrderActivity[] => {
    // Create deterministic, readable activity timeline based on created_at and status
    const activities: OrderActivity[] = [];
    const created = new Date(o.created_at);

    activities.push({
      message: "Your order has been confirmed.",
      date: formatDateTime(created),
    });

    // helper to add day offsets
    const addDays = (base: Date, days: number) =>
      new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

    const status = o.status?.toLowerCase?.() || "placed";
    const orderStages = [
      "placed",
      "processing",
      "shipped",
      "arrived",
      "delivered",
    ];
    const currentIndex = orderStages.indexOf(status);

    // Processing (+1 day)
    if (currentIndex >= 1) {
      activities.push({
        message: "Your order is successfully processed.",
        date: formatDateTime(addDays(created, 1)),
      });
    }
    // Shipped (+2 days)
    if (currentIndex >= 2) {
      activities.push({
        message: "Your order has been shipped.",
        date: formatDateTime(addDays(created, 2)),
      });
    }
    // Arrived (+4 days)
    if (currentIndex >= 3) {
      activities.push({
        message:
          "Your order has arrived at the pickup location and is ready for collection.",
        date: formatDateTime(addDays(created, 4)),
      });
    }
    // Delivered (+6 days or now if status is delivered)
    if (currentIndex >= 4) {
      const deliveredDate =
        status === "delivered" ? new Date() : addDays(created, 6);
      activities.push({
        message:
          "Your order has been delivered. Thank you for shopping with us!",
        date: formatDateTime(deliveredDate),
      });
    }

    // newest first
    return activities.reverse();
  };

  useEffect(() => {
    let mounted = true;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        if (!token) {
          if (!mounted) return;
          setError("Authentication required");
          return;
        }

        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}?include_items=true`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err?.error || `Failed to fetch order (status ${res.status})`
          );
        }

        const data = await res.json();
        const apiOrder: ApiOrder = data.order;

        // Map API shape to our frontend Order
        const mapped: Order = {
          id: String(apiOrder.order_id ?? apiOrder.id),
          user_id: String(apiOrder.user_id ?? ""),
          cart: (apiOrder.items || []).map((it) => ({
            id: `${it.product_id}`,
            product_id: String(it.product_id),
            name: it.product_name,
            image: undefined,
            price: Number(it.unit_price) || Number(it.line_total) || 0,
            quantity: Number(it.quantity) || 1,
            product: null,
          })),
          status: apiOrder.status || "processing",
          address: `${apiOrder.shipping?.address ?? ""}${
            apiOrder.shipping?.city ? ", " + apiOrder.shipping.city : ""
          }`.trim(),
          name:
            apiOrder.contact?.name ??
            `${apiOrder.contact?.first_name ?? ""} ${
              apiOrder.contact?.last_name ?? ""
            }`.trim(),
          phone_number: apiOrder.contact?.phone ?? undefined,
          total_amount: Number(
            apiOrder.amounts?.total ?? apiOrder.amounts?.subtotal ?? 0
          ),
          payment_status:
            apiOrder.payment_status ?? (apiOrder.is_paid ? "paid" : "unpaid"),
          notes: apiOrder.notes ?? null,
          created_at: apiOrder.created_at,
          updated_at: apiOrder.updated_at,
        };

        if (!mounted) return;
        setOrder(mapped);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to fetch order");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchOrder();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleRatingSubmit = async (rating: number, comment: string) => {
    // Implement rating submission to your API as needed
    console.log("Rating submitted:", { rating, comment, orderId: id });
    setIsRatingModalOpen(false);
  };

  if (loading)
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Loading order details...
      </div>
    );
  if (error)
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        Error: {error}
      </div>
    );
  if (!order)
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Order not found
      </div>
    );

  const safeCart = order.cart ?? [];
  const orderStages = getOrderStages(order.status);
  const orderActivities = getOrderActivities(order);
  const formattedCreatedDate = formatDateTime(order.created_at);
  const expectedArrivalDate = new Date(
    new Date(order.created_at).getTime() + 6 * 24 * 60 * 60 * 1000
  );
  const formattedExpectedDate = formatDateTime(expectedArrivalDate);
  const totalItems = safeCart.reduce((sum, it) => sum + (it.quantity || 0), 0);

  const currentIndex = orderStages.findIndex((s) => s.status === "current");
  const progressPercent =
    currentIndex >= 0 ? (currentIndex / (orderStages.length - 1)) * 100 : 0;

  return (
    <>
      <TopBanner theme="dark" />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-medium h-full">Order Details</h1>
            <div>
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
                <h2 className="text-lg font-medium">#{order.id}</h2>
                <p className="text-sm text-gray-500">
                  {totalItems} Products • Order Placed on {formattedCreatedDate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[#184193] text-xl font-semibold">
                  NGN {Number(order.total_amount).toLocaleString()}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Order expected arrival {formattedExpectedDate}
            </p>

            <div className="relative">
              <div className="relative">
                <div className="absolute top-3 left-8 right-8 h-[2px] bg-[#E5E9F2] -z-10" />

                <div className="flex justify-between mb-4 relative z-10">
                  {orderStages.map((stage, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center mb-2 
                        ${
                          stage.status === "completed"
                            ? "bg-[#184193] text-white"
                            : "border bg-white border-[#184193]"
                        }`}
                      >
                        {stage.status === "completed" ? (
                          <svg
                            className="w-3 h-3"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        ) : (
                          <div className="w-1.5 h-1.5 bg-[#184193] rounded-full"></div>
                        )}
                      </div>
                      <span className="text-xs">{stage.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute top-3 left-8 right-8 h-[4px] bg-[#E5E9F2]" />
              <div
                className="absolute top-3 left-8 h-[4px] bg-[#184193]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Order Activity</h2>
            <div className="space-y-4">
              {orderActivities.map((activity, idx) => (
                <div
                  key={idx}
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
              Product ({safeCart.length.toString().padStart(2, "0")})
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
                  {safeCart.map((item) => {
                    const imageUrl = item.image ?? "/404.png";
                    const productName = item.name ?? "Product";
                    const productPrice = Number(item.price) || 0;

                    return (
                      <tr key={item.id} className="border-b">
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
                          NGN {(productPrice * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-3">Shipping Address</h3>
              <div className="bg-[#F8F9FA] p-4 rounded-lg">
                <p className="font-medium mb-2">{order.name}</p>
                <p className="text-sm text-gray-600">{order.address}</p>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Phone Number:</span>{" "}
                  {order.phone_number ?? "N/A"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Pick up Point</h3>
              <div className="bg-[#F8F9FA] p-4 rounded-lg">
                <p className="font-medium mb-2">The Young Shall Grow</p>
                <p className="text-sm text-gray-600">
                  2 Market Rd, Ogui Rd, Enugu
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Phone Number:</span> +234
                  8070001981
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> contact@tys.com
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Order Notes</h3>
              <div className="bg-[#F8F9FA] p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  {order.notes || "No notes provided for this order."}
                </p>
              </div>
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

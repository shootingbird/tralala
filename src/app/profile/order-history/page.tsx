"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  ChevronDown,
  Dot,
  EllipsisVertical,
  SlidersHorizontal,
} from "lucide-react";

import { TopBanner } from "@/components/layout/TopBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Pagination } from "@/components/common/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

type Order = {
  image: string;
  orderId: string;
  product_qty: number;
  createdAt: string;
  status: string;
  placedDate: string;
};

const orders: Order[] = [
  {
    image: "/dummyImage/order1.png",
    orderId: "#100001",
    product_qty: 2,
    createdAt: "2025-07-31T09:15:00Z",
    status: "Shipped",
    placedDate: "2025-07-30T18:45:00Z",
  },
  {
    image: "/dummyImage/order2.png",
    orderId: "#100002",
    product_qty: 1,
    createdAt: "2025-07-30T12:30:00Z",
    status: "Delivered",
    placedDate: "2025-07-29T16:00:00Z",
  },
  {
    image: "/dummyImage/order1.png",
    orderId: "#100003",
    product_qty: 5,
    createdAt: "2025-07-29T15:10:00Z",
    status: "Processing",
    placedDate: "2025-07-29T09:30:00Z",
  },
  {
    image: "/dummyImage/order1.png",
    orderId: "#100004",
    product_qty: 3,
    createdAt: "2025-07-28T10:20:00Z",
    status: "Placed",
    placedDate: "2025-07-28T08:00:00Z",
  },
  {
    image: "/dummyImage/order2.png",
    orderId: "#100005",
    product_qty: 4,
    createdAt: "2025-07-27T14:40:00Z",
    status: "Cancelled",
    placedDate: "2025-07-27T11:15:00Z",
  },
  {
    image: "/dummyImage/order1.png",
    orderId: "#100006",
    product_qty: 6,
    createdAt: "2025-07-26T17:00:00Z",
    status: "Delivered",
    placedDate: "2025-07-26T13:45:00Z",
  },
  {
    image: "/dummyImage/order2.png",
    orderId: "#100007",
    product_qty: 2,
    createdAt: "2025-07-25T08:30:00Z",
    status: "Shipped",
    placedDate: "2025-07-24T22:10:00Z",
  },
];

const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
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

const OrderCard = ({ order }: { order: Order }) => {
  const { image, orderId, product_qty, createdAt, status, placedDate } = order;
  const router = useRouter();

  return (
    <div className="flex justify-between items-start gap-4 md:gap-6 group transition-all duration-200 hover:bg-gray-50 rounded-xl py-3 md:p-4">
      <div className="flex gap-4 md:gap-6 w-full">
        <div className="w-24 h-24 md:w-52 md:h-44 flex-shrink-0 rounded-md overflow-hidden">
          <Image
            src={image}
            alt={`Product(s) for Order ${orderId}`}
            width={208}
            height={176}
            priority
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
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
            <p className="text-xs md:text-base">
              {status}
              {status === "Cancelled"
                ? ", Payment Unsuccessful"
                : ` on ${format(new Date(placedDate), "MMMM d, yyyy")}`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0">
        <button
          className="hidden md:inline-block text-[#184193] text-sm font-medium hover:underline"
          aria-label="Return and Refund"
          onClick={() => {
            router.push(
              `/profile/order-history/return-product?orderId=${encodeURIComponent(
                order?.orderId.trim()
              )}`
            );
          }}
        >
          Return & Refund
        </button>

        <button
          className="md:hidden p-1 text-gray-600 hover:text-[#184193] transition"
          aria-label="Order options"
        >
          <EllipsisVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default function OrderHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(orders.length / pageSize);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Profile", href: "/profile" },
    { label: "Order History" },
  ];

  return (
    <>
      <TopBanner theme="dark" />
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-10">
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          <section className="bg-white px-4 md:px-6 py-6 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl md:text-2xl text-black font-semibold">
                Orders
              </h2>

              <div className="flex justify-between items-center gap-6">
                <p className="hidden md:inline-block text-sm text-gray-700 font-medium">
                  Showing {paginatedOrders.length} Result
                  {paginatedOrders.length !== 1 && "s"} from total{" "}
                  {orders.length}
                </p>

                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-full border-none">
                    <div className="hidden md:flex gap-2 border px-2 py-1 rounded-full">
                      All <ChevronDown className="text-gray-600" />
                    </div>
                    <div className="md:hidden">
                      <SlidersHorizontal className="text-gray-800" />
                    </div>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuItem>Delivered</DropdownMenuItem>
                    <DropdownMenuItem>Cancelled</DropdownMenuItem>
                    <DropdownMenuItem>Shipped</DropdownMenuItem>
                    <DropdownMenuItem>Placed</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {paginatedOrders.map((order) => (
                <div key={order.orderId} className="mb:pb-4 md:border-b">
                  <OrderCard order={order} />
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

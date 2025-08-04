"use client";

import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { EllipsisVertical } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

type Product = {
  image: string;
  name: string;
  category: string;
  variation?: string;
  orderId: string;
  product_qty: number;
  createdAt: string;
  status: string;
  placedDate: string;
};

type OrderStepProps = {
  onClickNext: () => void;
};

const products: Product[] = [
  {
    image: "/dummyImage/order1.png",
    name: "LED Ceiling Light Fixture",
    category: "CEILING LIGHT",
    variation: "Matte Black, 24 Watt",
    orderId: "#100001",
    product_qty: 2,
    createdAt: "2025-07-31T09:15:00Z",
    status: "Shipped",
    placedDate: "2025-07-30T18:45:00Z",
  },
  {
    image: "/dummyImage/order2.png",
    name: "Solar Garden Light",
    category: "OUTDOOR LIGHTING",
    variation: "Single Unit, Motion Sensor",
    orderId: "#100002",
    product_qty: 1,
    createdAt: "2025-07-30T12:30:00Z",
    status: "Delivered",
    placedDate: "2025-07-29T16:00:00Z",
  },
  {
    image: "/dummyImage/order1.png",
    name: "Recessed Panel Light",
    category: "PANEL LIGHT",
    variation: "Round, 18 Watt",
    orderId: "#100003",
    product_qty: 4,
    createdAt: "2025-07-29T15:10:00Z",
    status: "Processing",
    placedDate: "2025-07-29T09:30:00Z",
  },
  {
    image: "/dummyImage/order1.png",
    name: "Vintage Wall Sconce",
    category: "INDOOR DECOR",
    variation: "Antique Bronze, E27 Holder",
    orderId: "#100004",
    product_qty: 3,
    createdAt: "2025-07-28T10:20:00Z",
    status: "Placed",
    placedDate: "2025-07-28T08:00:00Z",
  },
  {
    image: "/dummyImage/order2.png",
    name: "Smart LED Strip Light",
    category: "SMART LIGHTING",
    variation: "RGB, 5 Meters",
    orderId: "#100005",
    product_qty: 2,
    createdAt: "2025-07-27T14:40:00Z",
    status: "Cancelled",
    placedDate: "2025-07-27T11:15:00Z",
  },
  {
    image: "/dummyImage/order1.png",
    name: "Chandelier Light Fixture",
    category: "LUXURY LIGHTING",
    variation: "Crystal Finish, 12 Arms",
    orderId: "#100006",
    product_qty: 1,
    createdAt: "2025-07-26T17:00:00Z",
    status: "Delivered",
    placedDate: "2025-07-26T13:45:00Z",
  },
  {
    image: "/dummyImage/order2.png",
    name: "Industrial Pendant Lamp",
    category: "PENDANT LIGHTS",
    variation: "Rustic Steel, Adjustable Cord",
    orderId: "#100007",
    product_qty: 5,
    createdAt: "2025-07-25T08:30:00Z",
    status: "Shipped",
    placedDate: "2025-07-24T22:10:00Z",
  },
];

const ProductCard = ({ product }: { product: Product }) => {
  const { image, orderId, placedDate, name, category, variation } = product;

  return (
    <div className="flex justify-between items-center gap-4 md:gap-6 group transition-all duration-200 hover:bg-gray-50 rounded-xl py-3 md:p-4">
      <div className="hidden md:inline-block">
        <Checkbox
          id="toggle-2"
          defaultChecked
          className="w-6 h-6 data-[state=checked]:border-[#184193] data-[state=checked]:bg-[#184193] data-[state=checked]:text-white dark:data-[state=checked]:border-[#184193] dark:data-[state=checked]:bg-[#184193]"
        />
      </div>
      <div className="flex gap-4 md:gap-6 w-full">
        <div className="w-25 h-25 md:w-12 md:h-12 flex-shrink-0 rounded-md overflow-hidden">
          <Image
            src={image}
            alt={`Product(s) for Order ${orderId}`}
            width={208}
            height={176}
            priority
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </div>
        <div className="md:flex justify-between w-full">
          <div className="flex flex-col justify-between gap-3 text-sm md:text-base text-gray-700 w-full ">
            <p className="text-sm font-medium md:font-normal">{category}</p>
            <p className="text-xs md:text-sm text-gray-500">
              {`${name} - ${variation} variant`}
            </p>
          </div>

          <div className="flex-shrink-0 flex flex-col justify-between gap-3 text-sm md:text-base text-gray-700">
            <p className="text-gray-500">Order Number: {orderId}</p>
            <p className="text-gray-500">
              Delivery Date: {format(new Date(placedDate), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
      </div>

      <button
        className="md:hidden p-1 text-gray-600 hover:text-[#184193] transition"
        aria-label="Order options"
      >
        <EllipsisVertical className="w-5 h-5" />
      </button>
    </div>
  );
};

const OrderStep: React.FC<OrderStepProps> = ({ onClickNext }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(products.length / pageSize);
  const paginatedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  return (
    <div className="flex flex-col gap-4">
      <p className="font-medium text-lg md:text-xl text-gray-700">
        1. Select the product you want to return
      </p>
      {paginatedProducts.map((product) => (
        <ProductCard key={product.orderId} product={product} />
      ))}

      <div className="flex justify-end gap-2">
        <Button variant="outline" className="max-w-30">
          Cancel
        </Button>
        <Button className="max-w-30" onClick={onClickNext}>
          Next
        </Button>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default OrderStep;

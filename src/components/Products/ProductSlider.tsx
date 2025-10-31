"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, FreeMode, A11y } from "swiper/modules"; // <- modules
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ProductCard from "./ProductCard";
import ProductGridHeader from "./ProductGridHeader";
import CartButton from "./CartButton";
import { Product } from "@/types/product";

type ProductSliderProp = {
  title: string;
  mobileGridSize?: number;
  products: Product[];
  showNavigationButtons?: boolean;
};

export default function ProductSlider({
  title,
  mobileGridSize = 2,
  products,
  showNavigationButtons = true,
}: ProductSliderProp) {
  const [wishlist, setWishlist] = useState<Record<number, boolean>>({});
  const [cartCount, setCartCount] = useState(3);

  function toggleWishlist(id: number) {
    setWishlist((s) => ({ ...s, [id]: !s[id] }));
  }

  function addToCart(id: number) {
    setCartCount((c) => c + 1);
  }

  return (
    <section className="max-w-[1300px] mx-auto px-2 md:px-6 md:pb-4 ">
      <ProductGridHeader title={title} />

      <Swiper
        modules={[Navigation, Pagination, FreeMode, A11y]}
        spaceBetween={8}
        slidesPerView={mobileGridSize}
        navigation={
          showNavigationButtons
            ? {
                nextEl: ".custom-next",
                prevEl: ".custom-prev",
              }
            : false
        }
        freeMode={true}
        grabCursor={true}
        touchEventsTarget="container"
        touchStartPreventDefault={false}
        touchMoveStopPropagation={false}
      >
        {products.map((product, index) => (
          <SwiperSlide key={`${product.productId}-${index}`}>
            <ProductCard
              product={product}
              onToggleWishlist={toggleWishlist}
              index={index}
            />
          </SwiperSlide>
        ))}
        {/* <div className="custom-pagination mt-4 flex justify-center mx-auto gap-1"></div> */}
        {showNavigationButtons && (
          <>
            <button className="custom-prev absolute top-1/2 left-2 z-10 -translate-y-[80%] rounded-full bg-white p-3 shadow-md hover:bg-gray-100">
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

            <button className="custom-next absolute top-1/2 right-2 z-10 -translate-y-[70%] rounded-full bg-white p-3 shadow-md hover:bg-gray-100">
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
          </>
        )}
      </Swiper>
    </section>
  );
}

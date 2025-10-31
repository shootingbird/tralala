// ProductCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types/product";
import VariationSelector from "./VariationSelector";
import { useAppDispatch } from "@/hooks/redux";
import { addToCart } from "@/slices/cartSlice";
import { useToast } from "../ui/toast";

interface ProductCardProps {
  product: Product;
  onToggleWishlist: (id: number) => void;
  isWishlisted?: boolean;
  index: number;
  isGrid?: boolean;
}

export default function ProductCard({
  product: p,
  onToggleWishlist,
  isWishlisted = false,
  index,
  isGrid = false,
}: ProductCardProps) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const handleAddToCart = () => {
    if (p.is_variable_product) {
      // Variable products are handled by VariationSelector
      return;
    }

    // Add simple product to cart
    dispatch(
      addToCart({
        productId: p.productId.toString(),
        variationId: undefined,
        title: p.title,
        image: (p.images && p.images[0]) || "/placeholder.jpg",
        price: p.effective_price || 0,
        quantity: 1,
      })
    );

    // Show success toast
    showToast("Item added to cart successfully!", "success");
  };

  const renderAddToCartButton = () => {
    if (p.is_variable_product) {
      return (
        <VariationSelector product={p}>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            aria-label="Add to cart"
            className="hover:scale-105 transition-transform ring-0 focus:outline-none focus:ring-2 focus:ring-offset-2"
            title="Add to cart"
          >
            <ShoppingCart
              color="#151515"
              size={20}
              className="w-5 h-5 font-thin"
            />
          </button>
        </VariationSelector>
      );
    }

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAddToCart();
        }}
        aria-label="Add to cart"
        className="hover:scale-105 transition-transform ring-0 focus:outline-none focus:ring-2 focus:ring-offset-2"
        title="Add to cart"
      >
        <ShoppingCart color="#151515" size={20} className="w-5 h-5 font-thin" />
      </button>
    );
  };

  return (
    <div className="relative">
      <Link href={`/products/${p.productId}`} className="">
        <article
          className={`bg-white rounded-xl hover-shadow-sm overflow-hidden cursor-pointer ${
            isGrid && index % 2 === 1 ? "mt-4 md:mt-0" : ""
          }`}
        >
          <div className="relative rounded-lg overflow-hidden bg-gray-100">
            <div className="w-full relative aspect-[11/10] md:h-[220px]">
              <Image
                src={(p.images && p.images[0]) || "/placeholder.jpg"}
                alt={p.title}
                fill
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                style={{ objectFit: "cover" }}
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="relative px-2">
            {/* <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M12 .587l3.668 7.431L23 9.753l-5.5 5.358L19.335 24 12 20.011 4.665 24 6.5 15.111 1 9.753l7.332-1.735L12 .587z"
                  fill={i < p.rating ? "#F59E0B" : "#E6E6E6"}
                />
              </svg>
            ))}
          </div> */}

            <p className="text-[10px] text-[#184193]">{p.category}</p>
            <h3 className="text-xs md:text-sm text-gray-800 max-w-[80%] truncate">
              {p.title}
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#E94B1C]">
                  ₦{(p.effective_price || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </article>
      </Link>

      {/* Action buttons placed at the right, one top, one bottom */}
      <div className="absolute top-0 right-1 h-full flex flex-col justify-between items-end px-1 z-10 py-2">
        {/* Top: wishlist */}
        {/* <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(p.productId);
          }}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className=" hover:scale-105 transition-transform ring-0 focus:outline-none focus:ring-2 focus:ring-offset-2 "
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M12 21s-7-4.35-9.07-6.42A5.5 5.5 0 0112 3.5 5.5 5.5 0 0121.07 14.6 27.9 27.9 0 0112 21z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
          )}
        </button> */}
        <div />

        {/* Bottom: add to cart */}
        {renderAddToCartButton()}
      </div>
    </div>
  );
}

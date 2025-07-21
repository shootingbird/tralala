"use client";

import { useEffect } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { StarRating } from "@/components/ui/StarRating";
import { ActionButton } from "../ui/ActionButton";
import { HeartIcon } from "@/components/icons/Heart";
import { useState } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  productId: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  rating: number | 0;
  image: string;
  images: string[];
  enableSales?: boolean;
  isNew?: boolean;
  discount?: {
    amount: number;
    percentage: number;
  };
  titleHeight?: boolean;
  padButton?: boolean;
  variations?: { price: number; quantity: number; variation: string }[];
}

export const ProductCard = ({
  productId,
  title,
  brand,
  price,
  category,
  rating,
  enableSales = true,
  images,
  isNew,
  discount,
  variations = [],
  padButton = false,
  titleHeight = false,
}: ProductCardProps) => {
  const router = useRouter();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart, isInCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  useEffect(() => {
    setIsAdded(isInCart(productId));
  }, [productId, isInCart]);

  const handleAddToCart = () => {
    addToCart({
      productId,
      title,
      price,
      image: images[0],
      quantity: 1,
      category,
      brand,
      rating,
      thumbnail: images[0],
    });
    setIsAdded(true);
  };

  const handleProductClick = () => {
    router.push(`/products/v/${productId}`);
  };

  useEffect(() => {
    setIsWishlisted(isInWishlist(productId));
  }, [productId, isInWishlist]);

  const toggleWishlist = async () => {
    try {
      setIsLoading(true);
      if (isWishlisted) {
        removeFromWishlist(productId);
      } else {
        addToWishlist({
          productId,
          title,
          image: images[0],
          description: title,
          price,
          category,
          brand,
          rating,
          stock: 1,
          thumbnail: images[0],
        });
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error("Error updating wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };
  console.log(variations);
  return (
    <div className="flex flex-col">
      <div
        className="relative group cursor-pointer"
        onClick={handleProductClick}
      >
        <div className="relative w-full aspect-square rounded-lg overflow-hidden">
          <Image
            src={
              Array.isArray(images) && images.length > 0
                ? images[0]
                : "/logo.png"
            }
            alt={title || "ProductImage"}
            fill
            className="object-cover transition-transform duration-600 ease-out group-hover:scale-150"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {isNew && (
          <span className="absolute top-3 right-3 bg-white px-2 py-1 text-xs font-medium rounded">
            NEW
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between px-1">
          <StarRating rating={rating} />
          <button
            className={`p-2 rounded-full hover:bg-gray-100/80 transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            aria-label="Add to wishlist"
            onClick={toggleWishlist}
            disabled={isLoading}
          >
            <HeartIcon
              className={isWishlisted ? "text-red-500" : "text-black"}
              isFilled={isWishlisted}
            />
          </button>
        </div>
        <div
          className={`space-y-1 ${
            titleHeight ? "h-5" : "h-8"
          } md:h-auto cursor-pointer px-1`}
          onClick={handleProductClick}
        >
          <h3 className="font-medium text-[15px] line-clamp-2 md:line-clamp-1">
            {title}
          </h3>
          <p className="hidden md:flex text-gray-600 text-xs line-clamp-1">
            {brand || category}
          </p>
        </div>

        <div className="flex items-start gap-2 mb-2 md:mb-[1rem]  px-1 flex-col justify-center">
          <span className="font-semibold">NGN {price.toLocaleString()}</span>
          {enableSales && discount && (
            <div className="hidden md:flex items-center space-x-1 text-xs">
              <span className="bg-[#38CB89] text-[.6rem] font-bold text-white px-1.5 py-0.5 rounded">
                SALE
              </span>
              <span className="text-black text-xs font-semibold">
                <svg
                  width="4"
                  height="5"
                  viewBox="0 0 4 5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="2" cy="2.5" r="2" fill="#38CB89" />
                </svg>
              </span>
              <span className="text-black text-[.7rem] font-[600]">
                Save NGN {discount.amount.toLocaleString()}
              </span>
              <span className="text-black text-xs font-semibold">
                <svg
                  width="4"
                  height="5"
                  viewBox="0 0 4 5"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="2" cy="2.5" r="2" fill="#38CB89" />
                </svg>
              </span>
              <span className="text-black text-[.7rem] font-[600]">
                {discount.percentage}%
              </span>
            </div>
          )}
        </div>
        <div className={` px-1 md:px-1 `}>
          {variations.length > 0 ? (
            <ActionButton
              variant={isAdded ? "outline" : "primary"}
              fullWidth
              isCart
              onClick={() => router.push(`/products/v/${productId}`)}
            >
              {isAdded ? "ADDED TO CART" : "CHOOSE VARIATION"}
            </ActionButton>
          ) : (
            <ActionButton
              variant={isAdded ? "outline" : "primary"}
              fullWidth
              isCart
              onClick={handleAddToCart}
            >
              {isAdded ? "ADDED TO CART" : "ADD TO CART"}
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  );
};

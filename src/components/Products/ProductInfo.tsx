"use client";

import { useState } from "react";
import { NormalizedProduct } from "@/types/product";
import { StarRating } from "@/components/ui/StarRating";
import { HeartIcon } from "@/components/icons/Heart";
import { BookmarkIcon } from "@/components/icons/bookmark";
import { Share2 } from "lucide-react";

interface ProductInfoProps {
  product: NormalizedProduct;
  priceRange: { min: number; max: number } | null;
}

export function ProductInfo({ product, priceRange }: ProductInfoProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(42); // Example static count
  const [bookmarked, setBookmarked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          url: url,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="flex-1">
      <h1 className="text-2xl font-bold mb-2 text-gray-700">{product.name}</h1>
      <p className="text-gray-400 text-sm mb-4">{product.category}</p>

      {/* Reviews */}
      <div className="flex items-center mb-4">
        <StarRating rating={4.5} />
        <span className="ml-2 text-sm text-gray-600">(128 reviews)</span>
      </div>

      {/* Likes, Bookmark, Share */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={handleLike}
          className="flex items-center space-x-4 text-gray-600 hover:text-red-500 bg-[#FFF0F0] px-3 py-2 rounded-sm"
        >
          <HeartIcon isFilled={liked} className="w-5 h-5" />
          <span className="text-sm text-[#D46F77]">{likesCount}</span>
        </button>
        <button
          onClick={handleBookmark}
          className={`bg-[#EDF0F8] rounded-md p-2 ${
            bookmarked ? "text-blue-500" : "text-gray-600 hover:text-blue-50"
          }`}
        >
          <BookmarkIcon isFilled={bookmarked} className="w-5 h-5" />
        </button>
        <button
          onClick={handleShare}
          className="0 bg-[#EDF0F8] rounded-md p-2 text-gray-600 hover:text-green-500"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <p className="text-gray-600 mb-8 leading-relaxed hidden md:block">
        {product.description}
      </p>

      <p className="text-lg md:text-2xl text-gray-700 font-semibold border-y border-gray-200 py-4">
        NGN{" "}
        {priceRange
          ? `${priceRange.min.toLocaleString()} - ${priceRange.max.toLocaleString()}`
          : product.price.toLocaleString()}
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  image_urls: string[];
  name: string;
  title: string;
}

export function ProductImageGallery({
  image_urls,
  name,
  title,
}: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === image_urls.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? image_urls.length - 1 : prev - 1
    );
  };

  return (
    <div className="flex-1">
      {/* Main Image */}
      <div className="relative aspect-square mb-4">
        <div className="relative flex justify-center items-center aspect-square overflow-hidden rounded-2xl bg-white">
          {image_urls?.[currentImageIndex] ? (
            <Image
              src={image_urls[currentImageIndex]}
              alt={`${name} - View ${currentImageIndex + 1}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400">No image available</span>
            </div>
          )}

          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-5 gap-4">
        {image_urls.length > 1 &&
          image_urls.map((image, index) => (
            <div
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`relative aspect-square overflow-hidden rounded-lg ${
                currentImageIndex === index
                  ? "ring-1 ring-[#184193]/50 ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image}
                alt={`${title} view ${index + 1}`}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 33vw, 25vw"
                priority={index === 0}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/logo.png";
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

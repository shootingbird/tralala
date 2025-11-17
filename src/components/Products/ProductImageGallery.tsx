"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

interface ProductImageGalleryProps {
  image_urls: string[];
  videos?: string[];
  name: string;
  title: string;
}

export function ProductImageGallery({
  image_urls,
  videos = [],
  name,
  title,
}: ProductImageGalleryProps) {
  const media: Array<{ type: "image" | "video"; url: string }> = [
    ...(image_urls || []).map((u) => ({ type: "image" as const, url: u })),
    ...(Array.isArray(videos) ? videos : []).map((u) => ({
      type: "video" as const,
      url: u,
    })),
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const mediaRefs = useRef<Array<HTMLVideoElement | HTMLIFrameElement | null>>(
    []
  );

  const isYouTube = (url: string) =>
    /youtu\.be|youtube\.com/.test(url.toLowerCase());

  const getYouTubeId = (url: string): string | null => {
    try {
      const u = new URL(url);
      // shorts
      if (
        u.hostname.includes("youtube.com") &&
        u.pathname.startsWith("/shorts/")
      ) {
        const id = u.pathname.split("/").pop() || "";
        return id;
      }
      // watch?v=
      const v = u.searchParams.get("v");
      if (v) return v;
      // youtu.be/ID
      if (u.hostname === "youtu.be") {
        const id = u.pathname.replace("/", "");
        return id;
      }
      return null;
    } catch {
      return null;
    }
  };

  const toYouTubeEmbed = (url: string) => {
    const id = getYouTubeId(url);
    if (!id) return url;
    const params = new URLSearchParams({
      enablejsapi: "1",
      modestbranding: "1",
    });
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  };

  const getYouTubeThumbnail = (url: string) => {
    const id = getYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
  };

  const pauseMedia = (index: number) => {
    const ref = mediaRefs.current[index];
    if (!ref) return;
    if (ref instanceof HTMLVideoElement) {
      try {
        ref.pause();
      } catch {}
      return;
    }
    // YouTube iframe pause via postMessage
    try {
      ref.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
        "*"
      );
    } catch {}
  };

  const nextImage = () => {
    pauseMedia(currentIndex);
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    pauseMedia(currentIndex);
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  return (
    <div className="flex-1">
      {/* Main Media */}
      <div className="relative aspect-square mb-4">
        <div className="relative flex justify-center items-center aspect-square overflow-hidden rounded-2xl bg-white">
          {media?.[currentIndex] ? (
            media[currentIndex].type === "image" ? (
              <Image
                src={media[currentIndex].url}
                alt={`${name} - View ${currentIndex + 1}`}
                fill
                className="object-fit z-0 bg-white"
              />
            ) : isYouTube(media[currentIndex].url) ? (
              <iframe
                src={toYouTubeEmbed(media[currentIndex].url)}
                title={`${title} video ${currentIndex + 1}`}
                className="absolute inset-0 w-full h-full z-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                frameBorder="0"
                ref={(el) => (mediaRefs.current[currentIndex] = el)}
              />
            ) : (
              <video
                src={media[currentIndex].url}
                controls
                className="absolute inset-0 w-full h-full object-cover z-0"
                ref={(el) => (mediaRefs.current[currentIndex] = el)}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-gray-400">No media available</span>
            </div>
          )}

          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors z-20"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors z-20"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Thumbnails (images first, then videos) */}
      <div className="grid grid-cols-5 gap-4">
        {media.length > 1 &&
          media.map((item, index) => (
            <div
              key={`${item.type}-${index}`}
              onClick={() => {
                pauseMedia(currentIndex);
                setCurrentIndex(index);
              }}
              className={`relative aspect-square overflow-hidden rounded-lg ${
                currentIndex === index
                  ? "ring-1 ring-[#184193]/50 ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              {item.type === "image" ? (
                <Image
                  src={item.url}
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
              ) : isYouTube(item.url) ? (
                <div />
              ) : (
                <div className="w-full h-full bg-black/80 text-white flex items-center justify-center">
                  <Play className="h-6 w-6" />
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

"use client";
import { HiOutlineCamera } from "react-icons/hi2";
import React, { useState, useRef } from "react";
import { X } from "lucide-react";
import { useUploadImageMutation } from "@/slices/products/productApiSlice";
import { useRouter } from "next/navigation";

interface ImageSearchInputProps {
  onSearch?: (query: string, imageUrl?: string) => void;
  placeholder?: string;
  className?: string;
}

export default function ImageSearchInput({
  onSearch,
  placeholder = "Search products or upload image...",
  className = "",
}: ImageSearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadImage] = useUploadImageMutation();

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    setIsUploading(true);

    try {
      const base64 = await toBase64(file);
      const result = await uploadImage({
        image: base64,
        filename: file.name,
      }).unwrap();

      if (result.url) {
        setUploadedImageUrl(result.url);
        const params = new URLSearchParams();
        params.set("image_url", result.url);
        router.push(`/products?${params.toString()}`);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
      setPreviewImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();

    const params = new URLSearchParams();
    if (uploadedImageUrl) {
      params.set("image_url", uploadedImageUrl);
    } else if (query.trim()) {
      params.set("q", query.trim());
    } else return;

    router.push(`/products?${params.toString()}`);
    onSearch?.(query, uploadedImageUrl || undefined);
  };

  const clearImage = () => {
    setUploadedImageUrl(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`relative w-full max-w-2xl mx-auto transition-all duration-300 ${className}`}
    >
      <div className="flex items-center bg-white border border-gray-700 rounded-full shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-[#E94B11] transition-all duration-200 h-11 sm:h-12 md:h-14 px-[2px]">
        {/* Image Preview */}
        {previewImage && (
          <div className="relative ml-2 shrink-0">
            <img
              src={previewImage}
              alt="Selected"
              className="w-7 h-7 sm:w-8 sm:h-8 object-cover rounded"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] hover:bg-red-600"
            >
              <X size={8} />
            </button>
          </div>
        )}

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={uploadedImageUrl ? "Searching by image..." : placeholder}
          className="flex-1 min-w-0 px-3 sm:px-4 py-2 text-sm sm:text-base placeholder-gray-400 outline-none bg-transparent"
          disabled={!!uploadedImageUrl}
        />

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 sm:px-3 disabled:opacity-50 flex items-center justify-center"
          title="Upload image"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <HiOutlineCamera
              size={24}
              className="text-gray-700 hover:text-[#E94B11] transition-colors duration-200"
            />
          )}
        </button>

        {/* Search Button (with padding space) */}
        <div className="h-full flex items-center px-[2px]">
          <button
            type="submit"
            className="h-[calc(100%-4px)] px-5 sm:px-6 bg-gradient-to-r from-[#f2683d] to-[#E94B11] hover:opacity-90 text-white text-sm sm:text-base rounded-full transition-all duration-200 disabled:opacity-50"
          >
            GO
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </form>
  );
}

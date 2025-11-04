"use client";

import React, { useState, useRef } from "react";
import { Camera, Search, X } from "lucide-react";
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

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    // Create preview
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
        // Automatically trigger search after successful upload
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
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (uploadedImageUrl) {
      // Search by image URL
      const params = new URLSearchParams();
      params.set("image_url", uploadedImageUrl);
      router.push(`/products?${params.toString()}`);
    } else if (query.trim()) {
      // Search by text
      const params = new URLSearchParams();
      params.set("q", query.trim());
      router.push(`/products?${params.toString()}`);
    }

    if (onSearch) {
      onSearch(query, uploadedImageUrl || undefined);
    }
  };

  const clearImage = () => {
    setUploadedImageUrl(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className="flex items-center bg-white border border-gray-500 rounded-lg overflow-hidden">
        {/* Image Preview */}
        {previewImage && (
          <div className="relative ml-2">
            <img
              src={previewImage}
              alt="Selected"
              className="w-8 h-8 object-cover rounded"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
            >
              <X size={8} />
            </button>
          </div>
        )}

        {/* Text Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={uploadedImageUrl ? "Searching by image..." : placeholder}
          className="flex-1 px-4 py-3 text-sm placeholder-gray-400 outline-none"
          disabled={!!uploadedImageUrl}
        />

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-3 py-3 bg-gray-50 hover:bg-gray-100 border-l border-gray-200 disabled:opacity-50"
          title="Upload image"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <Camera size={16} className="text-[#E94B1C]" />
          )}
        </button>

        {/* Search Button */}
        <button
          type="submit"
          disabled={!query.trim() && !uploadedImageUrl}
          className="px-4 py-3 bg-white hover:bg-gray-50 border-l border-gray-200 disabled:opacity-50"
        >
          <Search size={18} className="text-[#E94B1C]" />
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Status */}
      {isUploading && (
        <div className="absolute top-full mt-1 text-sm text-gray-600">
          Uploading image...
        </div>
      )}
    </form>
  );
}

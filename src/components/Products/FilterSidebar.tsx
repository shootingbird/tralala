"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Category } from "@/types/product";

export type SortOption =
  | "relevance"
  | "price-low"
  | "price-high"
  | "rating-high"
  | "newest";

export interface FilterOptions {
  selectedCategories: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onApplyFilters: () => void;
  categories: Category[];
}

const sortOptions = [
  { value: "relevance" as SortOption, label: "Relevance" },
  { value: "price-low" as SortOption, label: "Price: Low to High" },
  { value: "price-high" as SortOption, label: "Price: High to Low" },
  { value: "rating-high" as SortOption, label: "Rating: High to Low" },
  { value: "newest" as SortOption, label: "Newest" },
];

export default function FilterSidebar({
  isOpen,
  onClose,
  sort,
  onSortChange,
  filters,
  onFiltersChange,
  onApplyFilters,
  categories,
}: FilterSidebarProps) {
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newSelected = checked
      ? [...filters.selectedCategories, categoryId]
      : filters.selectedCategories.filter((id) => id !== categoryId);
    onFiltersChange({ ...filters, selectedCategories: newSelected });
  };

  const handleRatingChange = (value: string) => {
    onFiltersChange({
      ...filters,
      minRating: value ? parseFloat(value) : undefined,
    });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0  z-40" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`fixed overflow-auto top-0 left-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Sort */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Sort By</h3>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Category</h3>
            <div className="space-y-2 max-h-auto overflow-y-auto">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.selectedCategories.includes(category.id)}
                    onChange={(e) =>
                      handleCategoryChange(category.id, e.target.checked)
                    }
                    className="mr-2"
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Price Range</h3>
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice || ""}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    minPrice: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
              />
              <Input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice || ""}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    maxPrice: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
          </div>

          {/* Rating */}
          {/* <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Minimum Rating</h3>
            <Input
              type="number"
              placeholder="Min Rating"
              min="0"
              max="5"
              step="0.1"
              value={filters.minRating || ""}
              onChange={(e) => handleRatingChange(e.target.value)}
            />
          </div> */}

          {/* Apply Button */}
          <Button onClick={onApplyFilters} className="w-full bg-[#E94B1C]">
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  );
}

// components/product/ProductFilter.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import PriceRangeSlider from "./RangeSlider";

type FilterValue = string[] | number[] | { min?: number; max?: number };

export interface FilterOption {
  id: string;
  label: string;
  type: "checkbox" | "radio" | "range" | "rating";
  options?: Array<{ value: string; label: string; amount?: number }>;
  range?: { min: number; max: number };
}

interface ProductFilterProps {
  filters: FilterOption[];
  onFilterChange: (filters: Record<string, FilterValue>) => void;
  activeFilters?: Record<string, FilterValue>;
  onApply?: () => void;
}

const isArrayFilter = (value: any): value is string[] | number[] => {
  return Array.isArray(value);
};

const isRangeFilter = (value: any): value is { min?: number; max?: number } => {
  return value && typeof value === "object" && !Array.isArray(value);
};

export const ProductFilter = ({
  filters,
  onFilterChange,
  activeFilters = {},
  onApply,
}: ProductFilterProps) => {
  // Internal filter state (UI only)
  const [localFilters, setLocalFilters] = useState<Record<string, FilterValue>>(
    {}
  );

  console.log(localFilters);

  // Sync with external activeFilters when they change
  // useEffect(() => {
  //   setLocalFilters(activeFilters);
  // }, [activeFilters]);

  // Handle individual filter changes and emit immediately
  const handleFilterChange = useCallback(
    (filterId: string, value: FilterValue) => {
      const newFilters = { ...localFilters };

      // Remove empty/null values
      if (
        value === undefined ||
        value === null ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === "string" && value.trim() === "") ||
        (isRangeFilter(value) &&
          value.min === undefined &&
          value.max === undefined)
      ) {
        delete newFilters[filterId];
      } else {
        newFilters[filterId] = value;
      }

      // Update local state
      setLocalFilters(newFilters);

      // Emit change to parent immediately
      onFilterChange(newFilters);
    },
    [localFilters, onFilterChange]
  );

  // Handle checkbox selection
  const handleCheckboxChange = useCallback(
    (filterId: string, optionValue: string, checked: boolean) => {
      const currentValues = isArrayFilter(localFilters[filterId])
        ? (localFilters[filterId] as string[])
        : [];

      const newValues = checked
        ? [...currentValues, optionValue]
        : currentValues.filter((v: string) => v !== optionValue);

      handleFilterChange(filterId, newValues);
    },
    [localFilters, handleFilterChange]
  );

  // Handle radio selection
  const handleRadioChange = useCallback(
    (filterId: string, optionValue: string) => {
      handleFilterChange(filterId, [optionValue]);
    },
    [handleFilterChange]
  );

  // Handle range slider changes
  const handleRangeChange = useCallback(
    (filterId: string, range: { min?: number; max?: number }) => {
      handleFilterChange(filterId, range);
    },
    [handleFilterChange]
  );

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setLocalFilters({});
    onFilterChange({});
  }, [onFilterChange]);

  const activeFilterCount = Object.keys(localFilters).length;

  return (
    <div className="w-full md:max-w-xs bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium">Filters</h2>
        {activeFilterCount > 0 && (
          <button
            onClick={handleResetFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear All ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Filter Groups */}
      {filters.map((filter) => {
        const hasActiveValue = localFilters[filter.id] !== undefined;

        return (
          <div
            key={filter.id}
            className="mb-6 border-b border-gray-100 pb-6 last:border-b-0"
          >
            {/* Filter Header */}
            <div className="flex items-center w-full justify-between mb-4">
              <h3 className="text-base font-medium text-gray-900">
                {filter.label}
              </h3>
              {hasActiveValue && (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    {isArrayFilter(localFilters[filter.id])
                      ? (localFilters[filter.id] as any[]).length
                      : "1"}
                  </span>
                  <button
                    onClick={() => handleFilterChange(filter.id, [])}
                    className="text-xs text-gray-400 hover:text-gray-600 min-h-[32px] min-w-[32px] flex items-center justify-center rounded"
                    aria-label={`Clear ${filter.label} filter`}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Radio Filter */}
            {filter.type === "radio" && filter.options && (
              <div className="space-y-3">
                {filter.options.map((option) => {
                  const isSelected =
                    isArrayFilter(localFilters[filter.id]) &&
                    (localFilters[filter.id] as string[])[0] === option.value;

                  return (
                    <label
                      key={option.value}
                      className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-3 -m-3 rounded transition-colors min-h-[44px]"
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name={`filter-${filter.id}`}
                          value={option.value}
                          checked={isSelected}
                          onChange={() =>
                            handleRadioChange(filter.id, option.value)
                          }
                          className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                          {option.label}
                        </span>
                      </div>
                      {option.amount !== undefined && (
                        <span className="text-xs text-blue-600 font-medium">
                          {option.amount.toLocaleString()}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {/* Checkbox Filter */}
            {filter.type === "checkbox" && filter.options && (
              <div className="space-y-3">
                {filter.options.map((option) => {
                  const isChecked =
                    isArrayFilter(localFilters[filter.id]) &&
                    (localFilters[filter.id] as string[]).includes(
                      option.value
                    );

                  return (
                    <label
                      key={option.value}
                      className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-3 -m-3 rounded transition-colors min-h-[44px]"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            handleCheckboxChange(
                              filter.id,
                              option.value,
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                          {option.label}
                        </span>
                      </div>
                      {option.amount !== undefined && (
                        <span className="text-xs text-blue-600 font-medium">
                          {option.amount.toLocaleString()}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {/* Rating Filter */}
            {filter.type === "rating" && filter.options && (
              <div className="space-y-3">
                {filter.options.map((rating) => {
                  const isChecked =
                    isArrayFilter(localFilters.rating) &&
                    (localFilters.rating as number[]).includes(
                      Number(rating.value)
                    );

                  return (
                    <label
                      key={rating.value}
                      className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-3 -m-3 rounded transition-colors min-h-[44px]"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const currentValues = isArrayFilter(
                              localFilters.rating
                            )
                              ? (localFilters.rating as number[])
                              : [];

                            const newValues = e.target.checked
                              ? [...currentValues, Number(rating.value)]
                              : currentValues.filter(
                                  (v: number) => v !== Number(rating.value)
                                );

                            handleFilterChange("rating", newValues);
                          }}
                          className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                        <div className="ml-3 flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Number(rating.value)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            & above
                          </span>
                        </div>
                      </div>
                      {rating.amount !== undefined && (
                        <span className="text-xs text-blue-600 font-medium">
                          {rating.amount.toLocaleString()}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {/* Range Filter */}
            {filter.type === "range" && filter.range && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    ₦{" "}
                    {(isRangeFilter(localFilters.price)
                      ? (localFilters.price as any)?.min ?? filter.range.min
                      : filter.range.min
                    ).toLocaleString()}
                  </span>
                  <span>
                    ₦{" "}
                    {(isRangeFilter(localFilters.price)
                      ? (localFilters.price as any)?.max ?? filter.range.max
                      : filter.range.max
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="relative">
                  <PriceRangeSlider
                    min={filter.range.min}
                    max={filter.range.max}
                    minValue={
                      isRangeFilter(localFilters.price)
                        ? (localFilters.price as any)?.min ?? filter.range.min
                        : filter.range.min
                    }
                    maxValue={
                      isRangeFilter(localFilters.price)
                        ? (localFilters.price as any)?.max ?? filter.range.max
                        : filter.range.max
                    }
                    onValueChange={(values) =>
                      handleRangeChange("price", values)
                    }
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-blue-900">
              Active Filters
            </h4>
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(localFilters).map(([key, value]) => {
              let displayValue = "";

              if (Array.isArray(value)) {
                if (key === "category") {
                  // For categories, show names instead of IDs
                  const categoryFilter = filters.find(
                    (f) => f.id === "category"
                  );
                  if (categoryFilter?.options) {
                    const selectedNames = value.map(
                      (v) =>
                        categoryFilter.options?.find(
                          (opt) => opt.value === String(v)
                        )?.label || String(v)
                    );
                    displayValue =
                      selectedNames.length > 1
                        ? `${selectedNames.length} selected`
                        : selectedNames[0] || String(value[0]);
                  } else {
                    displayValue =
                      value.length > 1
                        ? `${value.length} selected`
                        : String(value[0]);
                  }
                } else if (key === "subcat") {
                  // For subcategories, show IDs for now since they're not in filter options
                  // This could be improved by passing subcategory data to the filter component
                  displayValue =
                    value.length > 1
                      ? `${value.length} selected`
                      : String(value[0]);
                } else {
                  displayValue =
                    value.length > 1
                      ? `${value.length} selected`
                      : String(value[0]);
                }
              } else if (isRangeFilter(value)) {
                const range = value as { min?: number; max?: number };
                if (range.min !== undefined && range.max !== undefined) {
                  displayValue = `₦${range.min.toLocaleString()} - ₦${range.max.toLocaleString()}`;
                } else if (range.min !== undefined) {
                  displayValue = `From ₦${range.min.toLocaleString()}`;
                } else if (range.max !== undefined) {
                  displayValue = `Up to ₦${range.max.toLocaleString()}`;
                }
              } else {
                displayValue = String(value);
              }

              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                >
                  <span className="font-medium">{key}:</span>
                  <span>{displayValue}</span>
                  <button
                    onClick={() => handleFilterChange(key, [])}
                    className="ml-1 hover:bg-blue-200 rounded-full p-1 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                    aria-label={`Remove ${key} filter`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Apply Filters Button - Only show on mobile */}
      {onApply && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              onFilterChange(localFilters);
              onApply();
            }}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductFilter;

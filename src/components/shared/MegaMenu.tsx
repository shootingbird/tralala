// src/app/mega-menu/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button"; // adjust import to your shadcn path if needed
import { X } from "lucide-react";
import { useGetCategoriesQuery } from "@/slices/products/productApiSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

type Column = {
  id: string;
  title: string;
  items: { name: string; id: string }[];
};

const COLORS = {
  heading: "text-[#111827]",
  link: "text-[#21164a]",
  orange: "bg-[#e95a2a]",
};
export default function MegaMenuPage({
  isDropdown = false,
  onClose,
}: {
  isDropdown?: boolean;
  onClose?: () => void;
}) {
  const categories = useSelector(
    (state: RootState) => state.categories.categories
  );
  const { isLoading } = useGetCategoriesQuery(undefined, {
    skip: categories.length > 0, // Skip if already loaded
  });
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (categories.length > 0) {
      // Convert categories to columns format
      const convertedColumns: Column[] = categories.map((cat) => ({
        id: cat.id,
        title: cat.name.toUpperCase(),
        items: cat.subcategories.map((sub) => ({ name: sub.name, id: sub.id })),
      }));

      setColumns(convertedColumns);

      // Set default selected to first category
      if (convertedColumns.length > 0) {
        setSelectedId(convertedColumns[0].id);
      }
    }
  }, [categories]);

  // Open panel when selection changes (mobile)
  useEffect(() => {
    if (selectedId) setPanelOpen(true);
  }, [selectedId]);

  useEffect(() => {
    if (panelOpen) {
      setTimeout(() => closeBtnRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [panelOpen]);

  // Close on escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPanelOpen(false);
        onClose?.();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Trap focus inside panel when open (simple)
  useEffect(() => {
    if (!panelOpen || !panelRef.current) return;
    const first = panelRef.current.querySelector<HTMLElement>(
      "button, a, [tabindex]:not([tabindex='-1'])"
    );
    first?.focus();
  }, [panelOpen]);

  const handleCategoryClick = (id: string) => {
    setSelectedId(id);
    // panelOpen set by effect for mobile; on desktop the panel won't be visible due to CSS
  };

  const openSubcategory = (id: string) => {
    setSelectedId(id);
    setPanelOpen(true);
  };

  const closeSubcategory = () => {
    setPanelOpen(false);
  };

  const selectedColumn = columns.find((c) => c.id === selectedId) ?? null;

  if (isLoading) {
    return (
      <main className="text-slate-900">
        <section className="mx-auto max-w-7xl relative z-50">
          <div className="bg-white w-full h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading categories...</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className=" text-slate-900">
      <section className=" mx-auto max-w-7xl relative z-50">
        {/* MOBILE / TABLET VIEW: below lg */}
        <div className="bg-white lg:hidden w-2/3 border fixed top-0 h-screen overflow-hidden">
          {/* LEFT: categories list - takes full width when panel closed; slides left when panelOpen */}
          <aside
            aria-label="Categories"
            className={`absolute inset-0 bg-white p-6 overflow-auto transform transition-all duration-600 ease-in-out ${
              panelOpen ? "translate-x-full" : "delay-200 translate-x-0"
            }`}
            aria-hidden={panelOpen}
          >
            <ul className="space-y-8">
              {columns.map((col) => {
                const isActive = col.id === selectedId;
                return (
                  <li key={col.id}>
                    <button
                      onClick={() => openSubcategory(col.id)}
                      className="w-full text-left hover:bg-gray-50 transition-colors duration-200 rounded-md p-2"
                      aria-expanded={isActive}
                      aria-controls="subcategory-panel"
                    >
                      {isActive ? (
                        <span
                          className={`inline-block px-4 py-2 rounded-full ${COLORS.orange} text-white font-semibold text-sm tracking-widest`}
                        >
                          {col.title}
                        </span>
                      ) : (
                        <span
                          className={`font-semibold uppercase tracking-wider ${COLORS.heading} text-sm`}
                        >
                          {col.title}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* RIGHT: subcategory panel - full width; slides in from right; when open it covers the screen */}
          <div
            id="subcategory-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="subcategory-title"
            className={`absolute inset-0 bg-white p-6 overflow-auto transform transition-all duration-600 ease-in-out ${
              panelOpen ? "delay-200 translate-x-0" : "-translate-x-full"
            }`}
            aria-hidden={!panelOpen}
          >
            {/* header */}
            <div className="flex items-center justify-between mb-6">
              <h3
                id="subcategory-title"
                className={`text-base font-medium italic ${COLORS.link}`}
              >
                {selectedColumn ? selectedColumn.title : "Category"}
              </h3>

              <Button
                ref={closeBtnRef}
                variant="ghost"
                onClick={closeSubcategory}
                aria-label="Close subcategory"
                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-200"
              >
                <X size={24} />
              </Button>
            </div>

            {/* items */}
            <ul className="space-y-6">
              {selectedColumn && selectedColumn.items.length > 0 ? (
                selectedColumn.items.map((it, idx) => (
                  <li key={idx}>
                    <Link
                      href={`/products?subcat=${it.id}`}
                      className={`block text-lg italic ${COLORS.link} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-200 hover:text-blue-600 transition-colors duration-200`}
                    >
                      {it.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li>
                  <p className="text-sm text-gray-500">No items available.</p>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* DESKTOP VIEW: unchanged grid (shown at lg+) */}
        <div className="hidden lg:block absolute bg-white z-50 px-12 mx-auto">
          <div className="mx-auto max-w-7xl">
            {/* TOP ROW */}
            <div className="grid grid-cols-5 gap-x-12 items-start">
              {columns.slice(0, 5).map((col) => (
                <nav key={col.id} aria-label={col.title} className="min-w-0">
                  <Link href={`/products?category=${col.id}`}>
                    <h3 className="font-semibold uppercase tracking-wider text-sm text-[#111827] cursor-pointer">
                      {col.title}
                    </h3>
                  </Link>
                  <ul className="mt-4 space-y-3">
                    {col.items.map((item, i) => (
                      <li key={i}>
                        <Link href={`/products?subcat=${item.id}`}>
                          <span className="text-sm italic text-[#21164a] hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-200 cursor-pointer block">
                            {item.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>

            <div className="h-12" />

            {/* BOTTOM ROW titles only */}
            <div className="grid grid-cols-5 gap-x-12">
              {columns.slice(5).map((col) => (
                <div key={col.id}>
                  <Link href={`/products?category=${col.id}`}>
                    <h4 className="font-semibold uppercase tracking-wider text-sm text-[#111827] cursor-pointer">
                      {col.title}
                    </h4>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

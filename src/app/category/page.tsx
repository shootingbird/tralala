"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useGetCategoriesQuery } from "@/slices/products/productApiSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import Header from "@/components/shared/Header";
import Image from "next/image";

type Subcategory = { id: string; name: string };
type Category = {
  id: string;
  name: string;
  image_url?: string;
  subcategories: Subcategory[];
};

export default function Page() {
  const cached = useSelector((s: RootState) => s.categories.categories) as
    | Category[]
    | [];

  const { data: fetched, isLoading } = useGetCategoriesQuery(undefined, {
    skip: cached && cached.length > 0,
  });

  const categories: Category[] = (
    cached && cached.length > 0
      ? cached
      : (fetched as Category[] | undefined) ?? []
  ) as Category[];

  const [localLoading, setLocalLoading] = useState<boolean>(
    isLoading && categories.length === 0
  );

  useEffect(() => {
    setLocalLoading(isLoading && categories.length === 0);
  }, [isLoading, categories.length]);

  if (localLoading) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
        <section className="mx-auto max-w-7xl p-6">
          <div className="bg-white w-full h-56 flex items-center justify-center rounded-lg shadow-sm">
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
    <main className="min-h-screen bg-white text-slate-900 ">
      <Header showSearchbar={false} />
      <section className="mx-auto max-w-7xl">
        {/* Table: left column = category (image + name), right column = subcategories */}
        <div className="">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Subcategories</th>
              </tr>
            </thead>

            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-6 text-sm text-gray-500">
                    No categories available.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="p-4 align-top bg-gray-100">
                      <Link
                        href={`/products?category=${cat.id}`}
                        className="items-start gap-3"
                      >
                        <div className="w-20 h-14 rounded-md overflow-hidden bg-gray-50 border flex items-center justify-center">
                          {cat.image_url ? (
                            <Image
                              src={cat.image_url}
                              alt={cat.name}
                              width={500}
                              height={500}
                              unoptimized
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-[#111827]">
                            {cat.name}
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td className="pl-4 pt-4 flex flex-1">
                      {cat.subcategories.length === 0 ? (
                        <div className="text-sm text-gray-500">
                          No subcategories.
                        </div>
                      ) : (
                        <ul className="space-y-2 flex-1 flex items-start gap-2 flex-wrap">
                          {cat.subcategories.map((s) => (
                            <li
                              key={s.id}
                              className="flex items-center justify-between bg-white rounded"
                            >
                              <Link
                                href={`/products?subcat=${s.id}`}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 min-w-10 bg-white border rounded-md shadow-sm hover:shadow-md transition text-sm text-[#21164a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-200"
                              >
                                {s.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

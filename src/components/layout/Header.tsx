"use client";
import { Suspense } from "react";
import type React from "react";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRightIcon, Menu, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { CartPanel } from "@/components/cart/CartPanel";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, LogOut, User, ShoppingBag, Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

const SearchComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative  flex">
      <div className="absolute hidden md:flex flex-col h-full px-5 items-center justify-center">
        <SearchIcon className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search product, category"
        className="w-full pl-5 md:pl-13 pr-24 py-2.5 md:border bg-[#F0F0F0] text-black placeholder:text-black border-gray-200 rounded-[2rem] focus:outline-none text-sm"
      />
      <button
        type="submit"
        className="hidden md:block  flex-col items-center justify-center absolute right-0 top-0 h-full px-6 bg-[#184193] text-white rounded-r-[2rem] text-sm font-medium"
      >
        Search
      </button>
      <button
        type="submit"
        className="absolute  md:hidden right-0 top-0 h-full px-6  text-white rounded-r-[2rem] text-sm font-medium"
      >
        <SearchIcon className="w-5 h-5 text-[#323232]" />
      </button>
    </form>
  );
};

export const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const { wishlist } = useWishlist();
  const router = useRouter()
  const { cartItems } = useCart();
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setShowSubcategoryModal(true);
  };

  const handleBackToCategories = () => {
    setShowSubcategoryModal(false);
    setActiveCategory(null);
  };
  interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    topProducts: {
      id: string;
      name: string;
      slug: string;
    }[];
    subcategories: {
      id: string;
      name: string;
      slug: string;
      description: string;
    }[];
  }

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cachedCategories = localStorage.getItem("categories");
    if (cachedCategories) {
      const parsedCategories = JSON.parse(cachedCategories);
      setCategories(parsedCategories);
      setIsLoading(false);
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
        );
        const data = await response.json();
        if (Array.isArray(data.categories)) {
          const sortedCategories = data.categories.sort(
            (a: Category, b: Category) => {
              const subcountDiff =
                (b.subcategories?.length || 0) - (a.subcategories?.length || 0);
              if (subcountDiff !== 0) return subcountDiff;
              return a.name.localeCompare(b.name);
            }
          );
          localStorage.setItem("categories", JSON.stringify(sortedCategories));
          setCategories(sortedCategories);
          setIsLoading(false);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching categories:", error.message);
        }
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (isMenuOpen || showSubcategories) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen, showSubcategories]);

  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".group")) {
        setShowCategories(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white  top-0 w-full z-10 shadow-sm">
      <div className="hidden md:block">
        <div className="container mx-auto  px-4 pt-4  ">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex-shrink-0">
              <Image src="/logo.png" alt="Steadfast" width={150} height={40} />
            </Link>

            <div className="flex-1 max-w-xl mx-8">
              <Suspense
                fallback={
                  <div className="w-full h-10 bg-gray-100 animate-pulse rounded-[2rem]" />
                }
              >
                <SearchComponent />
              </Suspense>
            </div>

            <div className="flex items-center gap-8">
              <div className="relative" ref={dropdownRef}>
                {user ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 text-sm font-semibold hover:text-[#184193] relative z-10"
                    >
                      <User size={20} />
                      <span>{user.first_name}</span>
                      <ChevronDown size={16} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-1/2 translate-x-1/2 mt-5 top-full   w-56 bg-white rounded-lg shadow-xl py-3 z-20 border border-gray-100">
                        <div className="py-2">
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <User size={16} />
                            Profile
                          </Link>
                          <Link
                            href="/orders"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <ShoppingBag size={16} />
                            Orders
                          </Link>
                        </div>
                        <div className="border-t border-gray-100 pt-2">
                          <button
                            onClick={() => {
                              logout();
                              setIsDropdownOpen(false);
                              router.push("/")
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                          >
                            <LogOut size={16} />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2 text-sm font-semibold"
                  >
                    <User size={20} />
                    Login / Register
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative bg-[#EDF0F8] p-3 rounded-[50%]"
                >
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  <span className="absolute top-0 -right-2 border-2 border-white bg-[#184193] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                </button>
                <Link
                  href="/wishlist"
                  className="relative bg-[#EDF0F8] p-3 rounded-[50%]"
                >
                  <Heart size={20} strokeWidth={1.5} />
                  <span className="absolute top-0 -right-2 border-2 border-white bg-[#184193] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex relative flex-col items-center justify-center gap-8  mt-4">
            <div className="flex flex-row items-center justify-center gap-8 mt-4">
              <div className="relative group">
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className="flex items-center gap-2 text-sm py-3 px-4 bg-[#184193] text-white font-medium rounded-[.5rem]"
                >
                  All Categories
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      showCategories ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <nav className="flex-1">
                <ul className="flex gap-8">
                  {isLoading
                    ? Array.from({ length: 4 }).map((_, index) => (
                        <li key={index}>
                          <div className="animate-pulse bg-gray-200 rounded-lg h-6 w-24"></div>
                        </li>
                      ))
                    : categories.slice(0, 4).map((category) => (
                        <li key={category.id}>
                          <Link
                            href={`/products/category/${category.id}`}
                            className="text-sm line-clamp-1   py-1.5 px-4"
                          >
                            {category.name}
                          </Link>
                        </li>
                      ))}
                </ul>
              </nav>

              <div
                className={`absolute top-[4.5rem] left-0 w-full z-50 transition-all duration-300 ${
                  showCategories ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
              >
                <div className="container mx-auto px-6 rounded-lg py-6 bg-white max-w-5xl">
                  <div className="grid grid-cols-4 gap-8">
                    {isLoading
                      ? Array.from({ length: 5 }).map((_, index) => (
                          <div key={index} className="space-y-2">
                            <div className=" pb-2">
                              <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
                            </div>
                            <div className="grid gap-4">
                              {Array.from({ length: 4 }).map((_, subIndex) => (
                                <div
                                  key={subIndex}
                                  className="h-7 bg-gray-200 rounded animate-pulse w-full"
                                ></div>
                              ))}
                            </div>
                          </div>
                        ))
                      : categories.slice(0, 8).map((category) => (
                          <div key={category.id} className="space-y-2">
                            <div className=" pb-2">
                              <Link
                                href={`/products/category/${category.id}`}
                                className="text-sm font-bold"
                                onClick={() => setShowCategories(false)}
                              >
                                {category.name}
                              </Link>
                            </div>
                            <div className="grid gap-3">
                              {category.subcategories
                                ?.slice(0, 3)
                                .map((subcategory) => (
                                  <Link
                                    key={subcategory.id}
                                    href={`/products/category/sub_category/${subcategory.id}`}
                                    className="text-[.8rem] text-[#2f2e2e] font-medium line-clamp-1 "
                                    onClick={() => setShowCategories(false)}
                                  >
                                    {subcategory.name}
                                  </Link>
                                ))}
                            </div>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 pt-3 pb-1 md:py-3">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
            <Menu size={24} />
          </button>
          <Link href="/" className="flex-shrink-0">
            <Image src="/logo.png" alt="Steadfast" width={120} height={32} />
          </Link>
          <div className="flex">
            <Link href="/auth/login" className="relative p-2">
              <User size={24} />
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2"
            >
              <ShoppingBag size={24} />
              <span className="absolute top-0 right-0 bg-[#184193] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            </button>
          </div>
        </div>

        <div className="px-4 pb-2 border-t border-[#00000020] pt-2 md:pt-0">
          <Suspense
            fallback={
              <div className="w-full h-10 bg-gray-100 animate-pulse rounded-full" />
            }
          >
            <SearchComponent />
          </Suspense>
        </div>

        {isMenuOpen && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-base font-bold">Categories</h2>
              <button onClick={() => setIsMenuOpen(false)} className="p-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 18L18 6M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {isLoading ? (
                  <div className="space-y-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="space-y-4">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4  pb-[5rem]">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex  w-full justify-between"
                      >
                        {category.subcategories &&
                        category.subcategories.length > 0 ? (
                          <>
                            <button
                              onClick={() => handleCategoryClick(category.id)}
                              className="text-[.9rem] w-full line-clamp-1 font-semibold  text-left flex items-center py-3 px-4 justify-between rounded-lg hover:text-white hover:bg-[#FF5722] transition-all duration-300"
                            >
                              {category.name}
                              <ChevronRightIcon />
                            </button>
                          </>
                        ) : (
                          <Link
                            href={`/products/category/${category.id}`}
                            className="text-[.9rem] line-clamp-1 font-semibold  text-left flex items-center py-3 px-4 justify-between rounded-lg hover:text-white hover:bg-[#FF5722] transition-all duration-300 w-full"
                            onClick={() => {
                              setIsMenuOpen(false);
                            }}
                          >
                            {category.name}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showSubcategoryModal && activeCategory && (
          <div className="fixed inset-0 bg-white z-[60] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b  border-[#60606020]">
              <button
                onClick={handleBackToCategories}
                className="flex items-center gap-2 text-[#184193]"
              >
                <svg
                  className="w-6 h-6 transform rotate-90"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 9L12 15L18 9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Back
              </button>
              <h2 className="text-base font-bold">
                {categories.find((c) => c.id === activeCategory)?.name}
              </h2>
              <div className="w-6"></div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="space-y-4">
                  {categories
                    .find((c) => c.id === activeCategory)
                    ?.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.id}
                        href={`/products/category/sub_category/${subcategory.id}`}
                        className="block py-3 text-gray-600 border-b  border-[#60606020] hover:text-[#184193]"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setShowSubcategoryModal(false);
                        }}
                      >
                        {subcategory.name}
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {isCartOpen && (
          <CartPanel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        )}
      </div>
      <CartPanel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

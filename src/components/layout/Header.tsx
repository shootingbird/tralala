"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRightIcon, Menu, SearchIcon } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { CartPanel } from "@/components/cart/CartPanel";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, LogOut, User, ShoppingBag, Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { name: "Why Shop With Us", href: "/why-shop-with-us" },
  { name: "Contact Us", href: "/contact-us" },
  { name: "About Us", href: "/about-us" },
  { name: "Privacy Policy", href: "/privacy-policy" },
];

const SearchComponent: React.FC = () => {
  const router = useRouter();
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const initial = params.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(initial);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative flex w-full">
      <div className="absolute hidden md:flex inset-y-0 left-4 items-center pointer-events-none">
        <SearchIcon className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search product, category"
        aria-label="Search products"
        className="w-full pl-10 pr-12 py-2.5 bg-[#F0F0F0] text-black placeholder:text-black border border-gray-200 rounded-full focus:outline-none text-sm"
      />
      <button
        type="submit"
        className="hidden md:block absolute right-0 top-0 h-full px-6 bg-[#184193] text-white rounded-r-full text-sm font-medium"
        aria-label="Search"
      >
        Search
      </button>
      <button
        type="submit"
        className="md:hidden absolute right-0 top-0 h-full px-3 rounded-r-full text-sm font-medium flex items-center justify-center w-10"
        aria-label="Search mobile"
      >
        <SearchIcon className="w-5 h-5 text-[#323232]" />
      </button>
    </form>
  );
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  topProducts?: { id: string; name: string; slug: string }[];
  subcategories?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  }[];
}

export function Header({ showSearch = false }: { showSearch?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const { cartItems } = useCart();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Data-dropdown attribute is used to identify both desktop and mobile dropdown containers
  const dropdownContainerAttr = "data-dropdown-container";

  // --- Helper: build canonical products URL with category[] / subcat[] ---
  const buildProductsUrl = (opts: {
    categories?: string[]; // category ids
    subcats?: string[]; // subcategory ids
    perPage?: number;
    page?: number;
  }) => {
    const params = new URLSearchParams();
    params.set("per_page", String(opts.perPage ?? 24));
    params.set("page", String(opts.page ?? 1));
    (opts.categories ?? []).forEach((id) => params.append("category", id));
    (opts.subcats ?? []).forEach((id) => params.append("subcat", id));
    return `/products?${params.toString()}`;
  };

  // Fetch categories and cache in localStorage
  useEffect(() => {
    const cached =
      typeof window !== "undefined" ? localStorage.getItem("categories") : null;
    if (cached) {
      try {
        setCategories(JSON.parse(cached));
        setIsLoading(false);
      } catch (e) {
        localStorage.removeItem("categories");
      }
    }

    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
        );
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data.categories)) {
          const sorted = data.categories.sort((a: Category, b: Category) => {
            const subcount =
              (b.subcategories?.length || 0) - (a.subcategories?.length || 0);
            if (subcount !== 0) return subcount;
            return a.name.localeCompare(b.name);
          });
          localStorage.setItem("categories", JSON.stringify(sorted));
          setCategories(sorted);
        }
      } catch (err) {
        // silent error -- keep the placeholder UI
        console.error("fetch categories error", err);
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Lock body scroll when overlays are open
  useEffect(() => {
    if (isMenuOpen || showSubcategoryModal || isCartOpen || showCategories) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen, showSubcategoryModal, isCartOpen, showCategories]);

  // Close dropdown when clicking outside either dropdown area (desktop or mobile)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      if (!target.closest("[data-dropdown-container]")) {
        setIsDropdownOpen(false);
      }
      // categories panel
      if (!target.closest(".group")) {
        setShowCategories(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function capitalizeWord(str?: string) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // When category has subcategories: open modal (mobile). For desktop clicking the category name navigates to products as well.
  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setShowSubcategoryModal(true);
    setIsMenuOpen(false);
  };

  const handleBackToCategories = () => {
    setShowSubcategoryModal(false);
    setActiveCategory(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("logout failed", e);
    } finally {
      setIsDropdownOpen(false);
      router.push("/");
    }
  };

  return (
    <header className="bg-white sticky top-0 w-full z-50 md:shadow-sm">
      {/* DESKTOP */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 pt-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex-shrink-0" aria-label="Home">
              <Image
                src="/logo.png"
                alt="Steadfast"
                width={150}
                height={40}
                priority
              />
            </Link>

            <div className="flex-1 max-w-xl mx-8">
              <Suspense
                fallback={
                  <div className="w-full h-10 bg-gray-100 animate-pulse rounded-full" />
                }
              >
                <SearchComponent />
              </Suspense>
            </div>

            <div className="flex items-center gap-8">
              <div className="relative" {...{ [dropdownContainerAttr]: true }}>
                {user ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsDropdownOpen((s) => !s)}
                      className="flex items-center gap-2 text-sm font-semibold hover:text-[#184193] relative z-10"
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="menu"
                    >
                      <User size={20} />
                      <span>{user.first_name}</span>
                      <ChevronDown size={16} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-3 top-full w-56 bg-white rounded-lg shadow-xl py-3 z-40 border border-gray-100">
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
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
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
                  className="relative bg-[#EDF0F8] p-3 rounded-full"
                  aria-label="Open cart"
                >
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  <span className="absolute top-0 -right-2 border-2 border-white bg-[#184193] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                </button>
                <Link
                  href="/wishlist"
                  className="relative bg-[#EDF0F8] p-3 rounded-full"
                  aria-label="Wishlist"
                >
                  <Heart size={20} strokeWidth={1.5} />
                  <span className="absolute top-0 -right-2 border-2 border-white bg-[#184193] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex relative flex-col items-center justify-center gap-8 mt-4">
            <div className="flex flex-row items-center justify-center gap-8 mt-4">
              <div className="relative group">
                <button
                  onClick={() => setShowCategories((s) => !s)}
                  className="flex items-center gap-2 text-sm py-3 px-4 bg-[#184193] text-white font-medium rounded-md"
                  aria-expanded={showCategories}
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
                          <div className="animate-pulse bg-gray-200 rounded-lg h-6 w-24" />
                        </li>
                      ))
                    : categories.slice(0, 4).map((category) => (
                        <li key={category.id}>
                          <Link
                            href={buildProductsUrl({
                              categories: [category.id],
                            })}
                            className="text-sm line-clamp-1 py-1.5 px-4"
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
                            <div className="pb-2">
                              <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
                            </div>
                            <div className="grid gap-4">
                              {Array.from({ length: 4 }).map((_, subIndex) => (
                                <div
                                  key={subIndex}
                                  className="h-7 bg-gray-200 rounded animate-pulse w-full"
                                />
                              ))}
                            </div>
                          </div>
                        ))
                      : categories.slice(0, 8).map((category) => (
                          <div key={category.id} className="space-y-2">
                            <div className="pb-2">
                              <Link
                                href={buildProductsUrl({
                                  categories: [category.id],
                                })}
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
                                    href={buildProductsUrl({
                                      subcats: [subcategory.id],
                                    })}
                                    className="text-[.8rem] text-[#2f2e2e] font-medium line-clamp-1"
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

      {/* MOBILE */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center sm:gap-2">
            <button
              onClick={() => setIsMenuOpen((s) => !s)}
              className="p-2"
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
            <Link href="/" className="flex-shrink-0" aria-label="Home">
              <Image src="/logo.png" alt="Steadfast" width={120} height={32} />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div {...{ [dropdownContainerAttr]: true }}>
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDropdownOpen((s) => !s)}
                    className="flex items-center gap-2 text-sm font-semibold hover:text-[#184193] p-2"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="menu"
                  >
                    <User size={20} />
                    <span className="sr-only">Open user menu</span>
                    <ChevronDown size={16} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-2 mt-12 top-0 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-100">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login" className="p-2">
                  <User size={24} />
                </Link>
              )}
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2"
              aria-label="Open cart"
            >
              <ShoppingBag size={24} />
              <span className="absolute top-0 right-0 bg-[#184193] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItems.length}
              </span>
            </button>
          </div>
        </div>

        {showSearch && (
          <div className="px-4 pb-2 pt-2">
            <Suspense
              fallback={
                <div className="w-full h-10 bg-gray-100 animate-pulse rounded-full" />
              }
            >
              <SearchComponent />
            </Suspense>
          </div>
        )}

        {/* Mobile sliding menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col w-3/5">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-base font-bold">Categories</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2"
                aria-label="Close menu"
              >
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
              <div className="p-4 h-full">
                {isLoading ? (
                  <div className="space-y-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="space-y-4">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col justify-between h-full gap-10">
                    <div>
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex w-full justify-between"
                        >
                          {category.subcategories &&
                          category.subcategories.length > 0 ? (
                            <>
                              <button
                                onClick={() => handleCategoryClick(category.id)}
                                className="text-sm w-full line-clamp-1 font-semibold text-left flex items-center py-3 pl-4 justify-between rounded-lg hover:text-white hover:bg-[#FF5722] transition-all duration-300 capitalize"
                              >
                                {capitalizeWord(category.name)}
                              </button>
                            </>
                          ) : (
                            <Link
                              href={buildProductsUrl({
                                categories: [category.id],
                              })}
                              className="text-sm line-clamp-1 font-semibold text-left flex items-center py-3 px-4 justify-between rounded-lg hover:text-white hover:bg-[#FF5722] transition-all duration-300 w-full capitalize"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {capitalizeWord(category.name)}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>

                    <ul className="mt-20">
                      {navLinks.map((nav) => (
                        <li key={nav.name}>
                          <Link
                            href={nav.href}
                            className="text-sm line-clamp-1 font-semibold text-left flex items-center py-3 px-4 justify-between rounded-lg hover:text-white hover:bg-[#FF5722] transition-all duration-300 w-full"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {nav.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Subcategory modal for mobile (separate view) */}
        {showSubcategoryModal && activeCategory && (
          <div className="fixed inset-0 bg-white z-60 flex flex-col w-2/3">
            <div className="flex justify-between items-center p-4 border-b border-[#60606020]">
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
              <div className="w-6" />
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="space-y-4">
                  {categories
                    .find((c) => c.id === activeCategory)
                    ?.subcategories.map((subcategory) => (
                      <Link
                        key={subcategory.id}
                        href={buildProductsUrl({ subcats: [subcategory.id] })}
                        className="block py-3 text-gray-600 border-b border-[#60606020] hover:text-[#184193]"
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

        {/* Render CartPanel once (avoid duplicates) */}
      </div>

      <CartPanel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}

// keep both named and default exports so both import styles work
export default Header;

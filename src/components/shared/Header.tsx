"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  ChevronDown,
  LogOut,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { useGetCategoriesQuery } from "@/slices/products/productApiSlice";
import { selectCartItemCount } from "@/slices/cartSlice";

/* --- shadcn dropdown imports (assumes you have the components copied to "@/components/ui/*") --- */
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/slices/authSlice";
import { CartPanel } from "@/components/cart/CartPanel";

export default function Header({
  onCategoryClick,
  isProductPage = false,
  showSearchbar = true,
}: {
  onCategoryClick?: React.Dispatch<React.SetStateAction<boolean>>;
  isProductPage?: boolean;
  showSearchbar?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("All");
  const [wishlistCount, setWishlistCount] = useState(3);
  const [isClient, setIsClient] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const catRef = useRef<HTMLDivElement | null>(null);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const categories = useAppSelector((state) => state.categories.categories);
  const cartCount = useAppSelector(selectCartItemCount);
  const { isLoading } = useGetCategoriesQuery(undefined, {
    skip: categories.length > 0,
  });
  const dispatch = useAppDispatch();

  // Fix hydration mismatch by ensuring auth state is only rendered on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!catRef.current) return;
      if (!catRef.current.contains(e.target as Node)) {
        // nothing special — kept from your original code
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCategory) params.set("category", selectedCategory);
    router.push(`/products?${params.toString()}`);
  }

  function handleLogout() {
    try {
      dispatch(logout());
    } finally {
      router.push("/auth/login");
    }
  }

  return (
    <header className="w-full bg-white">
      {/* Top row: logo, search, icons */}
      <div className="px-4 md:px-12 py-4 flex items-center justify-between gap-6 ">
        <Link href={"/"} className="flex items-center w-48">
          <Image
            src="/logo-transparent.png"
            alt="Steadfast"
            width={200}
            height={50}
            priority
            className="object-contain w-25 h-8 md:w-50 md:h-13"
          />
        </Link>

        {/* central search */}
        <form
          onSubmit={onSearch}
          className="hidden md:flex flex-1 items-center justify-center"
          role="search"
        >
          <div className="w-full max-w-2xl">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Select category"
                    className="px-4 py-3 bg-white hover:bg-gray-50 border-r border-gray-200 text-sm"
                  >
                    {selectedCategoryName}
                    <ChevronDown size={16} className="ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedCategoryName("All Categories");
                      onSearch();
                    }}
                  >
                    All Categories
                  </DropdownMenuItem>
                  {categories.map((cat) => (
                    <DropdownMenuItem
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedCategoryName(cat.name);
                        onSearch();
                      }}
                    >
                      {cat.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <input
                aria-label="Search products"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-4 py-3 text-sm placeholder-gray-400 outline-none"
                placeholder="Search here ..."
              />
              <button
                type="submit"
                aria-label="Search"
                className="px-4 py-3 bg-white hover:bg-gray-50 border-l border-gray-200"
              >
                <Search size={18} color="#99a1af" />
              </button>
            </div>
          </div>
        </form>

        {/* right icons */}
        <div className="flex items-center md:gap-4">
          {/* ---------- USER: when authenticated show shadcn dropdown (desktop + mobile) ---------- */}
          {isClient && (
            <>
              {isAuthenticated ? (
                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        aria-label="User menu"
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 p-2 rounded-md"
                      >
                        <User size={18} />
                        <span className="hidden md:inline">Account</span>
                        <ChevronDown className="hidden md:inline-block" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      sideOffset={6}
                      className="w-44"
                    >
                      <DropdownMenuLabel>Signed in</DropdownMenuLabel>

                      <DropdownMenuItem
                        onClick={() => router.push("/profile")}
                        className="flex items-center gap-2"
                      >
                        <UserCheck size={16} />
                        <span>Profile</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => router.push("/orders")}
                        className="flex items-center gap-2"
                      >
                        <ClipboardList size={16} />
                        <span>Orders</span>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Link href="/auth/login">
                  <button
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                    aria-label="Login / Register"
                  >
                    <User size={18} />
                    <span className="hidden md:inline">Login / Register</span>
                  </button>
                </Link>
              )}
            </>
          )}

          <div className="hidden md:block relative">
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Cart"
              className="p-3  rounded-full md:bg-[#EDF0F8] hover:bg-gray-50"
            >
              <ShoppingBag size={18} />
            </button>
            {isClient && cartCount > 0 && (
              <span className="absolute top-1 right-1 md:-top-1 md:-right-1 bg-[#E94B1C] md:bg-[#184193] text-white text-[10px] md:text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>

          <div className="relative hidden md:block">
            <button
              onClick={() => router.push("/wishlist")}
              aria-label="Wishlist"
              className="p-3 rounded-full bg-[#EDF0F8] hover:bg-gray-50"
            >
              <Heart size={18} />
            </button>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#184193] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* mobile search */}
      {showSearchbar ? (
        <form
          onSubmit={onSearch}
          className="mx-4 -mt-4 mb-2 md:hidden flex flex-1 items-center justify-center"
          role="search"
        >
          <div className="w-full max-w-2xl">
            <div className="flex items-center bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Select category"
                    className="px-3 py-2 bg-white hover:bg-gray-50 border-r border-gray-200 text-sm flex items-center"
                  >
                    {selectedCategoryName}
                    <ChevronDown size={14} className="ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedCategoryName("All Categories");
                      onSearch();
                    }}
                  >
                    All Categories
                  </DropdownMenuItem>
                  {categories.map((cat) => (
                    <DropdownMenuItem
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedCategoryName(cat.name);
                        onSearch();
                      }}
                    >
                      {cat.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <input
                aria-label="Search products"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 px-4 py-2 text-sm placeholder-gray-400 outline-none"
                placeholder="Search here ..."
              />
              <button
                type="submit"
                aria-label="Search"
                className="px-4 py-2 bg-white hover:bg-gray-50 border-l border-gray-200"
              >
                <Search size={18} color="#99a1af" />
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {/* second row: nav categories */}
      {isProductPage ? null : (
        <nav className="hidden md:block bg-white overflow-x-auto no-scrollbar -mt-2 relative z-[10]">
          <div className="px-6 justify-between relative min-h-20">
            <ul className="absolute top-0 left-4 right-4 md:relative flex justify-start md:justify-center items-center gap-2 md:gap-6 py-3 text-sm text-gray-700">
              <button
                data-menu-toggle
                onClick={() => {
                  if (onCategoryClick) {
                    onCategoryClick((prev: boolean) => !prev);
                  }
                }}
                className={`flex gap-2 text-gray-800  items-center justify-center px-4 py-3 rounded-md whitespace-nowrap hover:bg-gray-50 bg-[#E94B1C] md:bg-[#EDF0F8]`}
              >
                <span className="hidden md:inline-block">All Categories</span>
                <span className="md:hidden text-white">All</span>
                <ChevronDown className="text-white md:text-gray-800 size-5" />
              </button>
              {/* Remaining categories after the first 5 */}
              {isClient &&
                categories.slice(5).map((cat) => (
                  <li key={cat.id} className="list-none">
                    <Link
                      href={`/products?category=${cat.id}`}
                      className="px-4 py-3 rounded-md whitespace-nowrap hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </nav>
      )}

      <CartPanel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}

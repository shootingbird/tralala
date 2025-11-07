// src/app/mobile-nav/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCartIcon } from "lucide-react";
import { useAppSelector } from "@/hooks/redux";
import { selectCartItemCount } from "@/slices/cartSlice";
import { CartPanel } from "@/components/cart/CartPanel";

type TabKey = "home" | "category" | "cart" | "account";

const ACTIVE_COLOR = "#FF6A4C"; // coral / active tint closely matching the screenshot
const INACTIVE_COLOR = "#111827"; // near-black

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="transition-all duration-300"
    >
      <path
        opacity="0.4"
        d="M20.04 6.81969L14.28 2.78969C12.71 1.68969 10.3 1.74969 8.78999 2.91969L3.77999 6.82969C2.77999 7.60969 1.98999 9.20969 1.98999 10.4697V17.3697C1.98999 19.9197 4.05999 21.9997 6.60999 21.9997H17.39C19.94 21.9997 22.01 19.9297 22.01 17.3797V10.5997C22.01 9.24969 21.14 7.58969 20.04 6.81969Z"
        fill={active ? "#E94B1C" : INACTIVE_COLOR}
        stroke={active ? "#E94B1C" : "none"}
        strokeWidth={active ? 2 : 0}
      />
      <path
        d="M12 18.75C11.59 18.75 11.25 18.41 11.25 18V15C11.25 14.59 11.59 14.25 12 14.25C12.41 14.25 12.75 14.59 12.75 15V18C12.75 18.41 12.41 18.75 12 18.75Z"
        fill={active ? "#E94B1C" : INACTIVE_COLOR}
        stroke={active ? "#E94B1C" : "none"}
        strokeWidth={active ? 2 : 0}
      />
    </svg>
  );
}

function CategoryIcon({ active }: { active?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={24}
      height={24}
      stroke={active ? ACTIVE_COLOR : INACTIVE_COLOR}
      fill="none"
      strokeWidth={active ? 5 : 4.5} // ⬅️ Increased stroke thickness
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-all duration-300"
    >
      {/* Top-left box */}
      <rect x="6" y="6" width="24" height="24" rx="6" />
      {/* Top-right box */}
      <rect x="34" y="6" width="24" height="24" rx="6" />
      {/* Bottom-left box */}
      <rect x="6" y="34" width="24" height="24" rx="6" />
      {/* Bottom-right: magnifying glass */}
      <circle cx="46" cy="46" r="10" />
      <line x1="52" y1="52" x2="57" y2="57" />{" "}
      {/* Slightly lengthened for balance */}
    </svg>
  );
}

function UserIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="transition-all duration-300"
    >
      <path
        d="M12 12a4 4 0 100-8 4 4 0 000 8z"
        stroke={active ? ACTIVE_COLOR : INACTIVE_COLOR}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M4 20c0-3.333 3.333-6 8-6s8 2.667 8 6"
        stroke={active ? ACTIVE_COLOR : INACTIVE_COLOR}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Single Nav Item component
 * Uses a Button from shadcn/ui for accessible base but heavily styled with Tailwind to match the design.
 */
function NavItem({
  id,
  label,
  active,
  onClick,
  children,
}: {
  id: TabKey;
  label: string;
  active: boolean;
  onClick: (id: TabKey) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      // variant="ghost"
      onClick={() => onClick(id)}
      className={`h-full flex flex-col items-center justify-between gap-1 px-3  rounded-none min-w-[64px]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-200
        transition-all duration-300 transform
        hover:-translate-y-0.5 active:scale-95`}
      aria-current={active ? "page" : undefined}
      aria-label={label}
    >
      <div className="flex items-center justify-center">{children}</div>

      <span
        className={`leading-4 transition-all duration-300 font-bold text-sm ${
          active ? "text-[#FF6A4C]" : "text-[rgba(0,0,0,0.8)]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

const getActiveTab = (pathname: string): TabKey => {
  if (pathname === "/") return "home";
  if (pathname === "/category") return "category";
  if (pathname === "/cart") return "cart";
  if (pathname === "/account" || pathname === "/auth/login") return "account";
  return "home"; // default
};

export default function MobileNav() {
  const [active, setActive] = useState<TabKey>("home");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const cartCount = useAppSelector(selectCartItemCount);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const currentTab = getActiveTab(pathname);
    setActive(currentTab);
  }, [pathname]);

  const handleClick = (id: TabKey) => {
    setActive(id);
    if (id === "home") {
      router.push("/");
    } else if (id === "cart") {
      router.push("/cart");
    } else if (id === "account") {
      if (isAuthenticated) {
        router.push("/account");
      } else {
        router.push("/auth/login");
      }
    }
  };

  return (
    <nav
      aria-label="Primary"
      className="fixed md:hidden -bottom-1 left-0 right-0 bg-white/80 backdrop-blur border-t border-gray-200 z-50 px-4 h-15"
    >
      <div className="h-full py-2">
        <div className="h-full flex items-center justify-between">
          <NavItem
            id="home"
            label="Home"
            active={active === "home"}
            onClick={handleClick}
          >
            <div className="flex items-center justify-center">
              <HomeIcon active={active === "home"} />
            </div>
          </NavItem>

          <NavItem
            id="category"
            label="Category"
            active={active === "category"}
            onClick={() => router.push("/category")}
          >
            <CategoryIcon active={active === "category"} />
          </NavItem>

          <NavItem
            id="cart"
            label="Cart"
            active={active === "cart"}
            onClick={handleClick}
          >
            <div className="relative">
              <ShoppingCartIcon
                size={24}
                color={active === "cart" ? ACTIVE_COLOR : INACTIVE_COLOR}
                strokeWidth={2.3}
                className="font-bold"
              />
              {isClient && cartCount > 0 && (
                <span className="absolute -top-1 -right-2.5 bg-[#E94B1C] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </NavItem>

          <NavItem
            id="account"
            label="Account"
            active={active === "account"}
            onClick={handleClick}
          >
            <UserIcon active={active === "account"} />
          </NavItem>
        </div>
      </div>

      <CartPanel isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
}

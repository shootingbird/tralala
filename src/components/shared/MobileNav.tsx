// src/app/mobile-nav/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button"; // Adjust if your shadcn path differs
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
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        opacity="0.4"
        d="M20.04 6.81969L14.28 2.78969C12.71 1.68969 10.3 1.74969 8.78999 2.91969L3.77999 6.82969C2.77999 7.60969 1.98999 9.20969 1.98999 10.4697V17.3697C1.98999 19.9197 4.05999 21.9997 6.60999 21.9997H17.39C19.94 21.9997 22.01 19.9297 22.01 17.3797V10.5997C22.01 9.24969 21.14 7.58969 20.04 6.81969Z"
        fill={active ? "#E94B1C" : INACTIVE_COLOR}
      />
      <path
        d="M12 18.75C11.59 18.75 11.25 18.41 11.25 18V15C11.25 14.59 11.59 14.25 12 14.25C12.41 14.25 12.75 14.59 12.75 15V18C12.75 18.41 12.41 18.75 12 18.75Z"
        fill={active ? "#E94B1C" : INACTIVE_COLOR}
      />
    </svg>
  );
}

function BagIcon({ active }: { active?: boolean }) {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 7H18L17 20H7L6 7Z"
        stroke={active ? ACTIVE_COLOR : INACTIVE_COLOR}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M9 7V6a3 3 0 016 0v1"
        stroke={active ? ACTIVE_COLOR : INACTIVE_COLOR}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function SearchIcon({ active }: { active?: boolean }) {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="11"
        cy="11"
        r="5"
        stroke={active ? ACTIVE_COLOR : INACTIVE_COLOR}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 21L16.65 16.65"
        stroke={active ? ACTIVE_COLOR : INACTIVE_COLOR}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon({ active }: { active?: boolean }) {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a4 4 0 100-8 4 4 0 000 8z"
        stroke={active ? ACTIVE_COLOR : INACTIVE_COLOR}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M4 20c0-3.333 3.333-6 8-6s8 2.667 8 6"
        stroke={active ? ACTIVE_COLOR : INACTIVE_COLOR}
        strokeWidth="1.6"
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
    <Button
      variant="ghost"
      onClick={() => onClick(id)}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-none min-w-[64px]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-200
        transition-transform transform
        hover:-translate-y-0.5 active:scale-95`}
      aria-current={active ? "page" : undefined}
      aria-label={label}
    >
      <div className="flex items-center justify-center">{children}</div>

      <span
        className={`leading-4 ${
          active
            ? "text-[#FF6A4C] font-semibold"
            : "text-[rgba(0,0,0,0.8)] font-normal"
        }`}
      >
        {label}
      </span>
    </Button>
  );
}

export default function MobileNav() {
  const [active, setActive] = useState<TabKey>("home");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const cartCount = useAppSelector(selectCartItemCount);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      className="fixed md:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 h-18 px-4"
    >
      <div className=" mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
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
            <BagIcon active={active === "category"} />
          </NavItem>

          <NavItem
            id="cart"
            label="Cart"
            active={active === "cart"}
            onClick={handleClick}
          >
            <div className="relative">
              <ShoppingCartIcon size={24} />
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

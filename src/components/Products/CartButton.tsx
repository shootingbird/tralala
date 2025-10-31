import React from "react";

interface CartButtonProps {
  cartCount: number;
  onClick: () => void;
}

export default function CartButton({ cartCount, onClick }: CartButtonProps) {
  return (
    <div className="fixed right-6 bottom-6 z-50">
      <button
        onClick={onClick}
        className="relative bg-white border border-gray-100 rounded-full p-3 shadow flex items-center gap-2"
        aria-label="Open cart"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6h15l-1.5 9h-12z"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="20" r="1" />
          <circle cx="19" cy="20" r="1" />
        </svg>
        <span className="sr-only">Cart</span>
        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
          {cartCount}
        </span>
      </button>
    </div>
  );
}

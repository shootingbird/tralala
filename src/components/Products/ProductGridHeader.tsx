import React from "react";

export default function ProductGridHeader({
  title = "Products",
}: {
  title: string;
}) {
  return (
    <div className="flex items-center justify-between mb-2 md:mb-4 md:mb-6">
      <h2 className="font-medium text-gray-800">{title}</h2>
      {/* <a
        href="#"
        className="text-sm text-gray-600 flex items-center gap-2 hover:text-gray-900"
      >
        View All
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M5 12h14M13 5l7 7-7 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a> */}
    </div>
  );
}

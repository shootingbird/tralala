"use client";

import Header from "@/components/shared/Header";
import Link from "next/link";
import React from "react";
import AppWapper from "@/app/AppWapper";
import { useAuth } from "@/contexts/AuthContext";

const tokens = {
  theme: {
    background_color: "#FFFFFF",
    primary_color: "#FCE4E0",
    accent_color: "#FF7F6A",
    icon_color_active: "#FF7F6A",
    icon_color_inactive: "#000000",
    text_color_primary: "#000000",
    text_color_secondary: "#6C6C6C",
    divider_color: "#EAEAEA",
  },
  typography: {
    font_family: "SF Pro Display, Inter, system-ui, -apple-system, sans-serif",
    heading: 16,
    body: 14,
    small: 12,
  },
  layout: {
    padding_horizontal: 16,
    padding_vertical: 12,
  },
};

const IconHome = ({ active = false }: { active?: boolean }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z"
      stroke={
        active
          ? tokens.theme.icon_color_active
          : tokens.theme.icon_color_inactive
      }
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconShop = ({ color }: { color: string }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 7h18l-1 11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L3 7z"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 3a2 2 0 0 0-4 0"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconSearch = ({ color }: { color: string }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="11"
      cy="11"
      r="6"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 21l-4.35-4.35"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const IconProfile = ({ color }: { color: string }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="12"
      cy="7"
      r="4"
      stroke={color}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SmallActionIcon = ({
  children,
  href = "#",
}: {
  children: React.ReactNode;
  href: string;
}) => (
  <Link
    href={href}
    className="flex items-center justify-center rounded-[12px] p-2"
    style={{ backgroundColor: tokens.theme.primary_color }}
  >
    {children}
  </Link>
);

export default function MobileProfile() {
  return (
    <AppWapper>
      <MobileProfileContent />
    </AppWapper>
  );
}

function MobileProfileContent() {
  const { user, logout } = useAuth();
  console.log(user);
  const listItems = [
    { label: "In Dispute", href: "/orders" }, // Assuming disputes are under order history
    { label: "Settings", href: "/profile" },
    { label: "Help Center", href: "/help" }, // Placeholder, create if needed
    { label: "FAQ", href: "/faq" }, // Placeholder
    { label: "Logout", action: logout },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{
        backgroundColor: tokens.theme.background_color,
        fontFamily: tokens.typography.font_family,
      }}
    >
      <Header isProductPage={false} showSearchbar={false} />
      {/* Mobile viewport container (mimics phone width) */}
      <div
        className="w-full max-w-[390px] mx-auto flex-1 flex flex-col"
        style={{
          padding: `${tokens.layout.padding_vertical}px ${tokens.layout.padding_horizontal}px`,
        }}
      >
        {/* Profile header */}
        <div className="flex items-center w-full -mt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
              {/* avatar placeholder (dotted pattern feel) */}
              <div
                className="w-9 h-9 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(255,127,106,0.06) 0, transparent 20%)",
                }}
              />
            </div>
            <div>
              <div
                className="text-[16px] font-medium"
                style={{ color: tokens.theme.text_color_primary }}
              >
                {user ? `${user.username}` : "Guest"}
              </div>
            </div>
          </div>
        </div>

        {/* Icon action row */}
        <div className="mt-6">
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col items-center text-center">
              <SmallActionIcon href="/orders">
                {/* orders icon */}
                <svg
                  width="22"
                  height="19"
                  viewBox="0 0 22 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 6.98H16.21L11.83 0.42C11.64 0.14 11.32 0 11 0C10.68 0 10.36 0.14 10.17 0.43L5.79 6.98H1C0.45 6.98 0 7.43 0 7.98C0 8.07 0.00999996 8.16 0.04 8.25L2.58 17.52C2.81 18.36 3.58 18.98 4.5 18.98H17.5C18.42 18.98 19.19 18.36 19.43 17.52L21.97 8.25L22 7.98C22 7.43 21.55 6.98 21 6.98ZM11 2.78L13.8 6.98H8.2L11 2.78ZM17.5 16.98L4.51 16.99L2.31 8.98H19.7L17.5 16.98ZM11 10.98C9.9 10.98 9 11.88 9 12.98C9 14.08 9.9 14.98 11 14.98C12.1 14.98 13 14.08 13 12.98C13 11.88 12.1 10.98 11 10.98Z"
                    fill="#D46F77"
                  />
                </svg>
              </SmallActionIcon>
              <div
                className="text-[12px] mt-2"
                style={{ color: tokens.theme.text_color_secondary }}
              >
                Orders
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <SmallActionIcon href="/profile">
                <svg
                  width="16"
                  height="20"
                  viewBox="0 0 16 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 19.5C9.1 19.5 10 18.6 10 17.5H6C6 18.6 6.9 19.5 8 19.5ZM14 13.5V8.5C14 5.43 12.37 2.86 9.5 2.18V1.5C9.5 0.67 8.83 0 8 0C7.17 0 6.5 0.67 6.5 1.5V2.18C3.64 2.86 2 5.42 2 8.5V13.5L0 15.5V16.5H16V15.5L14 13.5ZM12 14.5H4V8.5C4 6.02 5.51 4 8 4C10.49 4 12 6.02 12 8.5V14.5Z"
                    fill="#D46F77"
                  />
                </svg>
              </SmallActionIcon>
              <div
                className="text-[12px] mt-2"
                style={{ color: tokens.theme.text_color_secondary }}
              >
                Notification
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <SmallActionIcon href="/wishlit">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.17 2L16 6.83V16H2V2H11.17ZM11.17 0H2C0.9 0 0 0.9 0 2V16C0 17.1 0.9 18 2 18H16C17.1 18 18 17.1 18 16V6.83C18 6.3 17.79 5.79 17.41 5.42L12.58 0.59C12.21 0.21 11.7 0 11.17 0ZM4 12H14V14H4V12ZM4 8H14V10H4V8ZM4 4H11V6H4V4Z"
                    fill="#D46F77"
                  />
                </svg>
              </SmallActionIcon>
              <div
                className="text-[12px] mt-2"
                style={{ color: tokens.theme.text_color_secondary }}
              >
                Wishlist
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <SmallActionIcon href="/profile">
                <svg
                  width="18"
                  height="22"
                  viewBox="0 0 18 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 0L0 4V10C0 15.55 3.84 20.74 9 22C14.16 20.74 18 15.55 18 10V4L9 0ZM9 10.99H16C15.47 15.11 12.72 18.78 9 19.93V11H2V5.3L9 2.19V10.99Z"
                    fill="#D46F77"
                  />
                </svg>
              </SmallActionIcon>
              <div
                className="text-[12px] mt-2"
                style={{ color: tokens.theme.text_color_secondary }}
              >
                Security
              </div>
            </div>
          </div>
        </div>

        {/* section divider */}
        <div
          className="w-full mt-6"
          style={{ borderTop: `1px solid ${tokens.theme.divider_color}` }}
        />

        {/* List section */}
        <div className="mt-4 w-full">
          {listItems.map((item, i) => (
            <div
              key={item.label}
              className="flex items-center justify-between h-12"
              style={{
                borderBottom:
                  i < listItems.length - 1
                    ? `1px solid ${tokens.theme.divider_color}`
                    : "none",
              }}
            >
              {item.action ? (
                <button
                  onClick={item.action}
                  className="text-[14px] w-full text-left"
                  style={{ color: tokens.theme.text_color_primary }}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  href={item.href || "#"}
                  className="text-[14px] w-full"
                  style={{ color: tokens.theme.text_color_primary }}
                >
                  {item.label}
                </Link>
              )}
              <div>
                {/* chevron */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18l6-6-6-6"
                    stroke={tokens.theme.text_color_secondary}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        {/* bottom spacing to allow for fixed nav */}
        <div style={{ height: 80 }} />
      </div>

      {/* Bottom navigation (fixed) */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center">
        <div
          className="w-full max-w-[390px] mx-auto"
          style={{ backgroundColor: tokens.theme.background_color }}
        >
          <div
            className="flex justify-between items-center px-6 py-3 border-t"
            style={{
              borderTop: `1px solid ${tokens.theme.divider_color}`,
              height: 64,
            }}
          >
            <div className="flex flex-col items-center text-[12px]">
              <IconHome active={true} />
              <div
                className="mt-1 text-[12px]"
                style={{ color: tokens.theme.icon_color_active }}
              >
                Home
              </div>
            </div>

            <div
              className="flex flex-col items-center text-[12px]"
              style={{ color: tokens.theme.icon_color_inactive }}
            >
              <IconShop color={tokens.theme.icon_color_inactive} />
              <div className="mt-1 text-[12px]">Shop</div>
            </div>

            <div
              className="flex flex-col items-center text-[12px]"
              style={{ color: tokens.theme.icon_color_inactive }}
            >
              <IconSearch color={tokens.theme.icon_color_inactive} />
              <div className="mt-1 text-[12px]">Search</div>
            </div>

            <div
              className="flex flex-col items-center text-[12px]"
              style={{ color: tokens.theme.icon_color_inactive }}
            >
              <IconProfile color={tokens.theme.icon_color_inactive} />
              <div className="mt-1 text-[12px]">Profile</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

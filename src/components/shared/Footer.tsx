"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="bg-gray-100 lg:block">
      <div className="container mx-auto text-sm md:text-xs px-6 py-8">
        <div className="flex flex-col items-center space-y-8 md:flex-row md:justify-between md:space-y-0">
          <div className="md:flex md:items-center md:gap-5 md:justify-center text-center">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo-transparent.png"
                alt="Steadfast"
                width={150}
                height={40}
              />
            </Link>
          </div>

          <nav className="flex flex-col space-y-6 items-center text-sm md:text-xs md:flex-row md:space-y-0 md:space-x-6">
            <Link href="/" className="text-gray-900 hover:text-gray-700">
              Home
            </Link>
            <Link
              href="/products"
              className="text-gray-900 hover:text-gray-700"
            >
              Products
            </Link>
            <Link href="/padi" className="text-gray-900 hover:text-gray-700">
              Steadfast Padi
            </Link>
            <Link
              href="/contact-us"
              className="text-gray-900 hover:text-gray-700"
            >
              Contact Us
            </Link>
          </nav>
        </div>

        <hr className="my-8 border-gray-400" />

        <div className="flex flex-col items-center md:flex-row md:justify-between md:items-center space-y-8 md:space-y-0">
          <div className="flex flex-col items-center md:flex-row md:items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-center md:mr-6">
              Copyright © 2025 Steadfast. All rights reserved
            </p>
            <div className="flex space-x-6">
              <Link
                href="/privacy-policy"
                className="text-gray-900 hover:text-gray-700 font-medium"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-use"
                className="text-gray-900 hover:text-gray-700 font-medium"
              >
                Terms of Use
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="#"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <Facebook size={16} className="text-black" />
            </Link>
            <Link
              href="#"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <Twitter size={16} className="text-black" />
            </Link>
            <Link
              href="#"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <Instagram size={16} className="text-black" />
            </Link>
            <Link
              href="#"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <Linkedin size={16} fill="black" className="text-black" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

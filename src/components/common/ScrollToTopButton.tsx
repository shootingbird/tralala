"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react"; // clean up-arrow

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200); // show after scrolling 200px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-center 
                  w-12 h-12 rounded-full bg-white text-blue-600 shadow-md
                  border border-blue-200 hover:shadow-lg transition-all duration-300
                  ${
                    visible
                      ? "opacity-100 animate-bounce"
                      : "opacity-0 pointer-events-none"
                  }`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="w-6 h-6" strokeWidth={2.5} />
    </button>
  );
}

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface VerifiedPromoState {
  verified: boolean;
  code: string;
}

interface VerifiedPromoContextType {
  verifiedPromoCode: VerifiedPromoState;
  setVerifiedPromoCode: React.Dispatch<
    React.SetStateAction<VerifiedPromoState>
  >;
  resetVerifiedPromoCode: () => void;
}

const VerifiedPromoContext = createContext<
  VerifiedPromoContextType | undefined
>(undefined);

export function VerifiedPromoProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [verifiedPromoCode, setVerifiedPromoCode] =
    useState<VerifiedPromoState>({
      verified: false,
      code: "",
    });

  // ✅ Make it persistent with localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("verifiedPromoCode");
      if (saved) {
        setVerifiedPromoCode(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Failed to load verifiedPromoCode:", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "verifiedPromoCode",
        JSON.stringify(verifiedPromoCode)
      );
    } catch (err) {
      console.error("Failed to save verifiedPromoCode:", err);
    }
  }, [verifiedPromoCode]);

  // ✅ Undo/reset function
  const resetVerifiedPromoCode = () => {
    setVerifiedPromoCode({ verified: false, code: "" });
    localStorage.removeItem("verifiedPromoCode");
  };

  return (
    <VerifiedPromoContext.Provider
      value={{
        verifiedPromoCode,
        setVerifiedPromoCode,
        resetVerifiedPromoCode,
      }}
    >
      {children}
    </VerifiedPromoContext.Provider>
  );
}

export const useVerifiedPromo = () => {
  const ctx = useContext(VerifiedPromoContext);
  if (!ctx)
    throw new Error(
      "useVerifiedPromo must be used within VerifiedPromoProvider"
    );
  return ctx;
};

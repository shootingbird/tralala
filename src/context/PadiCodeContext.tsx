"use client";

import React, { createContext, useContext, useState } from "react";

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

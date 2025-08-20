"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  productId: string;
  variationId?: string;
  variationName?: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  category?: string;
  thumbnail?: string;
  description?: string;
  stock?: number;
  brand?: string;
  rating?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variationId?: string) => void;
  removeProduct: (productId: string) => void; // NEW: remove all entries for a product
  isInCart: (productId: string, variationId?: string) => boolean;
  updateQuantity: (
    productId: string,
    variationId: string | undefined,
    quantity: number
  ) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) setCartItems(JSON.parse(saved));
    } catch (err) {
      console.error("Failed to parse cart from localStorage", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch (err) {
      console.error("Failed to save cart to localStorage", err);
    }
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.productId === item.productId && i.variationId === item.variationId
      );

      if (existing) {
        // increment existing quantity
        return prev.map((i) =>
          i.productId === item.productId && i.variationId === item.variationId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string, variationId?: string) => {
    // remove only the exact product + variation pair (variationId may be undefined for non-variable)
    setCartItems((prev) =>
      prev.filter(
        (i) => !(i.productId === productId && i.variationId === variationId)
      )
    );
  };

  const removeProduct = (productId: string) => {
    // Remove ALL cart items for the given productId (all variations)
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const isInCart = (productId: string, variationId?: string) =>
    cartItems.some(
      (i) => i.productId === productId && i.variationId === variationId
    );

  const updateQuantity = (
    productId: string,
    variationId: string | undefined,
    quantity: number
  ) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variationId === variationId
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        removeProduct,
        isInCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};

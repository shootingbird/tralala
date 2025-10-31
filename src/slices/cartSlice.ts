import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem, CartState } from "@/types/cart";
import { RootState } from "@/lib/store/store";

const initialState: CartState = {
  items: [],
};

/**
 * Redux slice for managing cart state
 * Handles cart items, quantities, and persistence
 */
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /**
     * Removes an item from the cart by productId and variationId
     */
    removeFromCart: (
      state,
      action: PayloadAction<{
        productId: string;
        variationId: string | undefined;
      }>
    ) => {
      const { productId, variationId } = action.payload;
      state.items = state.items.filter(
        (item) =>
          !(item.productId === productId && item.variationId === variationId)
      );
    },
    /**
     * Updates the quantity of a cart item
     */
    updateQuantity: (
      state,
      action: PayloadAction<{
        productId: string;
        variationId: string | undefined;
        quantity: number;
      }>
    ) => {
      const { productId, variationId, quantity } = action.payload;
      const item = state.items.find(
        (item) =>
          item.productId === productId && item.variationId === variationId
      );
      if (item) {
        item.quantity = quantity;
      }
    },
    /**
     * Adds an item to the cart, merging quantities if item already exists
     */
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existingItem = state.items.find(
        (item) =>
          item.productId === newItem.productId &&
          item.variationId === newItem.variationId
      );
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }
    },
    /**
     * Removes all items for a specific product
     */
    removeProduct: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.productId !== productId);
    },
    /**
     * Clears all items from the cart
     */
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  removeFromCart,
  updateQuantity,
  addToCart,
  removeProduct,
  clearCart,
} = cartSlice.actions;

// Selectors
/**
 * Selects all cart items
 */
export const selectCartItems = (state: RootState) => state.cart.items;

/**
 * Selects the total number of items in the cart
 */
export const selectCartItemCount = (state: RootState) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0);

/**
 * Selects the total price of all items in the cart
 */
export const selectCartTotal = (state: RootState) =>
  state.cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

export default cartSlice.reducer;

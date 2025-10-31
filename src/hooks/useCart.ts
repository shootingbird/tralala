import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import {
  removeFromCart,
  updateQuantity,
  addToCart,
  removeProduct,
  clearCart,
} from "@/slices/cartSlice";
import { CartItem } from "@/types/cart";

export const useCart = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  const handleRemoveFromCart = (
    productId: string,
    variationId: string | undefined
  ) => {
    dispatch(removeFromCart({ productId, variationId }));
  };

  const handleUpdateQuantity = (
    productId: string,
    variationId: string | undefined,
    quantity: number
  ) => {
    dispatch(updateQuantity({ productId, variationId, quantity }));
  };

  const handleAddToCart = (item: CartItem) => {
    dispatch(addToCart(item));
  };

  const handleRemoveProduct = (productId: string) => {
    dispatch(removeProduct(productId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return {
    cartItems,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    addToCart: handleAddToCart,
    removeProduct: handleRemoveProduct,
    clearCart: handleClearCart,
  };
};

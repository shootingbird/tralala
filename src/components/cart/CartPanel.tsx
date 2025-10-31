import { X, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartPanel = ({ isOpen, onClose }: CartPanelProps) => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  if (!isOpen) return null;

  const handleQuantityChange = (
    productId: string,
    variationId: string | undefined,
    increment: boolean
  ) => {
    const item = cartItems.find(
      (i) => i.productId === productId && i.variationId === variationId
    );
    if (item) {
      const newQuantity = increment ? item.quantity + 1 : item.quantity - 1;
      if (newQuantity > 0) {
        updateQuantity(productId, variationId, newQuantity);
      }
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };
  console.log(cartItems);
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-[90%] ml-[10%] md:ml-0 md:w-[400px] bg-[#fff] z-50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 bg-[#fff]">
            <h2 className="text-lg font-medium">Your Cart</h2>
            <button onClick={onClose} className="p-1">
              <X size={20} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto bg-[#fff] px-6 py-4">
            <div className="space-y-6 bg-[#fff]">
              {cartItems.map((item) => (
                <div
                  key={`${item.productId}-${item.variationId || "default"}`}
                  className="flex gap-4"
                >
                  {/* Image */}
                  <div className="flex bg-white">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={110}
                      height={110}
                      className="object-cover rounded-lg aspect-square"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex text-sm gap-5 mb-2 justify-between">
                      <h3 className="font-medium">
                        {item.title}{" "}
                        <span className="font-semibold text-xs">
                          {item.variationName ? `(${item.variationName})` : ""}
                        </span>
                      </h3>
                      <span className="font-medium">
                        ₦{item.price.toLocaleString()}
                      </span>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col">
                      <div className="flex items-start">
                        <div className="mt-2 inline-flex items-center rounded-lg border border-gray-200 px-1 py-1">
                          <button
                            className="p-1 px-3 text-gray-400 hover:text-gray-600"
                            onClick={() =>
                              handleQuantityChange(
                                item.productId,
                                item.variationId,
                                false
                              )
                            }
                          >
                            <Minus size={16} />
                          </button>
                          <span className="p-1 px-3 mx-4 min-w-[20px] text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            className="p-1 px-3 text-gray-400 hover:text-gray-600"
                            onClick={() =>
                              handleQuantityChange(
                                item.productId,
                                item.variationId,
                                true
                              )
                            }
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      className="mt-2 text-xs text-black"
                      onClick={() =>
                        removeFromCart(item.productId, item.variationId)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#fff] px-6 py-4">
            <div className="flex justify-between mb-1">
              <span className="font-medium">Estimated total:</span>
              <span className="font-medium">
                ₦{calculateTotal().toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Shipping will be calculated at checkout
            </p>
            <Link
              href="/cart"
              className="flex justify-center w-full bg-[#184193] text-white py-3 rounded-full font-medium mb-4"
            >
              View Cart
            </Link>
            <Link
              href="/cart"
              className="w-full hidden md:flex items-center justify-between px-4 py-3 border border-gray-200 rounded-full"
            >
              <span className="text-sm">Apply promo code</span>
              <Plus size={16} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

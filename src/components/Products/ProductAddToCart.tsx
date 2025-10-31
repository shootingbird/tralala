import { Loader2 } from "lucide-react";
import { NormalizedProduct, NormalizedVariation } from "@/types/product";

interface ProductAddToCartProps {
  product: NormalizedProduct;
  selectedVariation: NormalizedVariation | undefined;
  isAdded: boolean;
  isProcessing: boolean;
  cartQuantity: number;
  onQuantityChange: (increment: boolean) => void;
  onAddToCart: () => void;
  onAddAllVariationsToCart: () => void;
  onClearProductFromCart: () => void;
}

export function ProductAddToCart({
  product,
  selectedVariation,
  isAdded,
  isProcessing,
  cartQuantity,
  onQuantityChange,
  onAddToCart,
  onAddAllVariationsToCart,
  onClearProductFromCart,
}: ProductAddToCartProps) {
  const stockQuantity = selectedVariation
    ? selectedVariation.quantity
    : product.stock_quantity;

  console.log(product);

  return (
    <div className="flex-1">
      <p className="text-[#184193] text-base font-medium truncate py-8">
        {stockQuantity} product{stockQuantity !== 1 ? "s" : ""} available
      </p>

      {product.is_variable_product ? (
        <button
          onClick={isAdded ? onClearProductFromCart : onAddAllVariationsToCart}
          className={`w-full md:max-w-96 px-6 py-3 rounded-lg font-medium ${
            isAdded
              ? "bg-gray-200 text-gray-700 border border-gray-300"
              : "bg-[#E94B1C] text-white hover:bg-[#E94B1C]/90"
          }`}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin mr-2" size={16} />
              Processing...
            </div>
          ) : isAdded ? (
            "CLEAR CART"
          ) : (
            "ADD TO CART"
          )}
        </button>
      ) : (
        <div className="flex gap-4">
          <div className="flex items-center bg-[#F4F4F4] rounded-xl">
            <button
              onClick={() => onQuantityChange(false)}
              className="px-4 py-3 text-2xl"
            >
              -
            </button>
            <span className="flex-1 text-center px-4">{cartQuantity}</span>
            <button
              onClick={() => onQuantityChange(true)}
              className="px-4 py-3 text-2xl"
            >
              +
            </button>
          </div>
          <button
            onClick={onAddToCart}
            className={`flex-1 px-6 py-3 rounded-lg font-medium ${
              isAdded
                ? "bg-gray-200 text-gray-700 border border-gray-300"
                : "bg-[#E94B1C] text-white hover:bg-[#E94B1C]/90"
            }`}
          >
            {isAdded ? "REMOVE FROM CART" : "ADD TO CART"}
          </button>
        </div>
      )}
    </div>
  );
}

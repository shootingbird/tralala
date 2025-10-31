import { NormalizedProduct, NormalizedVariation } from "@/types/product";

interface ProductVariationsProps {
  product: NormalizedProduct;
  variationInCart: NormalizedVariation[];
  onVariationQuantityChange: (variationId: string, increment: boolean) => void;
}

export function ProductVariations({
  product,
  variationInCart,
  onVariationQuantityChange,
}: ProductVariationsProps) {
  if (!product.is_variable_product) return null;

  return (
    <div className="pt-5">
      <h3 className="font-medium mb-4">Variations</h3>
      <div className="grid gap-4 md:h-80 md:overflow-y-auto">
        {product.variations.map((variation) => {
          const inLocal = variationInCart.find((v) => v.id === variation.id);
          const qty = inLocal?.variationQuantityInCart ?? 0;

          return (
            <div
              key={variation.id}
              className="flex justify-between items-center gap-4 py-3 border-b"
            >
              <div>
                <p className="font-medium">{variation.variation}</p>
              </div>

              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">
                  NGN {variation.price.toLocaleString()}
                </p>

                <div className="flex items-center bg-[#F4F4F4] rounded-xl">
                  <button
                    onClick={() =>
                      onVariationQuantityChange(String(variation.id), false)
                    }
                    className="px-3 py-2 text-xl"
                  >
                    -
                  </button>
                  <span className="px-4">{qty}</span>
                  <button
                    onClick={() =>
                      onVariationQuantityChange(String(variation.id), true)
                    }
                    className="px-3 py-2 text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

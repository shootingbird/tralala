"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useGetProductQuery } from "@/slices/products/productApiSlice";
import { NormalizedVariation } from "@/types/product";
import { normalizeProduct } from "@/lib/productUtils";

import { useToast } from "@/components/ui/toast";

import Header from "@/components/shared/Header";
import { ProductTabs } from "@/components/Products/ProductTabs";
import { ProductImageGallery } from "@/components/Products/ProductImageGallery";
import { ProductInfo } from "@/components/Products/ProductInfo";
import { ProductVariations } from "@/components/Products/ProductVariations";
import { ProductAddToCart } from "@/components/Products/ProductAddToCart";
import { RelatedProducts } from "@/components/Products/RelatedProducts";
import { useCart } from "@/hooks/useCart";
import LoadingSkeloton from "./LoadingSkeloton";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import AppWapper from "@/app/AppWapper";

export default function ProductDetailPage() {
  return (
    <AppWapper>
      <ProductDetailPageContent />
    </AppWapper>
  );
}

function ProductDetailPageContent() {
  const params = useParams();
  const productId = String(params?.id ?? "");
  const { showToast } = useToast();

  const {
    addToCart,
    removeFromCart,
    removeProduct,
    updateQuantity,
    cartItems,
  } = useCart();

  const { data, isLoading, error } = useGetProductQuery(Number(productId));
  const rawProduct = data?.product;
  const normalizedProduct = useMemo(
    () => (rawProduct ? normalizeProduct(rawProduct) : undefined),
    [rawProduct]
  );
  const product = useMemo(() => {
    if (!normalizedProduct) return undefined;
    return {
      ...normalizedProduct,
      variations: normalizedProduct.variations.map((v) => {
        const ci = cartItems.find(
          (ci) =>
            ci.productId === normalizedProduct.productId &&
            ci.variationId === v.id
        );
        return { ...v, variationQuantityInCart: ci?.quantity ?? 0 };
      }),
    };
  }, [normalizedProduct, cartItems]);
  const isPageLoading = isLoading;

  // variation state
  const [variationInCart, setVariationInCart] = useState<NormalizedVariation[]>(
    []
  );
  const [selectedVariation, setSelectedVariation] = useState<
    NormalizedVariation | undefined
  >(undefined);

  // non-variable product state
  const [cartQuantity, setCartQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // prevent rapid double-click
  const [isProcessing, setIsProcessing] = useState(false);

  // ---------- Init after product or cart changes ----------
  useEffect(() => {
    if (!product) return;

    if (product.is_variable_product && product.variations?.length) {
      setSelectedVariation(product.variations[0]);
    } else {
      setSelectedVariation(undefined);
    }

    if (product.is_variable_product) {
      const mapped = product.variations.map((v) => {
        const ci = cartItems.find(
          (ci) => ci.productId === product.productId && ci.variationId === v.id
        );
        return { ...v, variationQuantityInCart: ci?.quantity ?? 0 };
      });
      setVariationInCart(mapped);
    } else {
      setVariationInCart([]);
    }

    // isAdded => any cart item for this product
    const any = cartItems.some((ci) => ci.productId === product.productId);
    setIsAdded(any);
  }, [product, cartItems]);

  // ---------- Derived ----------
  const priceRange = useMemo(() => {
    if (product?.variations && product.variations.length > 0) {
      const prices = product.variations.map((v) => v.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return { min, max };
    }
    return null;
  }, [product]);

  // ---------- Non-variable product handlers ----------
  useEffect(() => {
    if (!product || product.is_variable_product) return;
    const item = cartItems.find(
      (ci) => ci.productId === product.productId && !ci.variationId
    );
    if (item) {
      setCartQuantity(item.quantity);
      setIsAdded(true);
    } else {
      setCartQuantity(1);
      setIsAdded(false);
    }
  }, [product, cartItems]);

  const handleQuantityChange = (increment: boolean) => {
    if (!product || product.is_variable_product) return;
    const item = cartItems.find(
      (ci) => ci.productId === product.productId && !ci.variationId
    );
    if (item) {
      const newQty = increment ? item.quantity + 1 : item.quantity - 1;
      if (newQty > 0) updateQuantity(product.productId, undefined, newQty);
    } else if (increment) {
      addToCart({
        productId: product.productId,
        variationId: undefined,
        title: product.title || product.name,
        price: product.price,
        image: product.image_urls?.[0] || "",
        quantity: 1,
      });
    }
  };

  const handleAddToCart = () => {
    if (!product || product.is_variable_product) return;
    const inCart = cartItems.find(
      (ci) => ci.productId === product.productId && !ci.variationId
    );
    if (inCart) {
      removeFromCart(product.productId, undefined);
      setIsAdded(false);
      setCartQuantity(1);
      showToast("Product removed from cart", "success");
    } else {
      addToCart({
        productId: product.productId,
        variationId: undefined,
        title: product.title || product.name,
        price: product.price,
        image: product.image_urls?.[0] || "",
        quantity: cartQuantity,
      });
      setIsAdded(true);
      showToast("Product added to cart", "success");
    }
  };

  // ---------- Variation handlers ----------
  const handleVariationQuantityChange = (
    variationId: string,
    increment: boolean
  ) => {
    if (!product) return;
    setVariationInCart((prev) => {
      const variation = product.variations.find((v) => v.id === variationId);
      if (!variation) return prev;

      const existing = prev.find((v) => v.id === variationId);
      const currentQuantity = existing?.variationQuantityInCart ?? 0;
      const newQuantity = currentQuantity + (increment ? 1 : -1);

      if (newQuantity < 0) return prev;

      if (newQuantity > variation.quantity) {
        console.error(
          `Only ${variation.quantity} units available for ${variation.variation}`
        );
        return prev;
      }

      if (existing) {
        return prev.map((v) =>
          v.id === variationId
            ? { ...v, variationQuantityInCart: newQuantity }
            : v
        );
      }
      return [...prev, { ...variation, variationQuantityInCart: newQuantity }];
    });

    const v = product.variations.find((v) => v.id === variationId);
    if (v) setSelectedVariation(v);
  };

  // Add all selected variations to cart (now with processing guard and reset)
  const handleAddAllVariationsToCart = async () => {
    if (!product) return;
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const toAdd = variationInCart.filter(
        (v) => (v.variationQuantityInCart ?? 0) > 0
      );

      if (toAdd.length === 0) {
        console.error("No variation quantities selected");
        setIsProcessing(false);
        return;
      }

      toAdd.forEach((v) => {
        const qty = v.variationQuantityInCart ?? 0;
        if (qty > v.quantity) {
          console.error(
            `Only ${v.quantity} unit(s) available for ${v.variation}`
          );
          return;
        }

        addToCart({
          productId: product.productId,
          variationId: v.id,
          variationName: v.variation,
          title: product.title || product.name,
          price: v.price,
          image: product.image_urls?.[0] || "",
          quantity: qty,
        });
      });

      // reset local selections for those variations (prevents accidental re-adding)
      setVariationInCart((prev) =>
        prev.map((v) => ({ ...v, variationQuantityInCart: 0 }))
      );
      setIsAdded(true);
      showToast("Variations added to cart", "success");
    } catch (err) {
      console.error("Error adding variations:", err);
      console.error("Could not add variations to cart");
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear all cart items for this product (all variations)
  const handleClearProductFromCart = () => {
    if (!product) return;
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      removeProduct(product.productId);
      // reset local variation quantities
      setVariationInCart((prev) =>
        prev.map((v) => ({ ...v, variationQuantityInCart: 0 }))
      );
      setIsAdded(false);
      showToast("Product cleared from cart", "success");
    } catch (err) {
      console.error("Error clearing product:", err);
      console.error("Could not clear product from cart");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isPageLoading) return <LoadingSkeloton />;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700">
            Product not found
          </h2>
          <p className="text-gray-500 mt-2">
            {"The product you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }
  console.log("Rendering product page for:", product);
  return (
    <>
      <Header isProductPage showSearchbar={true} />
      <main className="container mx-auto px-4">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: product?.name || "Product Details" },
          ]}
        />
        <div className="flex flex-col md:flex-row md:gap-8 mt-8">
          <ProductImageGallery
            image_urls={product.image_urls}
            videos={product.videos || []}
            name={product.name}
            title={product.title || product.name}
          />

          <div className="flex-1">
            <ProductInfo product={product} priceRange={priceRange} />

            <ProductVariations
              product={product}
              variationInCart={variationInCart}
              onVariationQuantityChange={handleVariationQuantityChange}
            />

            <ProductAddToCart
              product={product}
              selectedVariation={selectedVariation}
              isAdded={isAdded}
              isProcessing={isProcessing}
              cartQuantity={cartQuantity}
              onQuantityChange={handleQuantityChange}
              onAddToCart={handleAddToCart}
              onAddAllVariationsToCart={handleAddAllVariationsToCart}
              onClearProductFromCart={handleClearProductFromCart}
            />
          </div>
        </div>

        <ProductTabs product={product} />

        <RelatedProducts
          productId={Number(product.productId)}
          category={product.category}
          limit={6}
        />
      </main>
    </>
  );
}

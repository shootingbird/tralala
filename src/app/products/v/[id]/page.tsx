"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  Share2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { TopBanner } from "@/components/layout/TopBanner";
import { Header } from "@/components/layout/Header";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { StarRating } from "@/components/ui/StarRating";
import { ActionButton } from "@/components/ui/ActionButton";
import { BookmarkIcon } from "@/components/icons/bookmark";
import { Footer } from "@/components/layout/Footer";
import { ProductTabs } from "@/components/product/ProductTabs";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useIsMobile } from "@/lib/mobile";
import LoadingSkeloton from "./LoadingSkeloton";
import NotFound from "@/app/not-found";

interface Variation {
  id?: string; // normalized id
  price: number;
  quantity: number;
  variation: string;
  variationQuantityInCart?: number;
}

interface Product {
  productId: string;
  name: string;
  brand: string;
  title?: string;
  price: number;
  is_variable_product?: boolean;
  rating: number | 0;
  image?: string;
  image_urls: string[];
  isNew?: boolean;
  dateCreated?: string;
  dateUpdated?: string;
  stock?: number;
  review_count?: number;
  category?: string;
  totalSold?: number;
  specifications?: Array<{ key: string; value: string }>;
  highlights?: Array<{ key: string; value: string }>;
  whats_in_box?: string[];
  description?: string;
  discount?: { amount: number; percentage: number };
  variations: Variation[];
  stock_quantity?: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = String(params?.id ?? "");
  const isMobile = useIsMobile();

  const [product, setProducts] = useState<Product | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [magnifyPosition, setMagnifyPosition] = useState({ x: 0, y: 0 });
  const enterTimeout = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeout = useRef<NodeJS.Timeout | null>(null);

  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const {
    addToCart,
    removeFromCart,
    removeProduct,
    updateQuantity,
    cartItems,
  } = useCart();

  // variation state
  const [variationInCart, setVariationInCart] = useState<Variation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<
    Variation | undefined
  >(undefined);

  // non-variable product state
  const [cartQuantity, setCartQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // prevent rapid double-click
  const [isProcessing, setIsProcessing] = useState(false);

  // ---------- Normalizer for API response ----------
  const normalizeProduct = (raw: any): Product => {
    const variations = (raw.variations || []).map((v: any) => ({
      id: String(v.id ?? v.id ?? Math.random()),
      variation: String(v.variation ?? ""),
      price: Number(v.price ?? v.effective_price ?? 0),
      quantity: Number(v.quantity ?? 0),
      variationQuantityInCart: 0,
    }));

    return {
      productId: String(raw.productId ?? raw.id ?? ""),
      name: raw.name ?? raw.title ?? "",
      title: raw.title ?? raw.name ?? "",
      brand: raw.brand ?? "",
      price: Number(raw.price ?? raw.effective_price ?? 0),
      is_variable_product: !!raw.is_variable_product,
      rating: raw.rating ?? 0,
      image: raw.image_urls?.[0] ?? "",
      image_urls: raw.image_urls ?? [],
      dateCreated: raw.created_at,
      dateUpdated: raw.updated_at,
      stock: Number(raw.stock ?? raw.stock_quantity ?? 0),
      review_count: Number(raw.review_count ?? 0),
      category: raw.category ?? raw.sub_category?.[0] ?? "",
      totalSold: Number(raw.total_sold ?? 0),
      specifications: Array.isArray(raw.specifications)
        ? raw.specifications
        : [],
      highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
      whats_in_box: raw.whats_in_box ?? [],
      description: raw.description ?? "",
      discount: raw.discount ?? undefined,
      variations,
      stock_quantity: Number(raw.stock_quantity ?? raw.stock ?? 0),
    };
  };

  // ---------- Fetch ----------
  useEffect(() => {
    if (!productId) return;

    const fetchProducts = async () => {
      setIsLoading(true);
      const cacheKey = `products_${productId}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setProducts(JSON.parse(cached));
          setIsPageLoading(false);
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`
        );
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        if (!data || !data.product) throw new Error("Invalid product data");

        const normalized = normalizeProduct(data.product);

        // populate variationQuantityInCart from cartItems
        normalized.variations = normalized.variations.map((v) => {
          const ci = cartItems.find(
            (ci) =>
              ci.productId === normalized.productId && ci.variationId === v.id
          );
          return { ...v, variationQuantityInCart: ci?.quantity ?? 0 };
        });

        setProducts(normalized);
        localStorage.setItem(cacheKey, JSON.stringify(normalized));
      } catch (err) {
        console.error("Error fetching products:", err);
        const cachedProducts = localStorage.getItem(cacheKey);
        if (cachedProducts) {
          try {
            setProducts(JSON.parse(cachedProducts));
          } catch (e) {
            console.error("Error parsing cached products:", e);
          }
        }
      } finally {
        setIsLoading(false);
        setIsPageLoading(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

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

    setIsWishlisted(isInWishlist(product.productId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ---------- UI helpers ----------
  const handleMouseEnter = () => {
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    enterTimeout.current = setTimeout(() => setIsHovering(true), 10);
  };
  const handleMouseLeave = () => {
    if (enterTimeout.current) clearTimeout(enterTimeout.current);
    leaveTimeout.current = setTimeout(() => setIsHovering(false), 0);
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMagnifyPosition({ x, y });
  };

  // ---------- Wishlist ----------
  const toggleWishlist = async () => {
    if (!product) return;
    try {
      if (isWishlisted) {
        removeFromWishlist(product.productId);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        addToWishlist({
          productId: product.productId,
          title: product.title || product.name,
          image: product.image_urls?.[0] || "",
          description: product.description || "",
          price: product.price,
          category: product.category || "",
          brand: product.brand || "",
          rating: product.rating || 0,
          stock: product.stock || product.stock_quantity || 0,
          thumbnail: product.image_urls?.[0] || "",
        });
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      console.error("Error updating wishlist:", err);
      toast.error("Could not update wishlist");
    }
  };

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
        title: product.title || product.name,
        price: product.price,
        image: product.image_urls?.[0] || "",
        quantity: 1,
      });
      toast.success("Added to cart");
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
      toast.success("Removed from cart");
    } else {
      addToCart({
        productId: product.productId,
        title: product.title || product.name,
        price: product.price,
        image: product.image_urls?.[0] || "",
        quantity: cartQuantity,
      });
      setIsAdded(true);
      toast.success("Added to cart");
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
        toast.error(
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
        toast.error("No variation quantities selected");
        setIsProcessing(false);
        return;
      }

      toAdd.forEach((v) => {
        const qty = v.variationQuantityInCart ?? 0;
        if (qty > v.quantity) {
          toast.error(
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
      toast.success("Selected variations added to cart");
    } catch (err) {
      console.error("Error adding variations:", err);
      toast.error("Could not add variations to cart");
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
      toast.success("Cleared product from cart");
    } catch (err) {
      console.error("Error clearing product:", err);
      toast.error("Could not clear product from cart");
    } finally {
      setIsProcessing(false);
    }
  };

  // Next / prev images
  const nextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) =>
      prev === product.image_urls.length - 1 ? 0 : prev + 1
    );
  };
  const prevImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.image_urls.length - 1 : prev - 1
    );
  };

  // Share
  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    const shareData = {
      title: `Check out this product on Steadfast: ${
        product?.title || "Product"
      }`,
      text: product?.description || "",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.url}`
        );
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Could not share product");
    } finally {
      setIsSharing(false);
    }
  };

  if (!product && !isPageLoading) return <NotFound />;
  if (isPageLoading) return <LoadingSkeloton />;

  return (
    <>
      <Toaster position="top-right" />
      <TopBanner theme="dark" />
      <Header />
      <main className="container mx-auto px-4 pt-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: product?.title || "Product Details" },
          ]}
        />

        <div className="flex flex-col md:flex-row gap-8 mt-8">
          <div className="flex-1">
            {/* Image & thumbnails */}
            <div
              className="relative aspect-square mb-4 cursor-crosshair"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              {product && (
                <div className="relative flex justify-center items-center aspect-square overflow-hidden rounded-2xl bg-white ">
                  {product?.image_urls?.[currentImageIndex] ? (
                    <Image
                      src={product.image_urls[currentImageIndex]}
                      alt={`${product.name} - View ${currentImageIndex + 1}`}
                      fill
                      className="object-cover "
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}

                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-5 gap-4">
              {product &&
                product.image_urls.length > 1 &&
                product.image_urls.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg ${
                      currentImageIndex === index
                        ? "ring-1 ring-[#184193]/50 ring-offset-2"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} view ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 33vw, 25vw"
                      priority={index === 0}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/logo.png";
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>

          {isHovering && !isMobile ? (
            <div className="flex-1 md:h-[30rem] overflow-hidden">
              <div className="col-span-3 relative aspect-square rounded-lg overflow-hidden transition-opacity duration-200 opacity-100">
                {product && (
                  <div
                    className="absolute w-full h-full transition-opacity duration-200"
                    style={{
                      backgroundImage: `url(${product.image_urls[0]})`,
                      backgroundPosition: `${magnifyPosition.x}% ${magnifyPosition.y}%`,
                      backgroundSize: "200%",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1">
              {/* Header row and actions */}
              <div className="hidden md:flex flex-col md:flex-row gap-5 md:gap-0 md:items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    <StarRating rating={product?.rating || 0} />
                  </div>
                  <span className="text-sm text-gray-600">
                    {product?.review_count || 0} Reviews
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 bg-[#FFF0F0] text-[#D46F77] px-3 py-2 rounded-xl">
                    <Heart size={16} className="text-[#D46F77]" />
                    <span className="text-sm text-[#D46F77]">
                      {product?.review_count || 0}
                    </span>
                  </button>

                  <button
                    className={`flex items-center bg-[#EDF0F8] text-[#000] px-3 py-2 rounded-xl ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    aria-label="Add to wishlist"
                    onClick={toggleWishlist}
                    disabled={isLoading}
                  >
                    <BookmarkIcon
                      className={isWishlisted ? "text-black-500" : "text-black"}
                      isFilled={isWishlisted}
                    />
                  </button>

                  <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className={`flex items-center bg-[#EDF0F8] text-[#000] px-3 py-2 rounded-xl ${
                      isSharing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {!isSharing ? (
                      <Share2 size={20} className={`text-black`} />
                    ) : (
                      <Loader2
                        size={20}
                        className={`text-black  animate-spin`}
                      />
                    )}
                  </button>
                </div>
              </div>

              <h1 className="text-2xl font-semibold mb-2">{product?.title}</h1>
              <p className="text-gray-400 text-sm mb-4">{product?.category}</p>

              <div className="flex md:hidden flex-col md:flex-row gap-5 md:gap-0 md:items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    <StarRating rating={product?.rating || 0} />
                  </div>
                  <span className="text-sm text-gray-600">
                    {product?.review_count || 0} Reviews
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 bg-[#FFF0F0] text-[#D46F77] px-3 py-2 rounded-xl">
                    <Heart size={16} className="text-[#D46F77]" />
                    <span className="text-sm text-[#D46F77]">
                      {product?.review_count || 0}
                    </span>
                  </button>

                  <button
                    className={`flex items-center bg-[#EDF0F8] text-[#000] px-3 py-2 rounded-xl ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    aria-label="Add to wishlist"
                    onClick={toggleWishlist}
                    disabled={isLoading}
                  >
                    <BookmarkIcon
                      className={isWishlisted ? "text-black-500" : "text-black"}
                      isFilled={isWishlisted}
                    />
                  </button>

                  <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className={`flex items-center bg-[#EDF0F8] text-[#000] px-3 py-2 rounded-xl ${
                      isSharing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {!isSharing ? (
                      <Share2 size={20} className={`text-black`} />
                    ) : (
                      <Loader2
                        size={20}
                        className={`text-black  animate-spin`}
                      />
                    )}
                  </button>
                </div>
              </div>

              <p className="hidden md:block text-gray-600 mb-8 leading-relaxed line-clamp-5">
                {product?.description}
              </p>

              <p className="text-lg md:text-2xl text-gray-700 font-semibold border-y border-gray-200 py-2 md:border-t-0 md:pb-4">
                NGN{" "}
                {priceRange
                  ? `${priceRange.min.toLocaleString()}.00 -  NGN ${priceRange.max.toLocaleString()}.00`
                  : product?.price.toLocaleString()}
                .00
              </p>

              {product?.is_variable_product && (
                <div className="pt-5">
                  <h3 className="font-medium mb-4">Variation</h3>
                  <div className=" grid gap-4 md:h-80 md:overflow-y-auto">
                    {product?.variations.map((variation) => {
                      const inLocal = variationInCart.find(
                        (v) => v.id === variation.id
                      );
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
                                  handleVariationQuantityChange(
                                    String(variation.id),
                                    false
                                  )
                                }
                                className="px-3 py-2 text-xl"
                              >
                                -
                              </button>
                              <span className="px-4">{qty}</span>
                              <button
                                onClick={() =>
                                  handleVariationQuantityChange(
                                    String(variation.id),
                                    true
                                  )
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
              )}

              <p className="text-[#184193] text-base font-medium truncate py-8">
                {selectedVariation
                  ? selectedVariation.quantity
                  : product?.stock_quantity}{" "}
                product available
              </p>

              {product?.is_variable_product ? (
                <ActionButton
                  variant={isAdded ? "outline" : "primary"}
                  fullWidth
                  isCart
                  onClick={
                    isAdded
                      ? handleClearProductFromCart
                      : handleAddAllVariationsToCart
                  }
                  className="w-full md:max-w-96"
                  disabled={isProcessing}
                >
                  {isAdded ? "CLEAR CART" : "ADD TO CART"}
                </ActionButton>
              ) : (
                <div className="flex gap-4">
                  <div className="flex w-45 items-center bg-[#F4F4F4] rounded-xl ">
                    <button
                      onClick={() => handleQuantityChange(false)}
                      className="px-4 py-3 text-2xl"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center">{cartQuantity}</span>
                    <button
                      onClick={() => handleQuantityChange(true)}
                      className="px-4 py-3 text-2xl"
                    >
                      +
                    </button>
                  </div>
                  <ActionButton
                    variant={isAdded ? "outline" : "primary"}
                    fullWidth
                    isCart
                    onClick={handleAddToCart}
                    className="max-w-96"
                  >
                    {isAdded ? "CLEAR CART" : "ADD TO CART"}
                  </ActionButton>
                </div>
              )}
            </div>
          )}
        </div>

        {product && <ProductTabs product={product} />}
      </main>
      <Footer />
    </>
  );
}

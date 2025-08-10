"use client";

import { useMemo, useRef, useState } from "react";
import { useEffect } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  Share2,
} from "lucide-react";
import { TopBanner } from "@/components/layout/TopBanner";
import { Header } from "@/components/layout/Header";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { StarRating } from "@/components/ui/StarRating";
import { ActionButton } from "@/components/ui/ActionButton";
import { BookmarkIcon } from "@/components/icons/bookmark";
import { Footer } from "@/components/layout/Footer";
import { ProductTabs } from "@/components/product/ProductTabs";
import { useCart } from "@/context/CartContext";
import { useIsMobile } from "@/lib/mobile";
import LoadingSkeloton from "./LoadingSkeloton";
import NotFound from "@/app/not-found";

interface Variation {
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
  rating: number | 0;
  image: string;
  images: string[];
  isNew?: boolean;
  dateCreated: string;
  dateUpdated: string;
  stock: number;
  review_count: number;
  category: string;
  totalSold: number;
  specifications?: Array<{ key: string; value: string }>;
  highlights?: Array<{ key: string; value: string }>;
  whats_in_box?: string[];
  description?: string;
  discount?: {
    amount: number;
    percentage: number;
  };
  variations: Variation[];
  stock_quantity: number;
}
export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const isMobile = useIsMobile();

  const [product, setProducts] = useState<Product>();
  const [isLoading, setIsLoading] = useState(false);

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
    // isInCart,
    removeFromCart,
    updateQuantity: updateQuantity,
    cartItems,
  } = useCart();
  const [variationInCart, setVariationInCart] = useState<Variation[]>([]);
  const [selectedVariationName, setSelectedVariationName] =
    useState<string>("");
  const [isAdded, setIsAdded] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        const cacheKey = `products_${productId}`;
        const cachedProducts = localStorage.getItem(cacheKey);
        if (cachedProducts) {
          const parsedProducts = JSON.parse(cachedProducts);
          setProducts(parsedProducts);
          setIsPageLoading(false);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (!data || !data.product) {
          throw new Error("Invalid product data");
        }
        const newProducts = data.product;

        setProducts(newProducts);
        localStorage.setItem(cacheKey, JSON.stringify(newProducts));
      } catch (error) {
        console.error("Error fetching products:", error);

        const cacheKey = `products_${productId}`;
        const cachedProducts = localStorage.getItem(cacheKey);
        if (cachedProducts) {
          try {
            setProducts(JSON.parse(cachedProducts));
          } catch (parseError) {
            console.error("Error parsing cached products:", parseError);
          }
        }
      } finally {
        setIsLoading(false);
        setIsPageLoading(false);
      }
    };
    fetchProducts();
  }, [productId]);

  useEffect(() => {
    if (product && product.variations?.length) {
      setSelectedVariationName(product.variations[0].variation);
    }
  }, [product]);

  useEffect(() => {
    if (product?.variations) {
      const initialVariationInCart: Variation[] = product.variations.map(
        (v) => {
          const item = cartItems.find(
            (item) => item.productId === product.productId
            // &&
            // item.variation?.variation === v.variation
          );

          return {
            ...v,
            variationQuantityInCart: item?.quantity || 0,
          };
        }
      );

      setVariationInCart(initialVariationInCart);
    }
  }, [product, cartItems]);

  useEffect(() => {
    if (product?.variations && product.variations.length > 0) {
      setSelectedVariationName(product.variations[0].variation);
    }

    setIsWishlisted(isInWishlist(productId));
  }, [productId, isInWishlist]);

  const priceRange = useMemo(() => {
    if (product?.variations && product.variations.length > 0) {
      const prices = product.variations.map((v) => v.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return { min, max };
    }
    return null;
  }, [product]);

  const selectedVariation =
    product?.variations.find((v) => v.variation === selectedVariationName) ??
    null;

  const handleMouseEnter = () => {
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    enterTimeout.current = setTimeout(() => {
      setIsHovering(true);
    }, 10);
  };

  const handleMouseLeave = () => {
    if (enterTimeout.current) clearTimeout(enterTimeout.current);
    leaveTimeout.current = setTimeout(() => {
      setIsHovering(false);
    }, 0);
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMagnifyPosition({ x, y });
  };

  const toggleWishlist = async () => {
    try {
      setIsLoading(true);
      if (isWishlisted) {
        removeFromWishlist(productId);
      } else {
        addToWishlist({
          productId,
          title: product?.title || "",
          image: product?.images[0] || "",
          description: product?.description || "",
          price: product?.price || 0,
          category: product?.category || "",
          brand: product?.brand || "",
          rating: product?.rating || 0,
          stock: product?.stock || 0,
          thumbnail: product?.images[0] || "",
        });
      }
      setIsWishlisted(!isWishlisted);
    } catch (error) {
      console.error("Error updating wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [cartQuantity, setCartQuantity] = useState(1);

  useEffect(() => {
    const itemInCart = cartItems.find((item) => item.productId == productId);

    if (itemInCart) {
      setCartQuantity(itemInCart.quantity);
      setIsAdded(true);
    } else {
      setCartQuantity(1);
      setIsAdded(false);
    }
  }, [productId, cartItems]);

  const handleQuantityChange = (productId: string, increment: boolean) => {
    const item = cartItems.find((item) => item.productId === productId);
    if (item) {
      const newQuantity = increment ? item.quantity + 1 : item.quantity - 1;
      if (newQuantity > 0) {
        updateQuantity(productId, newQuantity);
      }
    } else {
      handleAddToCart();
    }
  };

  const handleAddToCart = () => {
    if (product) {
      if (isAdded) {
        removeFromCart(product.productId);
        setIsAdded(false);
        setCartQuantity(1);
      } else {
        addToCart({
          productId: product.productId,
          title: product.title || product.name,
          price: product.price,
          image: product.images[0],
          quantity: cartQuantity,
          category: product.category,
          brand: product.brand,
          rating: product.rating,
          thumbnail: product.images[0],
        });
        setIsAdded(true);
      }
    }
  };

  const handleVariationQuantityChange = (
    variationName: string,
    increment: boolean
  ) => {
    setVariationInCart((prev) => {
      const variation = product?.variations.find(
        (v) => v.variation === variationName
      );
      if (!variation) return prev;

      const existing = prev.find((v) => v.variation === variationName);
      const currentQuantity = existing?.variationQuantityInCart || 0;
      const newQuantity = currentQuantity + (increment ? 1 : -1);

      if (newQuantity < 0) return prev;

      if (newQuantity > variation.quantity) {
        alert(
          `Only ${variation.quantity} unit(s) available for ${variationName}`
        );
        return prev;
      }

      const updated = existing
        ? prev.map((v) =>
            v.variation === variationName
              ? { ...v, variationQuantityInCart: newQuantity }
              : v
          )
        : [...prev, { ...variation, variationQuantityInCart: newQuantity }];

      return updated;
    });
  };

  const handleAddAllVariationsToCart = () => {
    if (!product) return;

    variationInCart.forEach((variation) => {
      if (
        variation.variationQuantityInCart &&
        variation.variationQuantityInCart > 0
      ) {
        addToCart({
          productId: product.productId,
          title: product.title || product.name,
          price: variation.price,
          quantity: variation.variationQuantityInCart,
          image: product.images[0],
          category: product.category,
          brand: product.brand,
          rating: product.rating,
          thumbnail: product.images[0],
          // variation,
        });
      }
    });
  };

  // Next/prev image functions
  const nextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };
  const prevImage = () => {
    if (!product) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

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
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    } finally {
      setIsSharing(false);
    }
  };

  if (!product && !isPageLoading) {
    return <NotFound />;
  }

  if (isPageLoading) {
    return <LoadingSkeloton />;
  }

  return (
    <>
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
            <div
              className="relative aspect-square mb-4 cursor-crosshair"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              {product && (
                <div className="relative flex justify-center items-center aspect-square overflow-hidden rounded-2xl bg-white ">
                  {/* Main Image */}
                  {product?.images?.[currentImageIndex] ? (
                    <Image
                      src={product.images[currentImageIndex]}
                      alt={`${product.name} - View ${currentImageIndex + 1}`}
                      className="object-cover "
                      fill
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}

                  {/* Navigation arrows */}
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
                product?.images.length > 1 &&
                product.images.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg ${
                      currentImageIndex === index
                        ? "ring-1 ring-[#184193]/50  ring-offset-2"
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
                      backgroundImage: `url(${product.images[0]})`,
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
              <div className="hidden  md:flex flex-col md:flex-row gap-5 md:gap-0 md:items-center justify-between mb-4">
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

              {product?.variations && product?.variations.length > 0 && (
                <div className="pt-5">
                  <h3 className="font-medium mb-4">Variation</h3>
                  <div className=" grid gap-4 md:h-80 md:overflow-y-auto">
                    {product.variations.map((variation) => (
                      <div
                        key={variation.variation}
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
                                  variation.variation,
                                  false
                                )
                              }
                              className="px-3 py-2 text-xl"
                            >
                              -
                            </button>
                            <span className="px-4">
                              {variationInCart.find(
                                (v) => v.variation === variation.variation
                              )?.variationQuantityInCart || 0}
                            </span>
                            <button
                              onClick={() =>
                                handleVariationQuantityChange(
                                  variation.variation,
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
                    ))}
                  </div>
                </div>
              )}

              {
                <p className="text-[#184193] text-base font-medium truncate py-8">
                  {product?.variations && product?.variations.length
                    ? selectedVariation?.quantity
                    : product?.stock_quantity}{" "}
                  product available
                </p>
              }

              {product?.variations && product.variations.length > 0 ? (
                <ActionButton
                  variant={isAdded ? "outline" : "primary"}
                  fullWidth
                  isCart
                  onClick={handleAddAllVariationsToCart}
                  className="w-full md:max-w-96"
                >
                  {isAdded ? "CLEAR CART" : "ADD TO CART"}
                </ActionButton>
              ) : (
                <div className="flex gap-4">
                  <div className="flex w-45 items-center bg-[#F4F4F4] rounded-xl ">
                    <button
                      onClick={() =>
                        handleQuantityChange(product?.productId || "", false)
                      }
                      className="px-4 py-3 text-2xl"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center">{cartQuantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(product?.productId || "", true)
                      }
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

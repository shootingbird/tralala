"use client";

import { useRef, useState } from "react";
import { useEffect } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Heart, Loader2, Share2 } from "lucide-react";
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
}
export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const [selectedVariant, setSelectedVariant] = useState("500");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProducts] = useState<Product>();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [magnifyPosition, setMagnifyPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const isMobile = useIsMobile();
  const enterTimeout = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeout = useRef<NodeJS.Timeout | null>(null);

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
    setIsWishlisted(isInWishlist(productId));
  }, [productId, isInWishlist]);
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
  const {
    addToCart,
    isInCart,
    removeFromCart,
    updateQuantity: updateQuantity,
    cartItems,
  } = useCart();

  const [cartQuantity, setCartQuantity] = useState(1);
  console.log(cartItems);

  useEffect(() => {
    const itemInCart = cartItems.find((item) => item.productId == productId);
    console.log(itemInCart);

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

  const [isSharing, setIsSharing] = useState(false);

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
    return <div>Product not found</div>;
  }

  if (isPageLoading) {
    return (
      <>
        <TopBanner theme="dark" />
        <Header />
        <main className="container mx-auto px-4 pt-8 pb-[5rem]">
          <div className="animate-pulse">
            <div className="h-6 w-64 bg-gray-200 rounded mb-8" />

            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-2/5">
                <div className="relative aspect-square mb-4 bg-gray-200 rounded-lg" />
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-200 rounded-lg"
                    />
                  ))}
                </div>
              </div>

              <div className="md:w-3/5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="w-32 h-6 bg-gray-200 rounded" />
                  <div className="flex gap-4">
                    {[1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="w-10 h-10 bg-gray-200 rounded-xl"
                      />
                    ))}
                  </div>
                </div>

                <div className="h-8 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/4 bg-gray-200 rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded" />
                </div>

                <div className="h-8 w-1/3 bg-gray-200 rounded" />

                <div>
                  <div className="h-6 w-48 bg-gray-200 rounded mb-4" />
                  <div className="flex gap-4">
                    {[1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="w-24 h-10 bg-gray-200 rounded-full"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <div className="w-32 h-12 bg-gray-200 rounded-xl" />
                  <div className="flex-1 h-12 bg-gray-200 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
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
          <div className="md:w-2/5">
            <div
              className="relative aspect-square mb-4 cursor-crosshair"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              {product && (
                <Image
                  src={product.images[0]}
                  alt={product.title || "Product Image"}
                  fill
                  className="object-cover rounded-lg"
                />
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product &&
                product.images.slice(0, 3).map((image, index) => (
                  <div key={index} className="relative aspect-square">
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
            <div className="md:w-3/5 md:h-[30rem] overflow-hidden">
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
            <div className="md:w-3/5">
              <div className="flex flex-col md:flex-row gap-5 md:gap-0 md:items-center justify-between mb-4">
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
              <p className="text-gray-600 mb-8 leading-relaxed line-clamp-5">
                {product?.description}
              </p>

              <p className="text-2xl font-semibold mb-8">
                NGN {product?.price.toLocaleString()}.00
              </p>

              {/* <div className="mb-8">
                            <h3 className="font-medium mb-4">Choose your variation</h3>
                            <div className="flex gap-4">
                                {['400', '500', '600'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedVariant(size)}
                                        className={`w-24 py-2 rounded-full border ${selectedVariant === size
                                            ? 'border-[#184193] bg-[#184193] text-white'
                                            : 'border-gray-200'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div> */}

              <div className="flex gap-4">
                <div className="flex w-45 items-center bg-[#F4F4F4] rounded-xl ">
                  <button
                    onClick={() =>
                      handleQuantityChange(product?.productId || "", false)
                    }
                    className="px-4 py-3 text-lg"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center">{cartQuantity}</span>
                  <button
                    onClick={() =>
                      handleQuantityChange(product?.productId || "", true)
                    }
                    className="px-4 py-3 text-lg"
                  >
                    +
                  </button>
                </div>
                <ActionButton
                  variant={isAdded ? "outline" : "primary"}
                  fullWidth
                  isCart
                  onClick={handleAddToCart}
                >
                  {isAdded ? "CLEAR CART" : "ADD TO CART"}
                </ActionButton>
              </div>
            </div>
          )}
        </div>

        {product && <ProductTabs product={product} />}
      </main>
      <Footer />
    </>
  );
}

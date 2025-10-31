import { useState } from "react";

import { IoCheckmark } from "react-icons/io5";
import { ProductReviews } from "./ProductReviews";
interface Product {
  productId: string;
  name: string;
  brand: string;
  price: number;
  rating: number | 0;
  image: string;
  images: string[];
  isNew?: boolean;
  dateCreated: string;
  dateUpdated: string;
  stock: number;
  category: string;
  totalSold: number;
  specifications?: Array<{ key: string; value: string }>;
  highlights?: string[];
  whats_in_box?: string[];
  description?: string;
  discount?: {
    amount: number;
    percentage: number;
  };
}

interface ProductTabsProps {
  product: Product;
}

export const ProductTabs = ({ product }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState<"description" | "reviews">(
    "description"
  );

  return (
    <div className="mt-16">
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-4 font-medium ${
              activeTab === "description"
                ? "text-[#E94B1C] border-b-2 border-[#E94B1C]"
                : "text-gray-500"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 font-medium ${
              activeTab === "reviews"
                ? "text-[#E94B1C] border-b-2 border-[#E94B1C]"
                : "text-gray-500"
            }`}
          >
            Reviews
          </button>
        </nav>
      </div>

      <div className="py-8">
        {activeTab === "description" ? (
          <div className="space-y-8">
            <div className="mb-8">
              <h3 className="font-medium mb-4">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {product.specifications && product.specifications.length > 0 && (
              <div className="mb-8">
                <h3 className="font-medium mb-4">Specifications</h3>
                <div className="space-y-4">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex items-center gap-5">
                      <div className="bg-[#E7F4FC] rounded-full flex justify-center items-center h-5 w-5">
                        <IoCheckmark color="#164C96" className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-medium">{spec.key}: </span>
                        <span className="text-gray-600">{spec.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.highlights && product.highlights.length > 0 && (
              <div className="mb-8">
                <h3 className="font-medium mb-4">Highlights</h3>
                <div className="space-y-4">
                  {product.highlights.map((highlight, index) => {
                    const parts = highlight.match(/^([^:;]+)([:;])\s*(.*)$/);

                    return (
                      <div key={index} className="flex gap-2">
                        {parts ? (
                          <div className="flex gap-3 items-center">
                            <div className="bg-[#E7F4FC] rounded-full flex justify-center items-center h-5 w-5">
                              <IoCheckmark
                                color="#164C96"
                                className="h-5 w-5"
                              />
                            </div>
                            <span className="font-medium">
                              {parts[1] + parts[2]}
                            </span>
                            {/* normal remainder */}
                            <span className="text-gray-600">{parts[3]}</span>
                          </div>
                        ) : (
                          <span className="text-gray-800">{highlight}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {product.whats_in_box && product.whats_in_box.length > 0 && (
              <div className="mb-8">
                <h3 className="font-medium mb-4">What&apos;s in the Box</h3>
                <ul className="list-disc list-inside space-y-2">
                  {product.whats_in_box.map((item, index) => (
                    <li
                      key={index}
                      className="text-gray-600 font-medium flex gap-3 items-center"
                    >
                      <div className="bg-[#E7F4FC] rounded-full flex justify-center items-center h-5 w-5">
                        <IoCheckmark color="#164C96" className="h-5 w-5" />
                      </div>

                      <span> {item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <ProductReviews productId={product.productId} />
        )}
      </div>
    </div>
  );
};

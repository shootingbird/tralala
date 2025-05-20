import { useState } from 'react';
import { ProductReviews } from './ProductReviews';

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
    highlights?: Array<{ key: string; value: string }>;
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
    const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

    return (
        <div className="mt-16">
            <div className="border-b border-gray-200">
                <nav className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('description')}
                        className={`pb-4 font-medium ${activeTab === 'description'
                            ? 'text-[#184193] border-b-2 border-[#184193]'
                            : 'text-gray-500'
                            }`}
                    >
                        Description
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`pb-4 font-medium ${activeTab === 'reviews'
                            ? 'text-[#184193] border-b-2 border-[#184193]'
                            : 'text-gray-500'
                            }`}
                    >
                        Reviews
                    </button>
                </nav>
            </div>

            <div className="py-8">
                {activeTab === 'description' ? (
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
                                        <div key={index} className="flex gap-5">
                                            <span className="font-medium">{spec.key}</span>
                                            <span className="text-gray-600">-</span>
                                            <span className="text-gray-600">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.highlights && product.highlights.length > 0 && (
                            <div className="mb-8">
                                <h3 className="font-medium mb-4">Highlights</h3>
                                <div className="space-y-4">
                                    {product.highlights.map((highlight, index) => (
                                        <div key={index} className="flex gap-5">
                                            <span className="font-medium">{highlight.key}</span>
                                            <span className="text-gray-600">-</span>
                                            <span className="text-gray-600">{highlight.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.whats_in_box && product.whats_in_box.length > 0 && (
                            <div className="mb-8">
                                <h3 className="font-medium mb-4">What&apos;s in the Box</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    {product.whats_in_box.map((item, index) => (
                                        <li key={index} className="text-gray-600">{item}</li>
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
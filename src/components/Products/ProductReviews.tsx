import { StarRating } from '../ui/StarRating';
import { useState } from 'react';
import { WriteReview } from './WriteReview';

interface ReviewProps {
    author: string;
    initials: string;
    rating: number;
    content: string;
}

const reviews: ReviewProps[] = [
    {
        author: "Sofia Harvetz",
        initials: "SH",
        rating: 4,
        content: "The lightening is versatile and energy-efficient. I opted for warm white LED bulbs, which give off a relaxing glow, perfect for unwinding at night. Installation took some time, but the final look was worth every second. This chandelier is a true showstopper and I can't recommend it enough."
    },
    {
        author: "Nicolas Jensen",
        initials: "NJ",
        rating: 4,
        content: "What stood out for me the most was the quality of the materials. The frame is made of durable metal material, and the crystals are thick, catching the light in the most beautiful way. I also love that it comes with adjustable chain length, so I was able to customise how it hangs from the ceiling."
    },
    {
        author: "Montana Jackson",
        initials: "MJ",
        rating: 4,
        content: "I bought a chandelier for my hotel and it instantly elevated the lobby's experience. The Crystal chandelier offers the perfect balance of functionality and functionality. The metal frame is sturdy and the crystal detailing gives it a sophisticated charm."
    },
    {
        author: "Stan Nicolas",
        initials: "SN",
        rating: 4,
        content: "I purchased this chandelier for my dining room and I am beyond satisfied. the craftsmanship is excellent, and the crystals reflect light beautifully, creating a dazzling effect in the evenings. The size is just right, not too overpowering but large enough to make a statement."
    },
    {
        author: "Ray Michael",
        initials: "RM",
        rating: 4,
        content: "I was hesitant about ordering a chandelier online, but this LuxeGlow Crystal Chandelier blew me away. From the moment I opened the box I could tell this was a high quality piece. The crystals are heavy and well crafted, not the cheap plastic ones you find in the lower end models. The gold-finished frame adds a touch of elegance and once installed, the entire fixture became the focal point of my living room."
    }
];

export const ProductReviews = ({ productId }: { productId: string }) => {
    const [showWriteReview, setShowWriteReview] = useState(false);
    console.log(productId)

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold">All Reviews</h2>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Latest
                    </button>
                    <button
                        onClick={() => setShowWriteReview(true)}
                        className="px-4 py-2 bg-[#184193] text-white rounded-lg text-sm"
                    >
                        Write a Review
                    </button>
                </div>
            </div>

            {showWriteReview && (
                <div className="mb-8">
                    <WriteReview
                        onClose={() => setShowWriteReview(false)}
                        onSubmit={(review: { rating: number; content: string }) => {
                            // Handle review submission
                            console.log(review);
                            setShowWriteReview(false);
                        }}
                    />
                </div>
            )}

            <div className="space-y-6">
                {reviews.map((review, index) => (
                    <div key={index} className="pb-6 border-b border-[#E8ECEF] last:border-b-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-15 h-15 bg-[#F4F4F4] rounded-full flex items-center justify-center text-sm">
                                {review.initials}
                            </div>
                            <div>
                                <h3 className="font-medium text-[15px] mb-0.5">{review.author}</h3>
                                <StarRating rating={review.rating} />
                            </div>
                        </div>
                        <p className="text-[15px] text-[#151515] leading-relaxed mt-3">
                            {review.content}
                        </p>
                        <div className="flex gap-6 mt-3">
                            <button className="text-xs font-bold text-[#151515]">Like</button>
                            <button className="text-xs font-bold text-[#151515]">Reply</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
'use client';

interface OutlinedStarRatingProps {
    rating: number | 0;
}

export const StarRating = ({ rating }: OutlinedStarRatingProps) => {
    // Ensure rating is a stable number between 1-5
    const normalizedRating = Math.max(1, Math.min(5, Math.floor(rating)));
    const stars = [1, 2, 3, 4, 5];
    
    return (
        <div className="flex items-center">
            {stars.map((star) => (
                <svg
                    key={star}
                    className={`w-4 md:w-5 h-4 md:h-5 ${
                        star <= normalizedRating ? 'text-[#E2A03F]' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                </svg>
            ))}
        </div>
    );
};
import { useState } from 'react';
import { StarRating } from '../ui/StarRating';

interface WriteReviewProps {
    onClose: () => void;
    onSubmit: (review: { title: string; content: string; rating: number }) => void;
}

export const WriteReview = ({ onClose, onSubmit }: WriteReviewProps) => {
    const [rating, setRating] = useState(4);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');


    return (
        <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-6">Write a Review</h2>

            <div className="mb-6">
                <StarRating
                    rating={rating}
                // onChange={setRating}
                />
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm mb-2">Review Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Great Products"
                        className="w-full px-4 py-2 border border-[#E8ECEF] rounded-lg focus:outline-none focus:border-[#184193]"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-2">Review Content</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="I bought it 3 weeks ago and now came back just to say 'Awesome Product'. I really enjoy it."
                        rows={4}
                        className="w-full px-4 py-2 border border-[#E8ECEF] rounded-lg focus:outline-none focus:border-[#184193] resize-none"
                    />
                </div>

                <button
                    onClick={() => {
                        onSubmit({ title, content, rating });
                        setRating(5); onClose();
                    }}
                    className="w-full bg-[#184193] text-white py-3 rounded-lg font-medium"
                >
                    Submit Review
                </button>
            </div>
        </div >
    );
};
// 'use client';

// import { useState } from 'react';
// import Image from 'next/image';
// import { TopBanner } from '@/components/layout/TopBanner';
// import { Header } from '@/components/layout/Header';
// import { Footer } from '@/components/layout/Footer';
// import { Breadcrumb } from '@/components/ui/Breadcrumb';
// import { Button } from '@/components/ui/Button';
// import { Minus, Plus } from 'lucide-react';
// import { StarRating } from '@/components/ui/StarRating';
// import { useWishlist } from '@/context/WishlistContext';

// export default function WishlistPage() {
//     const { wishlist, removeFromWishlist } = useWishlist();
//     const [selectedItems, setSelectedItems] = useState<string[]>([]);
//     const breadcrumbItems = [
//         { label: 'Home', href: '/' },
//         { label: 'Wishlist' }
//     ];

//     const handleSelectItem = (productId: string) => {
//         setSelectedItems(prev =>
//             prev.includes(productId)
//                 ? prev.filter(item => item !== productId)
//                 : [...prev, productId]
//         );
//     };

//     const handleSelectAll = () => {
//         setSelectedItems(
//             selectedItems.length === wishlist.length
//                 ? []
//                 : wishlist.map(item => item.productId)
//         );
//     };

//     const handleDeleteSelected = () => {
//         selectedItems.forEach((id) => removeFromWishlist(id));
//         setSelectedItems([]);
//     };

//     const [quantities, setQuantities] = useState<Record<string, number>>(() => {
//         const initialQuantities: Record<string, number> = {};
//         wishlist.forEach(item => {
//             initialQuantities[item.productId] = 1;
//         });
//         return initialQuantities;
//     });

//     const updateQuantity = (productId: string, increment: boolean) => {
//         setQuantities(prev => ({
//             ...prev,
//             [productId]: Math.max(1, (prev[productId] || 1) + (increment ? 1 : -1))
//         }));
//     };
//     return (
//         <>
//             <TopBanner theme="dark" />
//             <Header />
//             <main className="container mx-auto px-4 py-8">
//                 <Breadcrumb items={breadcrumbItems} className="mb-6" />
//                 {wishlist.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center py-16 px-4">
//                         <div className="relative w-[200px] h-[200px] mb-6">
//                             <Image
//                                 src="/empty-wishlist.png"
//                                 alt="Empty Wishlist"
//                                 fill
//                                 priority
//                                 className="object-contain"
//                             />
//                         </div>
//                         <h2 className="text-2xl font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
//                     </div>
//                 ) : (
//                     <>
//                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//                             <h1 className="text-xl md:text-2xl font-medium">Wishlist</h1>
//                             <div className="flex flex-wrap items-center gap-4 md:gap-6">
//                                 <label className="flex items-center gap-2">
//                                     <input
//                                         type="checkbox"
//                                         checked={selectedItems.length === wishlist.length}
//                                         onChange={handleSelectAll}
//                                         className="w-4 h-4 rounded border-gray-300"
//                                     />
//                                     <span className="text-sm">Select all</span>
//                                 </label>
//                                 <button
//                                     onClick={handleDeleteSelected}
//                                     className="text-sm text-[#184193] hover:text-[#184193]/80"
//                                     disabled={selectedItems.length === 0}
//                                 >
//                                     Delete Selected
//                                 </button>
//                             </div>
//                         </div>
//                         <div className="space-y-6">
//                             {wishlist.map((item) => (
//                                 <div key={item.productId} className="bg-white p-0 md:p-6 rounded-xl">
//                                     <div className="flex gap-4 md:gap-6">
//                                         <div className="flex relative items-center gap-4">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={selectedItems.includes(item.productId)}
//                                                 onChange={() => handleSelectItem(item.productId)}
//                                                 id={'check+' + item.productId}
//                                                 className="w-4 h-4 mt-2 absolute top-0 left-2 md:relative md:left-0 z-5"
//                                             />
//                                             <div className="relative w-[120px] md:w-[250px] h-full shrink-0">
//                                                 <label htmlFor={'check+' + item.productId}>
//                                                     <Image
//                                                         src={item.image}
//                                                         alt={item.title}
//                                                         fill
//                                                         sizes="(max-width: 768px) 120px, 250px"
//                                                         className="object-cover rounded-lg"
//                                                         priority
//                                                     />
//                                                 </label>
//                                             </div>
//                                         </div>
//                                         <div className="flex-1 min-w-0">
//                                             <div className="flex items-start gap-2 mb-2">
//                                                 <StarRating rating={item.rating} />
//                                                 <span className="text-sm text-gray-500">{item.rating} Reviews</span>
//                                             </div>
//                                             <h3 className="text-base md:text-lg font-medium mb-1 line-clamp-2">{item.title}</h3>
//                                             <p className="text-sm text-gray-500 mb-2">{item.category}</p>
//                                              <p className="text-lg md:text-xl font-medium mb-4 md:mb-6">NGN {item.price.toLocaleString()}.00</p>

//                                             <div className="flex flex-col md:flex-row gap-4 md:justify-end">
//                                                 <div className="flex items-center justify-between gap-4 w-full md:w-[8rem] bg-[#F5F5F5] px-4 py-2 rounded-lg">
//                                                     <button onClick={() => updateQuantity(item.productId, false)}>
//                                                         <Minus size={16} />
//                                                     </button>
//                                                     <span>{quantities[item.productId]}</span>
//                                                     <button onClick={() => updateQuantity(item.productId, true)}>
//                                                         <Plus size={16} />
//                                                     </button>
//                                                 </div>
//                                                 <Button className="w-full md:w-auto md:px-12" rounded={true}>
//                                                     ADD TO CART
//                                                 </Button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </>
//                 )}
//             </main>
//             <Footer />
//         </>
//     );
// }

import React from "react";

const page = () => {
  return <div>page</div>;
};

export default page;

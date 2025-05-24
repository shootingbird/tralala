'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Image from 'next/image';
import { TopBanner } from '@/components/layout/TopBanner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { RatingModal } from '@/components/orders/RatingModal';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface OrderActivity {
    message: string;
    date: string;
}

interface OrderProduct {
    id: string;
    product_id: string;
    name: string;
    image?: string;
    price: number;
    quantity: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    product?: any; // From API response
}

interface OrderStage {
    label: string;
    status: 'completed' | 'current' | 'upcoming';
}

interface Order {
    id: string;
    user_id: string;
    cart: OrderProduct[];
    status: string;
    address: string;
    name: string;
    phone_number: string;
    total_amount: number;
    payment_status: string;
    notes: string;
    created_at: string;
    updated_at: string;
}


type Params = { id: string };

export default function OrderDetailsPage({ params }: { params: Promise<Params> }) {
    const { id } = use(params) as Params;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Orders', href: '/orders' },
        { label: 'Order Details' }
    ];

    // Map order status to stages
    const getOrderStages = (status: string): OrderStage[] => {
        const allStages = [
            { label: 'Order Placed', status: 'upcoming' },
            { label: 'Processing', status: 'upcoming' },
            { label: 'Shipped', status: 'upcoming' },
            { label: 'Arrived', status: 'upcoming' },
            { label: 'Delivered', status: 'upcoming' }
        ];

        // Map the backend status to our frontend stages
        const stageMap: { [key: string]: number } = {
            'placed': 0,
            'processing': 1,
            'shipped': 2,
            'arrived': 3,
            'delivered': 4
        };

        const currentStageIndex = stageMap[status.toLowerCase()] || 0;

        return allStages.map((stage, index) => {
            if (index < currentStageIndex) {
                return { ...stage, status: 'completed' as const };
            } else if (index === currentStageIndex) {
                return { ...stage, status: 'current' as const };
            } else {
                return { ...stage, status: 'upcoming' as const };
            }
        });
    };

    // Generate order activities based on order status and timestamps
    const getOrderActivities = (order: Order): OrderActivity[] => {
        const activities: OrderActivity[] = [];
        const createdDate = new Date(order.created_at);
        const formattedCreatedDate = formatDateTime(createdDate);

        // Add activities based on order status
        switch (order.status.toLowerCase()) {
            case 'delivered':
                activities.push({
                    message: "Your order has been delivered. Thank you for shopping at Steadfast International!",
                    date: formatDateTime(new Date())
                });
            // Fall through to add previous activities
            case 'arrived':
                activities.push({
                    message: "Your order has arrived at the pickup location and is ready for collection.",
                    date: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 5)) // 5 hours ago
                });
            // Fall through
            case 'shipped':
                activities.push({
                    message: "Your order has been shipped.",
                    date: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)) // 2 days ago
                });
            // Fall through
            case 'processing':
                activities.push({
                    message: "Your order is successfully processed.",
                    date: formatDateTime(new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)) // 3 days ago
                });
            // Fall through
            default:
                activities.push({
                    message: "Your order has been confirmed.",
                    date: formattedCreatedDate
                });
        }

        return activities.reverse(); // Newest first
    };

    // Format date for display
    const formatDateTime = (date: Date): string => {
        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };
        return date.toLocaleDateString('en-US', options);
    };
    const { getToken } = useAuth();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = await getToken();
                if (!token) {
                    setError('Authentication required');
                    return;
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch order');
                }

                const data = await response.json();
                setOrder(data.order);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch order');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const handleRatingSubmit = async (rating: number, comment: string) => {
        console.log('Rating submitted:', { rating, comment, orderId: id });
    };

    if (loading) {
        return <div className="container mx-auto px-4 py-8 text-center">Loading order details...</div>;
    }

    if (error) {
        return <div className="container mx-auto px-4 py-8 text-center text-red-500">Error: {error}</div>;
    }

    if (!order) {
        return <div className="container mx-auto px-4 py-8 text-center">Order not found</div>;
    }

    const orderStages = getOrderStages(order.status);
    const orderActivities = getOrderActivities(order);
    const formattedCreatedDate = formatDateTime(new Date(order.created_at));
    const expectedArrivalDate = new Date(new Date(order.created_at).getTime() + 6 * 24 * 60 * 60 * 1000); // Estimate 6 days after order placement
    const formattedExpectedDate = formatDateTime(expectedArrivalDate);

    // Calculate total items in the order
    const totalItems = order.cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <TopBanner theme="dark" />
            <Header />
            <main className="container mx-auto px-4 py-8">
                <Breadcrumb items={breadcrumbItems} className="mb-6" />

                <div className="bg-white rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-medium h-full">Order Details</h1>
                        <div className="">
                            <Button
                                variant="outline"
                                onClick={() => setIsRatingModalOpen(true)}
                                className="text-[#184193] flex items-center gap-1"
                                rounded={true}
                            >
                                Leave a Rating
                                <Plus className='text-[#184193] w-5 h-5' />
                            </Button>
                        </div>
                    </div>

                    <div className="bg-[#F8F9FA] rounded-lg p-6 mb-8">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-medium">#{order.id}</h2>
                                <p className="text-sm text-gray-500">{totalItems} Products • Order Placed on {formattedCreatedDate}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[#184193] text-xl font-semibold">NGN {order.total_amount.toLocaleString()}</p>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6">Order expected arrival {formattedExpectedDate}</p>

                        <div className="relative">
                            <div className="relative">
                                {/* Base line */}
                                <div className="absolute top-3 left-8 right-8 h-[2px] bg-[#E5E9F2] -z-10" />

                                <div className="flex justify-between mb-4 relative z-10">
                                    {orderStages.map((stage, index) => (
                                        <div key={index} className="flex flex-col items-center">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-2 
                                                ${stage.status === 'completed'
                                                    ? 'bg-[#184193] text-white'
                                                    : 'border bg-white border-[#184193]'}`}
                                            >
                                                {stage.status === 'completed' ? (
                                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M20 6L9 17l-5-5" />
                                                    </svg>
                                                ) : (
                                                    <div className="w-1.5 h-1.5 bg-[#184193] rounded-full"></div>
                                                )}
                                            </div>
                                            <span className="text-xs">{stage.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute top-3 left-8 right-8 h-[4px] bg-[#E5E9F2]" />
                            <div
                                className="absolute top-3 left-8 h-[4px] bg-[#184193]"
                                style={{
                                    width: `calc(${((orderStages.findIndex(stage => stage.status === 'current') + 1) / (orderStages.length - 1)) * 100}% - 12px)`
                                }}
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-lg font-medium mb-4">Order Activity</h2>
                        <div className="space-y-4">
                            {orderActivities.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3 bg-[#F8F9FA] p-4 rounded-lg">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm">{activity.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-lg font-medium mb-4">Product ({order.cart.length.toString().padStart(2, '0')})</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#F8F9FA] text-sm">
                                    <tr>
                                        <th className="text-left py-3 px-4">PRODUCTS</th>
                                        <th className="text-right py-3 px-4">PRICE</th>
                                        <th className="text-right py-3 px-4">QUANTITY</th>
                                        <th className="text-right py-3 px-4">SUB TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.cart.map((item) => {
                                        const product = item.product || {};
                                        console.log(product)
                                        const imageUrl = (() => {
                                            const raw = product.image_urls;
                                            try {
                                                const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
                                                return parsed?.[0] || "/404.png";
                                            } catch {
                                                return "/404.png";
                                            }
                                        })();
                                        const productName = item.name || product.name || 'Product';
                                        const productPrice = item.price || product.price || 0;

                                        return (
                                            <tr key={item.id || item.product_id} className="border-b">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative w-16 h-16">
                                                            <Image
                                                                src={imageUrl}
                                                                alt={productName}
                                                                fill
                                                                className="object-cover rounded"
                                                            />
                                                        </div>
                                                        <div className="text-sm">{productName}</div>
                                                    </div>
                                                </td>
                                                <td className="text-right py-4 px-4">NGN {productPrice.toLocaleString()}</td>
                                                <td className="text-right py-4 px-4">x{item.quantity}</td>
                                                <td className="text-right py-4 px-4">NGN {(productPrice * item.quantity).toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="font-medium mb-3">Shipping Address</h3>
                            <div className="bg-[#F8F9FA] p-4 rounded-lg">
                                <p className="font-medium mb-2">{order.name}</p>
                                <p className="text-sm text-gray-600">{order.address}</p>
                                <p className="text-sm text-gray-600 mt-2">
                                    <span className="font-medium">Phone Number:</span> {order.phone_number}
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium mb-3">Pick up Point</h3>
                            <div className="bg-[#F8F9FA] p-4 rounded-lg">
                                <p className="font-medium mb-2">The Young Shall Grow</p>
                                <p className="text-sm text-gray-600">2 Market Rd, Ogui Rd, Enugu</p>
                                <p className="text-sm text-gray-600 mt-2">
                                    <span className="font-medium">Phone Number:</span> +234 8070001981
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Email:</span> contact@tys.com
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium mb-3">Order Notes</h3>
                            <div className="bg-[#F8F9FA] p-4 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    {order.notes || 'No notes provided for this order.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <RatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                onSubmit={handleRatingSubmit}
            />
        </>
    );
}
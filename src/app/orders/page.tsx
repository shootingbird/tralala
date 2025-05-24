'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { TopBanner } from '@/components/layout/TopBanner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface OrderItem {
    id: string;
    user_id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any    
    cart: any;
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

export default function OrdersPage() {
    const { getToken } = useAuth();
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = await getToken();


                const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/user`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!orderRes.ok) return;

                const orderData = await orderRes.json();
                console.log(orderData);

                setOrders(orderData.orders);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [getToken]);

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Profile', href: '/profile' },
        { label: 'Order History' }
    ];

    const getStatusColor = (status: string) => {
        if (status.includes('Delivered')) return 'text-[#037847]';
        if (status.includes('Shipped')) return 'text-gray-700';
        if (status.includes('Cancelled')) return 'text-[#FF4B4B]';
        return 'text-gray-700';
    };

    return (
        <>
            <TopBanner theme="dark" />
            <Header />
            <main className="container mx-auto px-4 py-8">
                <Breadcrumb items={breadcrumbItems} className="mb-6" />

                {loading ? (
                    <div className="text-center text-gray-500 py-20">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="relative w-[200px] h-[200px] mb-6">
                            <Image
                                src="/404.png"
                                alt="Empty Orders"
                                fill
                                priority
                                className="object-contain"
                            />
                        </div>
                        <h2 className="text-2xl font-medium text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-500 mb-6">Browse our products and start shopping</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-medium">Orders</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Showing {orders.length} Result{orders.length > 1 ? 's' : ''}</span>
                                <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white">
                                    <option>All</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {orders.map((order) => {
                                const imageUrl = (() => {
                                    const raw = order.cart[0]?.product?.image_urls;
                                    try {
                                        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
                                        return parsed?.[0] || "/404.png";
                                    } catch {
                                        return "/404.png";
                                    }
                                })();
                                console.log(imageUrl);
                                return (
                                    <div key={order.id} className="bg-white py-5 border-b border-[#E8ECEF] flex gap-6">
                                        <div className="relative w-[166px] h-[166px] shrink-0">
                                            <Image
                                                src={imageUrl}
                                                alt={`Order ${order.id}`}
                                                fill
                                                className="object-cover rounded-lg"
                                                priority
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between pb-[1rem]">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-semibold">
                                                        Order ID #{order.id} ({order.cart.length} Products)
                                                    </h3>
                                                    <p className="text-sm text-[#15151570] mt-2">
                                                        Placed on {new Date(order.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    className="text-[#184193] hover:text-blue-700 font-semibold text-sm"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                            <p className={`mt-6 text-sm font-medium ${getStatusColor(order.status)}`}>• {order.status}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </main>
            <Footer />
        </>
    );
}
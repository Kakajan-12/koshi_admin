"use client";

import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import Link from "next/link";
import Image from "next/image";

interface CartItem {
    id: number;
    product_name: string;
    price: number;
    quantity: number;
    main_image?: string;
    variantName?: string;
    custom_message?: string | null;
}

// Тип для возможных альтернативных полей с сообщением
type CartItemWithAlternatives = CartItem & {
    customMessage?: string | null;
    message?: string | null;
};

interface OrderData {
    cart: CartItem[];
    orderType?: string;
    selectedAddress?: string;
    deliveryFee?: number;
    customMessageFee?: number;
    guest_info?: {
        name: string;
        phone: string;
        email: string;
        address?: string | null;
    };
}

interface Order {
    id: number;
    user_id: number | null;
    email: string | null;
    fname: string | null;
    lname: string | null;
    phone: string | null;
    total: number | string;
    status: string;
    createdAt: string;
    order_data: OrderData;
    is_guest: boolean;
    guest_name: string | null;
    guest_email: string | null;
    guest_phone: string | null;
    guest_address: string | null;
}

const OrderDetail = () => {
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                router.push("/admin/login");
                return;
            }

            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders/${params.id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!res.ok) throw new Error("Failed to fetch order");

                const data = await res.json();

                console.log("📦 Raw order data:", data);
                console.log("👤 is_guest:", data.is_guest);
                console.log("👤 guest_name:", data.guest_name);
                console.log("👤 guest_email:", data.guest_email);
                console.log("👤 guest_phone:", data.guest_phone);
                console.log("📦 Cart:", data.order_data?.cart);

                if (typeof data.order_data === "string") {
                    try {
                        data.order_data = JSON.parse(data.order_data);
                    } catch {
                        console.warn("⚠️ Could not parse order_data JSON");
                    }
                }

                setOrder(data);
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [params.id, router]);

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "Invalid Date";
        }
    };

    // Функция для получения custom_message без использования any
    const getItemCustomMessage = (item: CartItem): string | null => {
        // Прямое поле
        if (item.custom_message) return item.custom_message;

        // Проверяем другие возможные поля через приведение типа
        const itemWithAlternatives = item as CartItemWithAlternatives;

        if (itemWithAlternatives.customMessage) return itemWithAlternatives.customMessage;
        if (itemWithAlternatives.message) return itemWithAlternatives.message;

        return null;
    };

    if (loading) return <div className="p-10 text-lg">Loading order details...</div>;

    if (error || !order) {
        return (
            <div className="p-10">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error || "Order not found"}
                </div>
                <Link
                    href="/admin/orders"
                    className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back to Orders
                </Link>
            </div>
        );
    }

    const { cart, orderType, selectedAddress, deliveryFee, customMessageFee } =
    order.order_data || {};

    const itemsWithMessages = cart?.filter(item => getItemCustomMessage(item)) || [];
    const hasCustomMessages = itemsWithMessages.length > 0;

    // Определяем данные клиента в зависимости от типа заказа
    const customerInfo = order.is_guest ? {
        name: order.guest_name || order.order_data?.guest_info?.name || 'Guest',
        email: order.guest_email || order.order_data?.guest_info?.email,
        phone: order.guest_phone || order.order_data?.guest_info?.phone,
        address: order.guest_address || order.order_data?.guest_info?.address || selectedAddress
    } : {
        name: `${order.fname || ''} ${order.lname || ''}`.trim() || 'Customer',
        email: order.email,
        phone: order.phone,
        address: selectedAddress
    };

    return (
        <div className="container mx-auto">
            <div className="flex bg-gray-200 min-h-screen">
                <Sidebar/>
                <div className="flex-1 p-10 ml-62">
                    <TokenTimer/>

                    <div className="mt-8">
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">Order #{order.id}</h1>
                                    <p className="text-gray-600">{formatDate(order.createdAt)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {order.is_guest && (
                                        <span className="px-4 py-2 rounded-lg bg-purple-100 text-purple-800 text-lg font-semibold">
                                            Guest
                                        </span>
                                    )}
                                    <span
                                        className={`px-4 py-2 rounded-lg text-white text-lg font-semibold ${
                                            order.status?.toLowerCase() === "paid"
                                                ? "bg-green-600"
                                                : order.status?.toLowerCase() === "pending"
                                                    ? "bg-yellow-500"
                                                    : "bg-gray-500"
                                        }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-lg mb-3">
                                        {order.is_guest ? '👤 Guest Information' : '👥 Customer Information'}
                                    </h3>
                                    <p className="mb-2">
                                        <span className="font-medium">Name:</span>{" "}
                                        {customerInfo.name || 'N/A'}
                                    </p>
                                    <p className="mb-2">
                                        <span className="font-medium">Email:</span>{" "}
                                        {customerInfo.email ? (
                                            <a href={`mailto:${customerInfo.email}`} className="text-blue-600 hover:underline">
                                                {customerInfo.email}
                                            </a>
                                        ) : 'N/A'}
                                    </p>
                                    <p className="mb-2">
                                        <span className="font-medium">Phone:</span>{" "}
                                        {customerInfo.phone ? (
                                            <a href={`tel:${customerInfo.phone}`} className="text-blue-600 hover:underline">
                                                {customerInfo.phone}
                                            </a>
                                        ) : 'N/A'}
                                    </p>
                                    {order.is_guest && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            User ID: Not registered
                                        </p>
                                    )}
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-lg mb-3">Order Details</h3>
                                    <p className="mb-2">
                                        <span className="font-medium">Type:</span>{" "}
                                        {orderType === 'delivery' ? '🚚 Delivery' : '🏪 Collection'}
                                    </p>

                                    {/* Адрес доставки */}
                                    {(orderType === 'delivery' || customerInfo.address) && (
                                        <p className="mt-2">
                                            <span className="font-medium">
                                                {orderType === 'delivery' ? 'Delivery Address:' : 'Address:'}
                                            </span><br />
                                            {customerInfo.address || selectedAddress || 'Not provided'}
                                        </p>
                                    )}

                                    {/* Детали оплаты */}
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        {deliveryFee && deliveryFee > 0 && (
                                            <p className="flex justify-between">
                                                <span className="font-medium">Delivery Fee:</span>
                                                <span>£{deliveryFee.toFixed(2)}</span>
                                            </p>
                                        )}
                                        {customMessageFee && customMessageFee > 0 && (
                                            <p className="flex justify-between">
                                                <span className="font-medium">Custom Messages Fee:</span>
                                                <span>£{customMessageFee.toFixed(2)}</span>
                                            </p>
                                        )}
                                        <p className="flex justify-between font-bold text-lg mt-2">
                                            <span>Total:</span>
                                            <span>£{Number(order.total).toFixed(2)}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-xl mb-4">Order Items</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border border-gray-200">
                                        <thead className="bg-gray-100">
                                        <tr>
                                            <th className="py-3 px-4 text-left">Product</th>
                                            <th className="py-3 px-4 text-center">Custom Message</th>
                                            <th className="py-3 px-4 text-center">Variant</th>
                                            <th className="py-3 px-4 text-center">Quantity</th>
                                            <th className="py-3 px-4 text-right">Price</th>
                                            <th className="py-3 px-4 text-right">Subtotal</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {cart?.map((item, i) => {
                                            const customMessage = getItemCustomMessage(item);

                                            return (
                                                <tr key={i} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            {item.main_image && (
                                                                <Image
                                                                    src={item.main_image}
                                                                    alt={item.product_name}
                                                                    width={60}
                                                                    height={60}
                                                                    className="rounded-md border"
                                                                />
                                                            )}
                                                            <span className="font-medium">{item.product_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {customMessage ? (
                                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                                                                <p className="text-gray-700 italic break-words">
                                                                    &ldquo;{customMessage}&rdquo;
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm italic">No message</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        {item.variantName || "-"}
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className="font-medium">{item.quantity}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        £{Number(item.price).toFixed(2)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-medium">
                                                        £{(item.quantity * item.price).toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                        <tfoot>
                                        {/* Delivery fee row */}
                                        {deliveryFee && deliveryFee > 0 && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={5} className="py-3 px-4 text-right font-medium">
                                                    Delivery Fee:
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    £{deliveryFee.toFixed(2)}
                                                </td>
                                            </tr>
                                        )}
                                        {/* Custom messages fee row */}
                                        {customMessageFee && customMessageFee > 0 && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={5} className="py-3 px-4 text-right font-medium">
                                                    Custom Messages Fee:
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    £{customMessageFee.toFixed(2)}
                                                </td>
                                            </tr>
                                        )}
                                        {/* Total row */}
                                        <tr className="bg-gray-100 font-bold">
                                            <td colSpan={5} className="py-4 px-4 text-right text-lg">
                                                Total:
                                            </td>
                                            <td className="py-4 px-4 text-right text-lg text-[#B8485B]">
                                                £{Number(order.total).toFixed(2)}
                                            </td>
                                        </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Custom Messages Summary */}
                            {hasCustomMessages && (
                                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-lg mb-3 text-blue-800">
                                        📝 Custom Messages Summary
                                    </h4>
                                    <div className="space-y-3">
                                        {cart?.map((item, i) => {
                                            const customMessage = getItemCustomMessage(item);
                                            return customMessage && (
                                                <div key={i} className="border-b border-blue-100 pb-2 last:border-0">
                                                    <p className="font-medium">
                                                        {item.product_name}
                                                        {item.variantName && ` (${item.variantName})`}
                                                        <span className="text-gray-600 ml-2">×{item.quantity}</span>
                                                    </p>
                                                    <p className="text-gray-700 ml-4 italic break-words">
                                                        &ldquo;{customMessage}&rdquo;
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Back button */}
                            <Link
                                href="/admin/orders"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 mt-4"
                            >
                                <ArrowLeftIcon className="h-5 w-5 mr-2"/>
                                Back to Orders
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
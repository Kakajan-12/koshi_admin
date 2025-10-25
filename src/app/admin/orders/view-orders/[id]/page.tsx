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
}

interface OrderData {
    cart: CartItem[];
    orderType?: string;
    selectedAddress?: string;
    deliveryFee?: number;
    customMessageFee?: number;
}

interface Order {
    id: number;
    user_id: number;
    email: string;
    fname: string;
    lname: string;
    phone: string;
    total: number | string;
    status: string;
    createdAt: string;
    order_data: OrderData;
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

                            {/* Customer Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-lg mb-3">
                                        Customer Information
                                    </h3>
                                    <p className="mb-2">
                                        <span className="font-medium">Name:</span>{" "}
                                        {order.fname} {order.lname}
                                    </p>
                                    <p className="mb-2">
                                        <span className="font-medium">Email:</span> {order.email}
                                    </p>
                                    <p>
                                        <span className="font-medium">Phone:</span>{" "}
                                        {order.phone || "N/A"}
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-lg mb-3">Delivery Details</h3>
                                    <p>
                                        <span className="font-medium">Type:</span>{" "}
                                        {orderType || "N/A"}
                                    </p>
                                    {selectedAddress && (
                                        <p className="mt-2">
                                            <span className="font-medium">Address:</span>{" "}
                                            {selectedAddress}
                                        </p>
                                    )}
                                    {deliveryFee && (
                                        <p className="mt-2">
                                            <span className="font-medium">Delivery Fee:</span> £
                                            {deliveryFee.toFixed(2)}
                                        </p>
                                    )}
                                    {customMessageFee && customMessageFee > 0 && (
                                        <p className="mt-2">
                                            <span className="font-medium">Custom Message Fee:</span> £
                                            {customMessageFee.toFixed(2)}
                                        </p>
                                    )}
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
                                            <th className="py-3 px-4 text-center">Variant</th>
                                            <th className="py-3 px-4 text-center">Quantity</th>
                                            <th className="py-3 px-4 text-right">Price</th>
                                            <th className="py-3 px-4 text-right">Subtotal</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {cart?.map((item, i) => (
                                            <tr key={i} className="border-b">
                                                <td className="py-3 px-4 flex items-center gap-3">
                                                    {item.main_image && (
                                                        <Image
                                                            src={item.main_image}
                                                            alt={item.product_name}
                                                            width={60}
                                                            height={60}
                                                            className="rounded-md border"
                                                        />
                                                    )}
                                                    <span>{item.product_name}</span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {item.variantName || "-"}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {item.quantity}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    £{Number(item.price).toFixed(2)}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    £{(item.quantity * item.price).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                        <tfoot>
                                        <tr className="bg-gray-50 font-bold">
                                            <td colSpan={4} className="py-3 px-4 text-right">
                                                Total:
                                            </td>
                                            <td className="py-3 px-4 text-right text-lg">
                                                £{Number(order.total).toFixed(2)}
                                            </td>
                                        </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <Link
                                href="/admin/orders"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800"
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

"use client";

import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { EyeIcon } from "@heroicons/react/16/solid";
import React, { useEffect, useState } from "react";

interface Order {
    id: number;
    user_id: number;
    email: string;
    name: string;
    total: number;
    status: string;
    createdAt: string;
    order_data: Record<string, unknown>; // ✅ исправлено: вместо any
}

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [validToken, setValidToken] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                setValidToken(false);
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/orders`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.status === 401) {
                    setValidToken(false);
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                console.log("📍 Orders data:", data);

                setOrders(Array.isArray(data) ? data : []);
                setValidToken(true);
            } catch (err: unknown) { // ✅ исправлено: типизирована ошибка
                if (err instanceof Error) {
                    console.error("Fetch error:", err.message);
                    setError(err.message);
                } else {
                    console.error("Fetch error:", err);
                    setError("Failed to load orders");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Invalid Date";

            return date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "Invalid Date";
        }
    };

    if (loading) {
        return <div className="p-10 text-lg">Loading...</div>;
    }

    if (!validToken) {
        return (
            <div className="p-10 text-lg text-red-600">
                Access denied. Invalid or missing token.
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <div className="flex bg-gray-200">
                <Sidebar/>
                <div className="flex-1 p-10 ml-62">
                    <TokenTimer/>
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-6">Customer Orders</h2>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {error}
                            </div>
                        )}

                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead>
                            <tr>
                                <th className="py-2 px-4 border-b-2 text-left text-gray-600">ID</th>
                                <th className="py-2 px-4 border-b-2 text-left text-gray-600">Customer</th>
                                <th className="py-2 px-4 border-b-2 text-left text-gray-600">Email</th>
                                <th className="py-2 px-4 border-b-2 text-left text-gray-600">Total</th>
                                <th className="py-2 px-4 border-b-2 text-left text-gray-600">Payment</th>
                                <th className="py-2 px-4 border-b-2 text-left text-gray-600">Date</th>
                                <th className="py-2 px-4 border-b-2 text-center text-gray-600">View</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4">
                                        No orders found
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="border-b">
                                        <td className="py-3 px-4">#{order.id}</td>
                                        <td className="py-3 px-4">{order.name || "Guest"}</td>
                                        <td className="py-3 px-4">{order.email || "N/A"}</td>
                                        <td className="py-3 px-4">£{Number(order.total).toFixed(2)}</td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2 py-1 rounded text-white text-sm ${
                                                    order.status?.toLowerCase() === "paid" ||
                                                    order.status?.toLowerCase() === "completed"
                                                        ? "bg-green-600"
                                                        : order.status?.toLowerCase() === "pending"
                                                            ? "bg-yellow-500"
                                                            : "bg-gray-500"
                                                }`}
                                            >
                                                {order.status || "Unknown"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">{formatDate(order.createdAt)}</td>
                                        <td className="py-3 px-4 text-center">
                                            <Link
                                                href={`/admin/orders/view-orders/${order.id}`}
                                                className="bg-green-700 text-white py-2 px-4 rounded-md inline-flex items-center hover:bg-green-800"
                                            >
                                                <EyeIcon className="h-5 w-5 mr-1"/>
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>


    );
};

export default Orders;

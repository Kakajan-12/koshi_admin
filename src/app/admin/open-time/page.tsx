'use client'

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { PencilIcon, PlusCircleIcon, TrashIcon } from "@heroicons/react/16/solid";

type DataItem = {
    id: string;
    days: string;
    times: string;
};

// Тип для ошибки API
type ApiError = {
    message?: string;
    statusCode?: number;
};

const OpenTime = () => {
    const [items, setItems] = useState<DataItem[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDataId, setSelectedDataId] = useState<string | null>(null);
    const router = useRouter();

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const fetchOpenTime = useCallback(async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                router.push("/");
                return;
            }

            const response = await axios.get<DataItem[]>(`${API_URL}/api/open-time`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setItems(response.data);
        } catch (err: unknown) {
            // Исправлено: unknown вместо any
            console.error("Error fetching open time:", err);

            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<ApiError>;
                if (axiosError.response?.status === 401) {
                    router.push("/");
                } else {
                    setError(axiosError.response?.data?.message || "Ошибка при получении данных");
                }
            } else {
                setError("Неизвестная ошибка");
            }
        }
    }, [API_URL, router]);

    useEffect(() => {
        fetchOpenTime();
    }, [fetchOpenTime]);

    const handleDelete = async () => {
        if (!selectedDataId) return;

        try {
            setIsDeleting(true);

            const token = localStorage.getItem("auth_token");
            if (!token) {
                router.push("/");
                return;
            }

            await axios.delete(`${API_URL}/api/open-time/${selectedDataId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setItems(prev => prev.filter(p => p.id !== selectedDataId));
            setShowModal(false);
            setSelectedDataId(null);
        } catch (err: unknown) {
            // Исправлено: unknown вместо any
            console.error("Ошибка при удалении:", err);

            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<ApiError>;
                setError(axiosError.response?.data?.message || "Ошибка при удалении");
            } else {
                setError("Неизвестная ошибка");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    if (error) {
        return <div className="p-10 text-red-600">{error}</div>;
    }

    return (
        <div className="container mx-auto">
            <div className="flex bg-gray-200">
                <Sidebar />
                <div className="flex-1 p-10 ml-62">
                    <TokenTimer />

                    <div className="mt-8">
                        <div className="w-full flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Open time</h2>

                            <Link
                                href="/admin/open-time/add-open-time"
                                className="bg text-white h-fit py-2 px-6 rounded-md flex items-center"
                            >
                                <PlusCircleIcon className="w-6 h-6 mr-2" />
                                Add
                            </Link>
                        </div>

                        <table className="min-w-full bg-white border border-gray-200 rounded-lg mt-4">
                            <thead>
                            <tr className="divide-x divide-gray-200">
                                <th className="py-2 px-4 border-b text-left text-gray-600">Days</th>
                                <th className="py-2 px-4 border-b text-left text-gray-600">Times</th>
                                <th className="py-2 px-4 border-b text-center text-gray-600">Edit</th>
                                <th className="py-2 px-4 border-b text-center text-gray-600">Delete</th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-4">
                                        No data available
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="divide-x divide-gray-200">
                                        <td className="py-4 px-4">{item.days}</td>
                                        <td className="py-4 px-4">{item.times}</td>

                                        <td className="py-4 px-4 text-center">
                                            <Link
                                                href={`/admin/open-time/edit-open-time/${item.id}`}
                                                className="inline-flex items-center text-white border-2 border-bg rounded-md bg px-4 py-1"
                                            >
                                                <PencilIcon className="w-5 h-5 mr-2" />
                                                Edit
                                            </Link>
                                        </td>

                                        <td className="py-4 px-4 text-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedDataId(item.id);
                                                    setShowModal(true);
                                                }}
                                                className="inline-flex items-center text-white bg-red-600 px-4 py-1 rounded-md"
                                            >
                                                <TrashIcon className="w-5 h-5 mr-2" />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {showModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                                <h2 className="text-xl font-semibold mb-4">Remove content</h2>
                                <p className="mb-6">Are you sure?</p>

                                <div className="flex justify-end space-x-4">
                                    <button
                                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                                        onClick={() => {
                                            setShowModal(false);
                                            setSelectedDataId(null);
                                        }}
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OpenTime;
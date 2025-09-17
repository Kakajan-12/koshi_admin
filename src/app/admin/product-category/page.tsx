'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import {EyeIcon, PencilIcon, PlusCircleIcon, TrashIcon} from "@heroicons/react/16/solid";
import Image from "next/image";

type DataItem = {
    id: string;
    image: string;
    name: string;
};

const ProductCategory = () => {
    const [cat, setCat] = useState<DataItem[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDataId, setSelectedDataId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/product-category`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setCat(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError("Ошибка при получении данных");

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push("/");
                }
            }
        };

        fetchData();
    }, [router]);

    const handleDelete = async () => {
        if (!selectedDataId) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/product-category/${selectedDataId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setCat(prev => prev.filter(p => p.id !== selectedDataId));
            setIsDeleting(false);
            setShowModal(false);
            setSelectedDataId(null);
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            setIsDeleting(false);
            setShowModal(false);
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex bg-gray-200">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <div className="mt-8">
                    <div className="w-full flex justify-between">
                        <h2 className="text-2xl font-bold mb-4">Product Category</h2>
                        <Link href="/admin/product-category/add-product-category"
                              className="bg text-white h-fit py-2 px-8 rounded-md cursor-pointer flex items-center">
                            <PlusCircleIcon className="size-6" color="#ffffff" />
                            <div className="ml-2">Add</div>
                        </Link>
                    </div>
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                        <tr className="divide-x-1 divide-gray-200">
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Image</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-left text-gray-600">Name</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-center text-gray-600">Edit</th>
                            <th className="py-2 px-4 border-b-2 border-gray-200 text-center text-gray-600">Delete</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y-1 divide-gray-200">
                        {cat.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-4">No data available</td>
                            </tr>
                        ) : (
                            cat.map((cat) => (
                                <tr key={cat.id} className="divide-x-1 divide-gray-200">
                                    <td className="py-4 px-4">
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/${cat.image}`.replace(/\\/g, '/')}
                                            alt={`Content ${cat.id}`}
                                            width={200}
                                            height={200}
                                        />
                                    </td>
                                    <td className="py-4 px-4">
                                        <div>{cat.name}</div>
                                    </td>
                                    <td className="py-4 px-4 h-full">
                                        <div className="flex justify-center items-center h-full">
                                            <Link
                                                href={`/admin/product-category/edit-product-category/${cat.id}`}
                                                className="flex items-center text-white border-2 border-bg rounded-md bg w-fit px-4 py-1 cursor-pointer"
                                            >
                                                <PencilIcon className="w-5 h-5 mr-2"/>
                                                Edit
                                            </Link>
                                        </div>
                                    </td>

                                    <td className="py-4 px-4">
                                        <div className="w-full flex justify-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedDataId(cat.id);
                                                    setShowModal(true);
                                                }}
                                                className="flex items-center text-white flex justify-center rounded-md w-fit bg-red-600 px-4 py-1 cursor-pointer"
                                            >
                                                <TrashIcon className="w-5 h-5 mr-2"/>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Remove content?</h2>
                            <p className="mb-6">Are u sure?</p>
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
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCategory;

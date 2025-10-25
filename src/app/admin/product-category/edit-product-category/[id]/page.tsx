'use client';
import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import axios from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import {DocumentIcon} from "@heroicons/react/16/solid";
import Image from "next/image";

const EditCategory = () => {
    const {id} = useParams();
    const router = useRouter();

    type CategoryData = {
        name: string;
        image: string;
    };

    const [data, setData] = useState<CategoryData>({
        image: '',
        name: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/product-category/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.id) {
                    const rawData = response.data;
                    setData({
                        ...rawData,
                    });

                    setLoading(false);
                } else {
                    throw new Error("Данные не найдены");
                }
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Ошибка при загрузке');
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');

            const formData = new FormData();
            formData.append('name', data.name);

            if (imageFile) {
                formData.append('image', imageFile);
            } else {
                formData.append('image', data.image);
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/product-category/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            router.push(`/admin/product-category/`);
        } catch (err) {
            console.error(err);
            setError('Ошибка при сохранении');
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container mx-auto">
            <div className="flex bg-gray-200 min-h-screen">
                <Sidebar/>
                <div className="flex-1 p-10 ml-62">
                    <TokenTimer/>
                    <div className="mt-8">
                        <h1 className="text-2xl font-bold mb-4">Edit Product Category</h1>
                        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                            {data.image && (
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Current image:</label>
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image.replace('\\', '/')}`}
                                        alt="Category"
                                        width={200}
                                        height={200}
                                        className="w-64 rounded"
                                    />
                                </div>
                            )}
                            <div className="mb-4 flex space-x-4">
                                <div className="w-full">
                                    <div className="mb-4">
                                        <label htmlFor="image" className="block font-semibold mb-2">New image:</label>
                                        <input
                                            type="file"
                                            id="image"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setImageFile(e.target.files[0]);
                                                }
                                            }}
                                            className="border border-gray-300 rounded p-2 w-full"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4 w-full">
                                    <label className="block text-gray-700 font-semibold mb-2">Category Name:</label>
                                    <input
                                        name="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData((prev) => ({
                                                ...prev,
                                                name: String(e.target.value),
                                            }))
                                        }
                                        type="text"
                                        required
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="bg text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
                            >
                                <DocumentIcon className="size-5 mr-2"/>
                                Save
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>


    );
};

export default EditCategory;
